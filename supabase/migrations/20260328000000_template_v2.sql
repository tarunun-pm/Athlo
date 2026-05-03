-- Athlo V2: Template Duration, Buffer, and Improved Slot Generation
-- Date: 2026-03-28
-- Covers: TC-04, TC-05, TC-06, TC-07

-- 1. Add session_duration and buffer columns to schedule_templates
ALTER TABLE schedule_templates ADD COLUMN IF NOT EXISTS session_duration_minutes INTEGER DEFAULT 60;
ALTER TABLE schedule_templates ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER DEFAULT 0;

-- 2. Rewrite generate_slots_from_template to support duration + buffer
-- This version:
--   - Deletes future OPEN template-sourced slots before regenerating (TC-06)
--   - Uses INTERVAL math for variable durations (TC-06/TC-07)
--   - Includes today (day 0) filtering out past times (TC-05)
--   - Loops 0..14 for exactly 15 calendar days including today

CREATE OR REPLACE FUNCTION generate_slots_from_template(p_physio_id UUID)
RETURNS void AS $$
DECLARE
  v_template RECORD;
  v_date DATE;
  v_pg_dow INTEGER;      -- PostgreSQL DOW: 0=Sun, 1=Mon, ..., 6=Sat
  v_ui_dow INTEGER;       -- Our UI DOW: 0=Sun, 1=Mon, ..., 6=Sat (DB stores this)
  v_current_time TIME;
  v_end_time TIME;
  v_slot_end TIME;
  v_duration INTERVAL;
  v_buffer INTERVAL;
BEGIN
  -- Step 1: Delete all future OPEN template-sourced slots for this physio
  -- This ensures changed durations/hours take effect immediately (TC-06)
  -- BOOKED, PENDING_INVITE, and BLOCKED slots are untouched (TC-52)
  DELETE FROM time_slots
  WHERE physio_id = p_physio_id
    AND source = 'template'
    AND status = 'open'
    AND slot_date >= CURRENT_DATE;

  -- Step 2: Roll forward 0..14 days (today through 14 days ahead = 15 days, TC-05)
  FOR i IN 0..14 LOOP
    v_date := CURRENT_DATE + i;

    -- PostgreSQL EXTRACT(DOW): 0=Sunday, 1=Monday, ..., 6=Saturday
    v_pg_dow := EXTRACT(DOW FROM v_date)::INTEGER;

    -- Our DB schedule_templates.day_of_week uses: 0=Sunday, 1=Monday, ..., 6=Saturday
    -- The V2 migration schema had 0=Mon but the actual DB data uses standard DOW
    -- We match against what's stored in DB
    v_ui_dow := v_pg_dow;

    -- Check all active templates for this physio on this day of week
    FOR v_template IN
      SELECT * FROM schedule_templates
      WHERE physio_id = p_physio_id AND is_active = true AND day_of_week = v_ui_dow
    LOOP
      -- Calculate intervals from template columns
      v_duration := (COALESCE(v_template.session_duration_minutes, 60) || ' minutes')::INTERVAL;
      v_buffer := (COALESCE(v_template.buffer_minutes, 0) || ' minutes')::INTERVAL;

      -- Start generating slots from start_hour to end_hour
      v_current_time := make_time(v_template.start_hour, 0, 0);
      v_end_time := make_time(v_template.end_hour, 0, 0);

      WHILE (v_current_time + v_duration) <= v_end_time LOOP
        v_slot_end := v_current_time + v_duration;

        -- For today (i=0), skip slots whose start time has already passed
        IF i = 0 AND v_current_time <= CURRENT_TIME THEN
          v_current_time := v_current_time + v_duration + v_buffer;
          CONTINUE;
        END IF;

        -- Insert only if no slot exists at this exact position (idempotent)
        INSERT INTO time_slots (physio_id, slot_date, start_time, end_time, status, source)
        VALUES (p_physio_id, v_date, v_current_time, v_slot_end, 'open', 'template')
        ON CONFLICT (physio_id, slot_date, start_time) DO NOTHING;

        -- Advance by duration + buffer for next slot
        v_current_time := v_current_time + v_duration + v_buffer;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
