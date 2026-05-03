-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Types
CREATE TYPE user_role AS ENUM ('physio', 'athlete');
CREATE TYPE verification_state AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE session_state AS ENUM ('upcoming', 'completed', 'cancelled', 'no_show');
CREATE TYPE recovery_state AS ENUM ('in_progress', 'recovered');
CREATE TYPE schedule_block AS ENUM ('morning', 'afternoon', 'evening');
CREATE TYPE consent_type AS ENUM ('tc', 'pre_session');
CREATE TYPE case_status AS ENUM ('active', 'recovered', 'closed');
CREATE TYPE milestone_status AS ENUM ('pending', 'completed', 'missed');

-- 1. users table
CREATE TABLE users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role,
  phone text unique,
  email text unique,
  created_at timestamptz default now(),
  tc_accepted_at timestamptz,
  tc_ip text
);

-- 2. physio_profiles table
CREATE TABLE physio_profiles (
  id uuid primary key references users(id) on delete cascade,
  first_name text,
  last_name text,
  gender text,
  age integer,
  sport_specializations text[],
  injury_specializations text[],
  location_lat float,
  location_lng float,
  location_locality text,
  languages text[],
  dcptot_reg_id text,
  dcptot_doc_url text,
  bpt_doc_url text,
  verification_status verification_state default 'pending',
  rejection_reason text,
  is_availability_set boolean default false,
  consultation_rate integer,
  consultation_modes text[],
  personal_statement text,
  submitted_at timestamptz
);

-- 3. athlete_profiles table
CREATE TABLE athlete_profiles (
  id uuid primary key references users(id) on delete cascade,
  first_name text,
  last_name text,
  gender text,
  primary_sport text,
  location_lat float,
  location_lng float,
  location_locality text,
  dob date
);

-- 4. sessions table
CREATE TABLE sessions (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid references physio_profiles(id) on delete cascade,
  athlete_id uuid references athlete_profiles(id) on delete cascade,
  scheduled_at timestamptz,
  status session_state default 'upcoming',
  consultation_mode text,
  session_notes text,
  daily_room_url text,
  amount integer,
  created_at timestamptz default now()
);

-- 5. recovery_records table
CREATE TABLE recovery_records (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references athlete_profiles(id) on delete cascade,
  physio_id uuid references physio_profiles(id) on delete set null,
  injury_type text,
  sport text,
  started_at timestamptz,
  status recovery_state default 'in_progress',
  session_count integer default 0
);

-- 6. availability_slots table
CREATE TABLE availability_slots (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid references physio_profiles(id) on delete cascade,
  day_of_week integer check (day_of_week between 0 and 6),
  block schedule_block,
  is_active boolean default true
);

-- 7. reviews table
CREATE TABLE reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  physio_id uuid references physio_profiles(id) on delete cascade,
  athlete_id uuid references athlete_profiles(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  review_text text,
  created_at timestamptz default now()
);

-- 8. consent_logs table
CREATE TABLE consent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  consented_at timestamptz default now(),
  type consent_type
);

-- 9. case_files table
CREATE TABLE case_files (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid references physio_profiles(id) on delete cascade,
  athlete_id uuid references athlete_profiles(id) on delete cascade,
  injury_type text,
  body_part text,
  sport_context text,
  severity text,
  diagnosis_notes text,
  status case_status default 'active',
  created_at timestamptz default now(),
  closed_at timestamptz
);

-- 10. treatment_plans table
CREATE TABLE treatment_plans (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references case_files(id) on delete cascade,
  title text,
  description text,
  exercises jsonb,
  frequency text,
  duration_weeks integer,
  started_at timestamptz default now(),
  target_date date
);

-- 11. session_notes table
CREATE TABLE session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  case_id uuid references case_files(id) on delete cascade,
  physio_id uuid references physio_profiles(id) on delete cascade,
  summary text,
  pain_level integer check (pain_level between 1 and 10),
  rom_degrees integer,
  observations text,
  next_steps text,
  created_at timestamptz default now()
);

