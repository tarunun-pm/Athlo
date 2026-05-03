-- Athlo V2: Ad-Hoc Slot Creation RPC
-- Date: 2026-03-28
-- Covers: TC-12, TC-13, TC-14, TC-15, TC-16

-- Add consultation_mode column to time_slots, allowing singular text or array if we wanted.
-- Defaulting to an array so a slot can hold multiple mode options.
ALTER TABLE time_slots ADD COLUMN IF NOT EXISTS consultation_mode TEXT;

-- RPC to create a verified, conflict-free ad-hoc time slot
CREATE OR REPLACE FUNCTION create_adhoc_slot(
    p_physio_id UUID,
    p_slot_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_consultation_mode TEXT,
    p_client_email TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_conflict RECORD;
    v_new_slot_id UUID;
    v_invite_id UUID;
BEGIN
    -- 1. Overlap Check
    -- Strict overlap check: Ensure no existing slot of any status overlaps with this time range for this physio and date.
    SELECT id, status, start_time, end_time INTO v_conflict
    FROM time_slots
    WHERE physio_id = p_physio_id
      AND slot_date = p_slot_date
      AND (
          (p_start_time >= start_time AND p_start_time < end_time) OR
          (p_end_time > start_time AND p_end_time <= end_time) OR
          (start_time >= p_start_time AND end_time <= p_end_time)
      )
    LIMIT 1;

    -- Return precise conflict message
    IF FOUND THEN
        IF v_conflict.status = 'open' THEN
            RETURN json_build_object('success', false, 'status', 409, 'message', 'Conflicts with another unbooked open slot from ' || v_conflict.start_time || ' to ' || v_conflict.end_time);
        ELSIF v_conflict.status = 'booked' THEN
            RETURN json_build_object('success', false, 'status', 409, 'message', 'Conflicts with an existing booked session from ' || v_conflict.start_time || ' to ' || v_conflict.end_time);
        ELSIF v_conflict.status = 'pending_invite' THEN
            RETURN json_build_object('success', false, 'status', 409, 'message', 'Conflicts with a pending invite slot from ' || v_conflict.start_time || ' to ' || v_conflict.end_time);
        ELSE
            RETURN json_build_object('success', false, 'status', 409, 'message', 'Overlaps with another block on your schedule.');
        END IF;
    END IF;

    -- 2. Insert the slot
    INSERT INTO time_slots (
        physio_id,
        slot_date,
        start_time,
        end_time,
        status,
        source,
        consultation_mode
    ) VALUES (
        p_physio_id,
        p_slot_date,
        p_start_time,
        p_end_time,
        CASE WHEN p_client_email IS NOT NULL THEN 'pending_invite'::slot_status ELSE 'open'::slot_status END,
        'adhoc',
        p_consultation_mode
    ) RETURNING id INTO v_new_slot_id;

    -- 3. If a client email is provided, automatically trigger the invite flow
    IF p_client_email IS NOT NULL THEN
        -- Replicate existing invite logic for Ad-hoc slots
        INSERT INTO client_invites (
            physio_id,
            client_email,
            slot_id,
            status
        ) VALUES (
            p_physio_id,
            p_client_email,
            v_new_slot_id,
            'pending'
        ) RETURNING id INTO v_invite_id;

        -- Update the time_slot with the invite_id (this ties them together)
        UPDATE time_slots SET invite_id = v_invite_id WHERE id = v_new_slot_id;
        
        RETURN json_build_object('success', true, 'status', 201, 'message', 'Ad-hoc slot created and invite sent', 'slot_id', v_new_slot_id, 'invite_id', v_invite_id);
    END IF;

    -- No email provided
    RETURN json_build_object('success', true, 'status', 201, 'message', 'Ad-hoc slot created successfully', 'slot_id', v_new_slot_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
