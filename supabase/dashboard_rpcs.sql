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