-- 12. progress_entries table
CREATE TABLE progress_entries (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references case_files(id) on delete cascade,
  recorded_by uuid references users(id) on delete cascade,
  pain_level integer check (pain_level between 1 and 10),
  mobility_score integer check (mobility_score between 1 and 10),
  notes text,
  recorded_at timestamptz default now()
);

-- 13. milestones table
CREATE TABLE milestones (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references case_files(id) on delete cascade,
  title text,
  target_date date,
  completed_at timestamptz,
  status milestone_status default 'pending'
);

-- ====================
-- RLS POLICIES
-- ====================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE physio_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- 1. users
CREATE POLICY "Users can view own record" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own record" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (auth.uid() = id);

-- 2. physio_profiles
CREATE POLICY "Physios can view own profile" ON physio_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Physios can insert own profile" ON physio_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Physios can update own profile" ON physio_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Athletes can view approved physios" ON physio_profiles FOR SELECT USING (verification_status = 'approved');

-- 3. athlete_profiles
CREATE POLICY "Athlete can view own profile" ON athlete_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Athlete can insert own profile" ON athlete_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Athlete can update own profile" ON athlete_profiles FOR UPDATE USING (auth.uid() = id);

-- 4. sessions
CREATE POLICY "Physio can read own sessions" ON sessions FOR SELECT USING (auth.uid() = physio_id);
CREATE POLICY "Athlete can read own sessions" ON sessions FOR SELECT USING (auth.uid() = athlete_id);
CREATE POLICY "Athlete can insert session" ON sessions FOR INSERT WITH CHECK (auth.uid() = athlete_id);
CREATE POLICY "Physio can update session notes" ON sessions FOR UPDATE USING (auth.uid() = physio_id);

-- 5. recovery_records
CREATE POLICY "Athlete reads own recovery records" ON recovery_records FOR SELECT USING (auth.uid() = athlete_id);
CREATE POLICY "Athlete inserts own recovery records" ON recovery_records FOR INSERT WITH CHECK (auth.uid() = athlete_id);
CREATE POLICY "Athlete updates own recovery records" ON recovery_records FOR UPDATE USING (auth.uid() = athlete_id);
CREATE POLICY "Physio reads records of conducted sessions" ON recovery_records FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sessions WHERE sessions.physio_id = auth.uid() AND sessions.athlete_id = recovery_records.athlete_id
  )
);

-- 6. availability_slots
CREATE POLICY "Physio can view own slots" ON availability_slots FOR SELECT USING (auth.uid() = physio_id);
CREATE POLICY "Physio can insert own slots" ON availability_slots FOR INSERT WITH CHECK (auth.uid() = physio_id);
CREATE POLICY "Physio can update own slots" ON availability_slots FOR UPDATE USING (auth.uid() = physio_id);
CREATE POLICY "Physio can delete own slots" ON availability_slots FOR DELETE USING (auth.uid() = physio_id);
CREATE POLICY "Athletes view approved physio slots" ON availability_slots FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM physio_profiles WHERE physio_profiles.id = availability_slots.physio_id AND physio_profiles.verification_status = 'approved'
  )
);

-- 7. reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Athlete can write reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = athlete_id);

-- 8. consent_logs
CREATE POLICY "Users can insert own log" ON consent_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own log" ON consent_logs FOR SELECT USING (auth.uid() = user_id);

-- 9. case_files
CREATE POLICY "Physio can manage own cases" ON case_files FOR ALL USING (auth.uid() = physio_id);
CREATE POLICY "Athlete can view own cases" ON case_files FOR SELECT USING (auth.uid() = athlete_id);

