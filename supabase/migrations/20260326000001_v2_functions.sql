-- Athlo V2: RPCs for Scheduling and Emergency
-- Date: 2026-03-26

-- 1. Generate Slots from Template (Idempotent 14-day roller)
CREATE OR REPLACE FUNCTION generate_slots_from_template(p_physio_id UUID)
RETURNS void AS $$
DECLARE
  v_template RECORD;
  v_date DATE;
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
  v_hour INTEGER;
BEGIN
  -- Roll forward 14 days starting tomorrow
  FOR i IN 1..14 LOOP
    v_date := CURRENT_DATE + i;
    
    -- In PostgreSQL, EXTRACT(DOW) returns 0 (Sun) to 6 (Sat).
    -- Our UI uses 0=Mon, ..., 6=Sun. So we map: Mon=1->0, Sun=0->6
    v_day_of_week := CASE EXTRACT(DOW FROM v_date)
                     WHEN 0 THEN 6
                     ELSE EXTRACT(DOW FROM v_date) - 1
                     END;

    -- Check all active templates for this physio on this UI day of week
    FOR v_template IN 
      SELECT * FROM schedule_templates 
      WHERE physio_id = p_physio_id AND is_active = true AND day_of_week = v_day_of_week
    LOOP
      -- Generate hourly slots between start_hour and end_hour
      FOR v_hour IN v_template.start_hour .. (v_template.end_hour - 1) LOOP
        v_start_time := make_time(v_hour, 0, 0);
        v_end_time := make_time(v_hour + 1, 0, 0);

        -- Insert only if a slot doesn't already exist for this physio/date/time
        INSERT INTO time_slots (physio_id, slot_date, start_time, end_time, status, source)
        VALUES (p_physio_id, v_date, v_start_time, v_end_time, 'open', 'template')
        ON CONFLICT (physio_id, slot_date, start_time) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Atomic Slot Booking (prevents double-booking via row-level lock)
CREATE OR REPLACE FUNCTION book_slot_atomic(
  p_slot_id UUID, 
  p_athlete_id UUID, 
  p_mode TEXT, 
  p_injury TEXT
)
RETURNS json AS $$
DECLARE
  v_slot RECORD;
  v_session_id UUID;
  v_rate NUMERIC;
BEGIN
  -- 1. Retrieve the slot inside a ROW LEVEL LOCK
  SELECT * INTO v_slot 
  FROM time_slots 
  WHERE id = p_slot_id 
  FOR UPDATE;

  -- 2. Verify existence and applicability
  IF v_slot IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Slot not found');
  END IF;

  IF v_slot.status != 'open' THEN
    RETURN json_build_object('success', false, 'error', 'Slot was just taken by another user');
  END IF;

  -- 3. Get Physio's base rate
  SELECT consultation_rate INTO v_rate
  FROM physio_profiles
  WHERE id = v_slot.physio_id;

  -- 4. Create the Session
  INSERT INTO sessions (
    physio_id, athlete_id, scheduled_at, status, amount, consultation_mode, injury_description, session_type, session_origin, slot_id
  ) VALUES (
    v_slot.physio_id, p_athlete_id, 
    (v_slot.slot_date + v_slot.start_time), -- Turn DATE + TIME into TIMESTAMPTZ
    'upcoming', v_rate, p_mode, p_injury, 
    'marketplace', 'marketplace', v_slot.id
  ) RETURNING id INTO v_session_id;

  -- 5. Update the Slot
  UPDATE time_slots 
  SET status = 'booked', session_id = v_session_id 
  WHERE id = p_slot_id;

  RETURN json_build_object('success', true, 'session_id', v_session_id);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
