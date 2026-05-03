-- Migration: Auto-calculate net earnings on session completion or creation
-- This tracking handles the 15% marketplace vs 5% private client commission rules.
-- This does not process payments; it only maintains data integrity for future billing.

CREATE OR REPLACE FUNCTION calculate_net_earnings()
RETURNS TRIGGER AS $$
DECLARE
    v_commission_amt NUMERIC;
BEGIN
    -- Only calculate if amount is present
    IF NEW.amount IS NOT NULL THEN
        -- Calculate the commission value based on the rate
        v_commission_amt := (NEW.amount * NEW.commission_rate) / 100.0;
        
        -- Net physio earnings = Base amount - Platform Commission + 100% of Emergency Surcharge
        NEW.net_physio_earnings := NEW.amount - v_commission_amt + COALESCE(NEW.emergency_surcharge, 0);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate on INSERT or update to amount/commission
DROP TRIGGER IF EXISTS trg_calculate_earnings ON sessions;

CREATE TRIGGER trg_calculate_earnings
BEFORE INSERT OR UPDATE OF amount, commission_rate, emergency_surcharge
ON sessions
FOR EACH ROW
EXECUTE FUNCTION calculate_net_earnings();
