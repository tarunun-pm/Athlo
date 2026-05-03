-- Athlo V2: Emergency Attempt Expiry Cron
-- Date: 2026-03-28
-- Covers: TC-46

-- 1. Helper Function: Expire stale emergency attempts
-- This function looks for any attempt that has passed its `expires_at` (10 minutes)
-- but hasn't received a response (physio ignored it).
-- It marks it expired and explicitly calls the cascade function to route to the next physio.
CREATE OR REPLACE FUNCTION expire_stale_emergency_attempts()
RETURNS void AS $$
DECLARE
    v_stale RECORD;
BEGIN
    FOR v_stale IN
        SELECT id, request_id
        FROM emergency_request_attempts
        WHERE expires_at < now() AND response IS NULL
    LOOP
        -- 1. Update the attempt to 'expired'
        UPDATE emergency_request_attempts
        SET response = 'expired', responded_at = now()
        WHERE id = v_stale.id;
        
        -- 2. Call the cascade function to pass to the next physio
        -- We ignore the return value here, just fire and forget the cascade logic inside Postgres.
        PERFORM cascade_emergency_request(v_stale.request_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Set up the CRON job (requires pg_cron)
-- This tries to run every minute
-- Note: Supabase's pg_cron extension needs to be active.
-- SELECT cron.schedule('expire_emergencies', '* * * * *', 'SELECT expire_stale_emergency_attempts()');