-- 10. treatment_plans
CREATE POLICY "Physio can manage treatment plans" ON treatment_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM case_files WHERE case_files.id = treatment_plans.case_id AND case_files.physio_id = auth.uid())
);
CREATE POLICY "Athlete can view treatment plans" ON treatment_plans FOR SELECT USING (
  EXISTS (SELECT 1 FROM case_files WHERE case_files.id = treatment_plans.case_id AND case_files.athlete_id = auth.uid())
);

-- 11. session_notes
CREATE POLICY "Physio can manage session notes" ON session_notes FOR ALL USING (auth.uid() = physio_id);
CREATE POLICY "Athlete can view session notes" ON session_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM case_files WHERE case_files.id = session_notes.case_id AND case_files.athlete_id = auth.uid())
);

-- 12. progress_entries
CREATE POLICY "Users can manage own progress" ON progress_entries FOR ALL USING (auth.uid() = recorded_by);
CREATE POLICY "Athletes view own case progress" ON progress_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM case_files WHERE case_files.id = progress_entries.case_id AND case_files.athlete_id = auth.uid())
);
CREATE POLICY "Physios view own case progress" ON progress_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM case_files WHERE case_files.id = progress_entries.case_id AND case_files.physio_id = auth.uid())
);

-- 13. milestones
CREATE POLICY "Physio can manage milestones" ON milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM case_files WHERE case_files.id = milestones.case_id AND case_files.physio_id = auth.uid())
);
CREATE POLICY "Athlete can view milestones" ON milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM case_files WHERE case_files.id = milestones.case_id AND case_files.athlete_id = auth.uid())
);

-- ====================
-- TRIGGERS
-- ====================

-- Automatically create a profile in public.users when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, phone)
  VALUES (new.id, new.email, new.phone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================
-- STORED PROCEDURES
-- ====================

-- Matching Algorithm for Athlete Search
CREATE OR REPLACE FUNCTION match_physios(
  athlete_sport TEXT,
  athlete_lat FLOAT,
  athlete_lng FLOAT
) RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  sport_specializations TEXT[],
  injury_specializations TEXT[],
  location_locality TEXT,
  consultation_rate INTEGER,
  match_score FLOAT
) AS $$
  SELECT
    p.id, p.first_name, p.last_name,
    p.sport_specializations, p.injury_specializations,
    p.location_locality, p.consultation_rate,
    (
      -- Sport Match: 40% weight
      0.40 * CASE WHEN athlete_sport = ANY(p.sport_specializations) THEN 1.0 ELSE 0.0 END
      
      -- Location Proxy (since PostGIS isn't guaranteed, we'll just check if locality string matches as a fallback in app side, 
      -- but if we use lat/lng simple distance math):
      -- Apprx 111km per degree.
      + 0.20 * (1.0 - LEAST(
          SQRT(POWER(p.location_lat - athlete_lat, 2) + POWER(p.location_lng - athlete_lng, 2)) * 111.0 / 50.0, 
          1.0
      ))
      
      -- Rating: 10% weight
      + 0.10 * COALESCE((SELECT AVG(r.rating)::FLOAT / 5.0 FROM reviews r WHERE r.physio_id = p.id), 0.5)
      
      -- Availability: 5% weight
      + 0.05 * CASE WHEN p.is_availability_set THEN 1.0 ELSE 0.0 END
    ) AS match_score
  FROM physio_profiles p
  WHERE p.verification_status = 'approved'
  ORDER BY match_score DESC
  LIMIT 20;
$$ LANGUAGE sql STABLE;


-- RPC: get_physio_dashboard_stats
CREATE OR REPLACE FUNCTION get_physio_dashboard_stats(p_physio_id UUID)
RETURNS json
AS $$
DECLARE
  v_active_cases INT;
  v_new_bookings INT;
  v_completed_sessions INT;
  v_total_earnings INT;
  v_avg_rating FLOAT;
