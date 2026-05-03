-- Athlo V2: Follow-Up Sessions and Recurring Conflict Tracking
-- Date: 2026-03-28
-- Covers: TC-32, TC-33, TC-34, TC-35, TC-36, TC-37

-- RPC check_recurring_series handles conflict logic in TS, returning dates that are blocked/booked for the UI wizard.
-- The core requirement here is a robust creation tool that applies the parent commission rates

CREATE OR REPLACE FUNCTION create_follow_up_session(
    p_parent_session_id UUID,
    p_physio_id UUID,
    p_athlete_id UUID,
    p_slot_id UUID,
    p_rate INTEGER,
    p_consultation_mode TEXT,
    p_series_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_parent_session RECORD;
    v_new_session_id UUID;
    v_slot_status slot_status;
BEGIN
    -- Pull the parent session to inherit commission origin
    SELECT session_origin INTO v_parent_session 
    FROM sessions 
    WHERE id = p_parent_session_id;

    -- Verify the slot is open
    SELECT status INTO v_slot_status 
    FROM time_slots 
    WHERE id = p_slot_id FOR UPDATE;

    IF v_slot_status != 'open' THEN
        RETURN json_build_object('success', false, 'status', 409, 'message', 'The selected time slot is no longer available.');
    END IF;

    -- Create the new follow-up session inheriting the parents session origin (for commission routing)
    INSERT INTO sessions(
        parent_session_id,
        physio_id,
        athlete_id,
        slot_id,
        amount,
        consultation_mode,
        session_type,
        session_origin,
        series_id,
        status,
        scheduled_at
    ) 
    SELECT 
        p_parent_session_id,
        p_physio_id,
        p_athlete_id,
        p_slot_id,
        p_rate,
        p_consultation_mode,
        'follow_up',
        v_parent_session.session_origin,
        p_series_id,
        'upcoming',
        (ts.slot_date + ts.start_time)
    FROM time_slots ts
    WHERE ts.id = p_slot_id
    RETURNING id INTO v_new_session_id;

    -- Update the time slot
    UPDATE time_slots
    SET status = 'booked', session_id = v_new_session_id
    WHERE id = p_slot_id;

    RETURN json_build_object('success', true, 'message', 'Follow up scheduled successfully', 'session_id', v_new_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
