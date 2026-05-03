-- Athlo V2: Session Cancellation Logic
-- Date: 2026-03-28
-- Covers: TC-11, TC-53

-- Function to handle session cancellations
CREATE OR REPLACE FUNCTION handle_session_cancellation()
RETURNS TRIGGER AS $$
BEGIN
    -- If the session status changes to 'cancelled'
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        -- 1. Free up the associated time slot
        UPDATE time_slots 
        SET status = 'open', session_id = NULL
        WHERE id = NEW.slot_id AND session_id = NEW.id;
        
        -- 2. Clean up any related client_invites if this was a pending or confirmed invite
        -- (Optional: might be useful if the cancellation happens before the session, 
        -- but typically invites lead to booked sessions. This is just a safeguard.)
        UPDATE client_invites 
        SET status = 'expired'
        WHERE slot_id = NEW.slot_id AND status = 'accepted';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to watch for cancellations
DROP TRIGGER IF EXISTS tr_handle_session_cancellation ON sessions;
CREATE TRIGGER tr_handle_session_cancellation
AFTER UPDATE OF status ON sessions
FOR EACH ROW
EXECUTE FUNCTION handle_session_cancellation();