BEGIN
  -- 1. Active Cases
  SELECT count(*) INTO v_active_cases FROM case_files 
  WHERE physio_id = p_physio_id AND status = 'active';

  -- 2. New Bookings (Upcoming sessions this month)
  SELECT count(*) INTO v_new_bookings FROM sessions 
  WHERE physio_id = p_physio_id 
  AND created_at >= date_trunc('month', current_date);

  -- 3. Completed Sessions (Lifetime)
  SELECT count(*) INTO v_completed_sessions FROM sessions 
  WHERE physio_id = p_physio_id AND status = 'completed';

  -- 4. Total Earnings
  SELECT COALESCE(sum(amount), 0) INTO v_total_earnings FROM sessions 
  WHERE physio_id = p_physio_id AND status = 'completed';

  -- 5. Average Rating
  SELECT COALESCE(avg(rating), 0) INTO v_avg_rating FROM reviews 
  WHERE physio_id = p_physio_id;

  RETURN json_build_object(
    'activeCases', v_active_cases,
    'newBookings', v_new_bookings,
    'completedSessions', v_completed_sessions,
    'totalEarnings', v_total_earnings,
    'avgRating', v_avg_rating
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: get_athlete_dashboard_stats
CREATE OR REPLACE FUNCTION get_athlete_dashboard_stats(p_athlete_id UUID)
RETURNS json
AS $$
DECLARE
  v_total_sessions INT;
  v_active_cases INT;
  v_milestones_hit INT;
  v_avg_pain FLOAT;
BEGIN
  -- 1. Total Sessions Built/Upcoming
  SELECT count(*) INTO v_total_sessions FROM sessions 
  WHERE athlete_id = p_athlete_id AND status != 'cancelled';

  -- 2. Active Cases
  SELECT count(*) INTO v_active_cases FROM case_files 
  WHERE athlete_id = p_athlete_id AND status = 'active';

  -- 3. Milestones Hit
  SELECT count(*) INTO v_milestones_hit FROM milestones m
  JOIN case_files c ON m.case_id = c.id
  WHERE c.athlete_id = p_athlete_id AND m.status = 'completed';

  -- 4. Avg Pain (Last 30 Days)
  SELECT COALESCE(avg(pain_level), 0) INTO v_avg_pain FROM progress_entries p
  JOIN case_files c ON p.case_id = c.id
  WHERE c.athlete_id = p_athlete_id 
  AND p.recorded_at >= current_date - interval '30 days';

  RETURN json_build_object(
    'totalSessions', v_total_sessions,
    'activeCases', v_active_cases,
    'milestonesHit', v_milestones_hit,
    'avgPain', v_avg_pain
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: get_session_trend (Last 6 Months volume)
CREATE OR REPLACE FUNCTION get_session_trend(p_user_id UUID, p_role TEXT)
RETURNS json
AS $$
BEGIN
  IF p_role = 'physio' THEN
    RETURN (
      SELECT json_agg(json_build_object('month', month_name, 'count', session_count))
      FROM (
        SELECT to_char(date_trunc('month', scheduled_at), 'Mon') as month_name, count(*) as session_count
        FROM sessions
        WHERE physio_id = p_user_id AND status = 'completed'
        AND scheduled_at >= current_date - interval '6 months'
        GROUP BY date_trunc('month', scheduled_at), to_char(date_trunc('month', scheduled_at), 'Mon')
        ORDER BY date_trunc('month', scheduled_at) ASC
      ) sub
    );
  ELSE
    RETURN (
      SELECT json_agg(json_build_object('month', month_name, 'count', session_count))
      FROM (
        SELECT to_char(date_trunc('month', scheduled_at), 'Mon') as month_name, count(*) as session_count
        FROM sessions
        WHERE athlete_id = p_user_id AND status = 'completed'
        AND scheduled_at >= current_date - interval '6 months'
        GROUP BY date_trunc('month', scheduled_at), to_char(date_trunc('month', scheduled_at), 'Mon')
        ORDER BY date_trunc('month', scheduled_at) ASC
      ) sub
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
