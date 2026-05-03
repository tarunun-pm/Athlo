-- Migration: Emergency RPCs and Cascading Logic
-- This file contains the server-side logic for matching athletes with physios and handling accepts/declines

-- 1. Helper Function: Find available emergency physios
CREATE OR REPLACE FUNCTION find_emergency_physios(
    p_lat NUMERIC, 
    p_lng NUMERIC, 
    p_radius_km INTEGER, 
    p_window_hours INTEGER,
    p_exclude_physio_ids UUID[]
)
RETURNS TABLE (physio_id UUID, distance_km NUMERIC) AS $$
BEGIN
    -- For MVP, we ignore spatial POSTGIS queries and just return online/available physios
    -- who have 'emergency_opt_in' = true and are not in the exclude list.
    -- In a real app, you'd use earthdistance or postgis here.
    
    RETURN QUERY
    SELECT 
        pp.id as physio_id,
        0.0::NUMERIC as distance_km -- Mock distance
    FROM physio_profiles pp
    WHERE pp.verification_status = 'approved'
      AND pp.emergency_opt_in = true
      AND pp.id != ALL(p_exclude_physio_ids)
    -- We also need to check if they have an open slot in the next 'window_hours'
    AND EXISTS (
        SELECT 1 FROM time_slots ts
        WHERE ts.physio_id = pp.id
          AND ts.status = 'open'
          AND ts.slot_date = CURRENT_DATE
          AND ts.start_time > CURRENT_TIME
          AND ts.start_time <= (CURRENT_TIME + (p_window_hours || ' hours')::interval)
    )
    ORDER BY random(); -- Simplistic load balancing for MVP
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Core RPC: Cascade the request
CREATE OR REPLACE FUNCTION cascade_emergency_request(p_request_id UUID)
RETURNS JSON AS $$
DECLARE
    v_req RECORD;
    v_excluded UUID[];
    v_next_physio UUID;
    v_attempt_id UUID;
BEGIN
    -- Get request
    SELECT * INTO v_req FROM emergency_requests WHERE id = p_request_id;
    
    IF v_req IS NULL OR v_req.status != 'pending' THEN
        RETURN json_build_object('success', false, 'message', 'Request not pending or not found');
    END IF;

    -- Get physios already attempted
    SELECT array_agg(physio_id) INTO v_excluded 
    FROM emergency_request_attempts 
    WHERE request_id = p_request_id;
    
    IF v_excluded IS NULL THEN
        v_excluded := '{}'::UUID[];
    END IF;

    -- Find next physio
    SELECT physio_id INTO v_next_physio 
    FROM find_emergency_physios(0, 0, v_req.search_radius_km, v_req.search_window_hours, v_excluded)
    LIMIT 1;

    IF v_next_physio IS NULL THEN
        -- No more physios available
        UPDATE emergency_requests 
        SET status = 'no_match', resolved_at = now() 
        WHERE id = p_request_id;
        
        -- Trigger notification to athlete that no match found
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (v_req.athlete_id, 'emergency_no_match', 'No Specialists Available', 'We could not find an available specialist right now.', '/athlete/search');
        
        RETURN json_build_object('success', true, 'status', 'no_match');
    END IF;

    -- Create attempt for the next physio
    INSERT INTO emergency_request_attempts (
        request_id, physio_id, expires_at
    ) VALUES (
        p_request_id, v_next_physio, now() + interval '10 minutes'
    ) RETURNING id INTO v_attempt_id;

    -- Update request
    UPDATE emergency_requests 
    SET current_physio_id = v_next_physio, attempt_count = attempt_count + 1
    WHERE id = p_request_id;

    -- Send notification to physio
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (v_next_physio, 'emergency_request_received', 'EMERGENCY REQUEST', 'An athlete needs immediate assistance.', '/physio/dashboard');

    RETURN json_build_object('success', true, 'status', 'cascaded', 'physio_id', v_next_physio, 'attempt_id', v_attempt_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Core RPC: Accept the request
CREATE OR REPLACE FUNCTION accept_emergency_request(p_attempt_id UUID)
RETURNS JSON AS $$
DECLARE
    v_att RECORD;
    v_req RECORD;
    v_slot RECORD;
    v_physio RECORD;
    v_session_id UUID;
    v_surcharge INTEGER := 500;
BEGIN
    SELECT * INTO v_att FROM emergency_request_attempts WHERE id = p_attempt_id FOR UPDATE;
    SELECT * INTO v_req FROM emergency_requests WHERE id = v_att.request_id FOR UPDATE;
    SELECT * INTO v_physio FROM physio_profiles WHERE id = v_att.physio_id;

    IF v_att.response IS NOT NULL OR v_att.expires_at < now() THEN
        RETURN json_build_object('success', false, 'message', 'Request already processed or expired');
    END IF;

    IF v_req.status != 'pending' THEN
        RETURN json_build_object('success', false, 'message', 'Request already accepted by someone else');
    END IF;

    -- Find the physio's next immediate open slot to book
    SELECT * INTO v_slot FROM time_slots 
    WHERE physio_id = v_att.physio_id 
      AND status = 'open' 
      AND slot_date = CURRENT_DATE 
      AND start_time > CURRENT_TIME
    ORDER BY start_time ASC LIMIT 1 FOR UPDATE;

    IF v_slot IS NULL THEN
        -- Slot disappeared while they were accepting
        UPDATE emergency_request_attempts SET response = 'declined', responded_at = now() WHERE id = p_attempt_id;
        PERFORM cascade_emergency_request(v_req.id);
        RETURN json_build_object('success', false, 'message', 'Your slot just filled up. Passed to next physio.');
    END IF;

    -- Cap logic
    IF v_physio.consultation_rate >= 2500 THEN
        v_surcharge := 0;
    ELSIF v_physio.consultation_rate + v_surcharge > 3000 THEN
        v_surcharge := 3000 - v_physio.consultation_rate;
    END IF;

    -- Create session
    INSERT INTO sessions (
        physio_id, athlete_id, slot_id, scheduled_at, amount, status, 
        consultation_mode, session_type, session_origin, emergency_surcharge, injury_description
    ) VALUES (
        v_att.physio_id, v_req.athlete_id, v_slot.id, (v_slot.slot_date || ' ' || v_slot.start_time)::timestamp,
        v_physio.consultation_rate, 'upcoming', 'In-Clinic', 'marketplace', 'marketplace', v_surcharge, v_req.description
    ) RETURNING id INTO v_session_id;

    -- Update slot
    UPDATE time_slots SET status = 'booked', session_id = v_session_id WHERE id = v_slot.id;

    -- Update attempt & request
    UPDATE emergency_request_attempts SET response = 'accepted', responded_at = now() WHERE id = p_attempt_id;
    UPDATE emergency_requests 
    SET status = 'accepted', accepted_physio_id = v_att.physio_id, session_id = v_session_id, resolved_at = now() 
    WHERE id = v_req.id;

    -- Notify Athlete
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (v_req.athlete_id, 'emergency_request_accepted', 'Match Found!', 'Dr. ' || v_physio.last_name || ' accepted your request.', '/athlete/sessions');

    RETURN json_build_object('success', true, 'session_id', v_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
