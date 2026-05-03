-- Athlo V2: Time Blocking and Conflict Checks
-- Date: 2026-03-28
-- Covers: TC-18, TC-19, TC-54

-- RPC to check for conflicts before blocking off a day or time interval
CREATE OR REPLACE FUNCTION check_block_conflicts(
    p_physio_id UUID,
    p_target_date DATE
)
RETURNS JSON AS $$
DECLARE
    v_conflicts JSON;
BEGIN
    -- We want to find any slot on this date for this physio that is NOT 'open'
    -- This includes 'booked' sessions and 'pending_invite' slots (TC-54)
    SELECT json_agg(json_build_object(
        'slot_id', ts.id,
        'status', ts.status,
        'start_time', ts.start_time,
        'end_time', ts.end_time,
        'session_id', ts.session_id,
        'invite_id', ts.invite_id
    )) INTO v_conflicts
    FROM time_slots ts
    WHERE ts.physio_id = p_physio_id
      AND ts.slot_date = p_target_date
      AND ts.status IN ('booked', 'pending_invite');

    IF v_conflicts IS NULL THEN
        RETURN json_build_object('has_conflicts', false, 'conflicts', '[]');
    ELSE
        RETURN json_build_object('has_conflicts', true, 'conflicts', v_conflicts);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to apply a full day block (only clears OPEN slots, converts to BLOCKED)
-- Does NOT touch booked or pending_invite slots
CREATE OR REPLACE FUNCTION apply_day_block(
    p_physio_id UUID,
    p_target_date DATE
)
RETURNS JSON AS $$
BEGIN
    -- Only open slots can be blocked safely.
    -- The frontend should ideally force the physio to clear the 'booked/pending_invite' slots
    -- manually (TC-18, TC-19) before allowing them to run this.
    UPDATE time_slots
    SET status = 'blocked'
    WHERE physio_id = p_physio_id
      AND slot_date = p_target_date
      AND status = 'open';
      
    RETURN json_build_object('success', true, 'message', 'Day blocked successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
