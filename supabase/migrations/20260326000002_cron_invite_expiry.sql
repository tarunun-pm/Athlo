-- Athlo V2: Cron Job for Releasing Expired Invites
-- Requires pg_cron extension enabled in Supabase

-- The objective is to release slots back to 'open' if a 'pending' invite passes its 'expires_at' (7 days).

-- Create a helper function to perform the cleanup
CREATE OR REPLACE FUNCTION release_expired_invites()
RETURNS void AS $$
DECLARE
  expired_record RECORD;
BEGIN
  -- 1. Find all invites that are pending but expired
  FOR expired_record IN 
    SELECT id, slot_id 
    FROM client_invites 
    WHERE status = 'pending' AND expires_at < now()
  LOOP
    
    -- 2. Update the invite status to expired
    UPDATE client_invites 
    SET status = 'expired' 
    WHERE id = expired_record.id;
    
    -- 3. Release the associated time slot back to open
    IF expired_record.slot_id IS NOT NULL THEN
      UPDATE time_slots 
      SET status = 'open', invite_id = NULL 
      WHERE id = expired_record.slot_id AND status = 'pending_invite';
    END IF;

  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To execute pg_cron schedule via SQL in Supabase:
-- SELECT cron.schedule('release_expired_invites_cron', '0 * * * *', 'SELECT release_expired_invites()');
-- This runs the function at the top of every hour.
