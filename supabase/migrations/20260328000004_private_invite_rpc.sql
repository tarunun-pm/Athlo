-- Athlo V2: Private Client Invite Flow and Commission Tracking
-- Date: 2026-03-28
-- Covers: TC-22, TC-23, TC-28, TC-30, TC-55

-- Add a minimum rate constraint to the sessions table (Rs. 200 minimum, TC-28)
ALTER TABLE sessions ADD CONSTRAINT check_minimum_rate CHECK (amount >= 200);

-- RPC to create a private client invite
CREATE OR REPLACE FUNCTION create_session_invite(
    p_physio_id UUID,
    p_client_email TEXT,
    p_client_name TEXT,
    p_slot_id UUID,
    p_rate INTEGER,
    p_consultation_mode TEXT
)
RETURNS JSON AS $$
DECLARE
    v_invite_id UUID;
    v_slot_status slot_status;
BEGIN
    -- Verify the slot is open
    SELECT status INTO v_slot_status
    FROM time_slots
    WHERE id = p_slot_id AND physio_id = p_physio_id;

    IF v_slot_status != 'open' THEN
        RETURN json_build_object('success', false, 'message', 'This time slot is no longer available. Please select another time.');
    END IF;

    -- Insert the invite record with the client's identifying information
    INSERT INTO client_invites(
        physio_id, 
        client_email, 
        slot_id, 
        status
    )
    VALUES (
        p_physio_id, 
        p_client_email, 
        p_slot_id, 
        'pending'
    )
    RETURNING id INTO v_invite_id;

    -- Update the time slot to reserve it for the invite
    UPDATE time_slots
    SET status = 'pending_invite',
        invite_id = v_invite_id
    WHERE id = p_slot_id;

    -- If there's a need to immediately link a session for tracking, we create a provisional session.
    -- However, standard flow is to wait for the client to accept. We'll store the provisional rate 
    -- and mode details on the invite or pass them as params when accepted.
    
    RETURN json_build_object('success', true, 'message', 'Private client invite sent successfully.', 'invite_id', v_invite_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TC-55: Hide internal notes from athletes.
-- Create a secure view for athletes that explicitly excludes 'internal_note'
CREATE OR REPLACE VIEW secure_athlete_sessions AS
SELECT 
    id, physio_id, athlete_id, scheduled_at, status, consultation_mode, 
    daily_room_url, amount, session_type, session_origin,
    duration_minutes, rate_type, parent_session_id, series_id, slot_id,
    injury_description, created_at
FROM sessions;

-- Grant permissions to read this view (the API layer should query this view instead of the table for athletes)
GRANT SELECT ON secure_athlete_sessions TO authenticated;
