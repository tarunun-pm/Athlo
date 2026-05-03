-- Athlo V2: Scheduling & Emergency System Migration
-- Date: 2026-03-26
-- Description: Migration to granular hourly slots, weekly templates, and emergency consultation system.

-- 1. Enums
CREATE TYPE slot_status AS ENUM ('open', 'booked', 'pending_invite', 'blocked');
CREATE TYPE session_type AS ENUM ('marketplace', 'private_client', 'follow_up');
CREATE TYPE session_origin AS ENUM ('marketplace', 'private_client');
CREATE TYPE rate_type AS ENUM ('standard', 'discounted', 'trial');
CREATE TYPE emergency_urgency AS ENUM ('critical', 'moderate', 'can_wait');
CREATE TYPE emergency_request_status AS ENUM ('pending', 'accepted', 'declined', 'expired', 'no_match');
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired');

-- 2. Schedule Templates (Weekly Recurring Pattern)
CREATE TABLE schedule_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physio_id UUID REFERENCES physio_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Mon, 6=Sun
  start_hour INTEGER CHECK (start_hour BETWEEN 0 AND 23),
  end_hour INTEGER CHECK (end_hour BETWEEN 1 AND 24),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_hour > start_hour)
);

-- 3. Time Slots (Actual date-specific slots)
CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physio_id UUID REFERENCES physio_profiles(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status slot_status DEFAULT 'open',
  source TEXT DEFAULT 'template', -- 'template' | 'adhoc'
  session_id UUID, -- FK to sessions, added later
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_negative_duration CHECK (end_time > start_time)
);
CREATE UNIQUE INDEX idx_no_overlap_slots ON time_slots (physio_id, slot_date, start_time);

-- 4. Alter Existing Tables
-- Physio Profiles
ALTER TABLE physio_profiles ADD COLUMN emergency_opt_in BOOLEAN DEFAULT true;
ALTER TABLE physio_profiles ADD COLUMN emergency_acceptance_rate NUMERIC(5,2) DEFAULT 100.00;
ALTER TABLE physio_profiles ADD COLUMN emergency_strikes INTEGER DEFAULT 0;
ALTER TABLE physio_profiles ADD COLUMN emergency_suspended_until TIMESTAMPTZ;

-- Sessions
ALTER TABLE sessions ADD COLUMN session_type session_type DEFAULT 'marketplace';
ALTER TABLE sessions ADD COLUMN session_origin session_origin DEFAULT 'marketplace';
ALTER TABLE sessions ADD COLUMN commission_rate NUMERIC(4,2) DEFAULT 15.00;
ALTER TABLE sessions ADD COLUMN emergency_surcharge INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN net_physio_earnings INTEGER;
ALTER TABLE sessions ADD COLUMN duration_minutes INTEGER DEFAULT 60;
ALTER TABLE sessions ADD COLUMN rate_type rate_type DEFAULT 'standard';
ALTER TABLE sessions ADD COLUMN internal_note TEXT;
ALTER TABLE sessions ADD COLUMN parent_session_id UUID REFERENCES sessions(id);
ALTER TABLE sessions ADD COLUMN series_id UUID;
ALTER TABLE sessions ADD COLUMN slot_id UUID REFERENCES time_slots(id);
ALTER TABLE sessions ADD COLUMN injury_description TEXT;

-- 5. Emergency System
CREATE TABLE emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  body_part TEXT NOT NULL,
  urgency emergency_urgency NOT NULL,
  description TEXT,
  status emergency_request_status DEFAULT 'pending',
  current_physio_id UUID REFERENCES physio_profiles(id),
  accepted_physio_id UUID REFERENCES physio_profiles(id),
  session_id UUID REFERENCES sessions(id),
  search_radius_km INTEGER DEFAULT 10,
  search_window_hours INTEGER DEFAULT 2,
  attempt_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE emergency_request_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES emergency_requests(id) ON DELETE CASCADE,
  physio_id UUID REFERENCES physio_profiles(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  response TEXT CHECK (response IN ('accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 6. Private Client Invites
CREATE TABLE client_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physio_id UUID REFERENCES physio_profiles(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  athlete_id UUID REFERENCES athlete_profiles(id),
  status invite_status DEFAULT 'pending',
  slot_id UUID REFERENCES time_slots(id),
  invite_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ
);

-- Add missing FKs from time_slots
ALTER TABLE time_slots ADD CONSTRAINT fk_time_slots_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL;
ALTER TABLE time_slots ADD COLUMN invite_id UUID REFERENCES client_invites(id) ON DELETE SET NULL;

-- 7. RLS Policies
ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_request_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invites ENABLE ROW LEVEL SECURITY;

-- Schedule Templates
CREATE POLICY "Physios can manage own templates" ON schedule_templates
  FOR ALL USING (auth.uid() = physio_id);

-- Time Slots
CREATE POLICY "Anyone can view open slots for approved physios" ON time_slots
  FOR SELECT USING (
    status = 'open' AND 
    EXISTS (SELECT 1 FROM physio_profiles WHERE id = time_slots.physio_id AND verification_status = 'approved')
  );
CREATE POLICY "Physios can manage own slots" ON time_slots
  FOR ALL USING (auth.uid() = physio_id);
CREATE POLICY "Athletes can view their booked/invite slots" ON time_slots
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sessions WHERE id = time_slots.session_id AND athlete_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM client_invites WHERE id = time_slots.invite_id AND athlete_id = auth.uid())
  );

-- Emergency Requests
CREATE POLICY "Athletes can manage own emergency requests" ON emergency_requests
  FOR ALL USING (auth.uid() = athlete_id);
CREATE POLICY "Involved physios can view emergency requests" ON emergency_requests
  FOR SELECT USING (auth.uid() = current_physio_id OR auth.uid() = accepted_physio_id);

-- Client Invites
CREATE POLICY "Physios can manage own invites" ON client_invites
  FOR ALL USING (auth.uid() = physio_id);
CREATE POLICY "Invited clients can view their invite" ON client_invites
  FOR SELECT USING (LOWER(client_email) = LOWER(auth.jwt() ->> 'email'));

-- 8. Functions & Triggers
-- Automatic net earnings calculation
CREATE OR REPLACE FUNCTION calculate_net_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Default commission: 15% marketplace, 5% private_client
  NEW.net_physio_earnings := NEW.amount - (NEW.amount * NEW.commission_rate / 100) + NEW.emergency_surcharge;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_calculate_net_earnings
BEFORE INSERT OR UPDATE OF amount, commission_rate, emergency_surcharge ON sessions
FOR EACH ROW EXECUTE FUNCTION calculate_net_earnings();
