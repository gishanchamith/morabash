-- Cricket Tournament Management System Database Schema

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  captain VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table  
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  role VARCHAR(50) CHECK (role IN ('batsman', 'bowler', 'all-rounder', 'wicket-keeper')),
  batting_order INTEGER,
  bowling_type VARCHAR(50),
  jersey_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team1_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  venue VARCHAR(200),
  match_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) CHECK (status IN ('upcoming', 'ongoing', 'completed', 'abandoned')) DEFAULT 'upcoming',
  winner_id UUID REFERENCES teams(id),
  toss_winner_id UUID REFERENCES teams(id),
  elected_to VARCHAR(10) CHECK (elected_to IN ('bat', 'bowl')),
  overs_per_innings INTEGER DEFAULT 20 CHECK (overs_per_innings BETWEEN 1 AND 90),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Balls table for ball-by-ball tracking
CREATE TABLE IF NOT EXISTS balls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  innings INTEGER CHECK (innings IN (1, 2)),
  over_number INTEGER,
  ball_number INTEGER CHECK (ball_number BETWEEN 1 AND 6),
  batsman_id UUID REFERENCES players(id),
  bowler_id UUID REFERENCES players(id),
  runs INTEGER DEFAULT 0,
  extras INTEGER DEFAULT 0,
  extra_type VARCHAR(20) CHECK (extra_type IN ('wide', 'no-ball', 'bye', 'leg-bye')),
  wicket_type VARCHAR(20) CHECK (wicket_type IN ('bowled', 'caught', 'lbw', 'run-out', 'stumped', 'hit-wicket')),
  wicket_player_id UUID REFERENCES players(id),
  is_free_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scoreboard table for match summaries
CREATE TABLE IF NOT EXISTS scoreboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  innings INTEGER CHECK (innings IN (1, 2)),
  runs INTEGER DEFAULT 0,
  wickets INTEGER DEFAULT 0,
  overs DECIMAL(3,1) DEFAULT 0.0,
  current_rr DECIMAL(4,2) DEFAULT 0.00,
  required_rr DECIMAL(4,2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, team_id, innings)
);

-- Tournament standings
CREATE TABLE IF NOT EXISTS tournament_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE UNIQUE,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  nrr DECIMAL(4,3) DEFAULT 0.000,
  runs_for INTEGER DEFAULT 0,
  runs_against INTEGER DEFAULT 0,
  overs_faced DECIMAL(4,1) DEFAULT 0.0,
  overs_bowled DECIMAL(4,1) DEFAULT 0.0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE balls ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoreboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_standings ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view tournament data)
DROP POLICY IF EXISTS "Allow public read access to teams" ON teams;
DROP POLICY IF EXISTS "Allow public read access to players" ON players;
DROP POLICY IF EXISTS "Allow public read access to matches" ON matches;
DROP POLICY IF EXISTS "Allow public read access to balls" ON balls;
DROP POLICY IF EXISTS "Allow public read access to scoreboard" ON scoreboard;
DROP POLICY IF EXISTS "Allow public read access to standings" ON tournament_standings;

CREATE POLICY "Allow public read access to teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public read access to matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access to balls" ON balls FOR SELECT USING (true);
CREATE POLICY "Allow public read access to scoreboard" ON scoreboard FOR SELECT USING (true);
CREATE POLICY "Allow public read access to standings" ON tournament_standings FOR SELECT USING (true);

-- Admin write policies (only authenticated users can modify)
DROP POLICY IF EXISTS "Allow authenticated users to insert teams" ON teams;
DROP POLICY IF EXISTS "Allow authenticated users to update teams" ON teams;
DROP POLICY IF EXISTS "Allow authenticated users to delete teams" ON teams;

DROP POLICY IF EXISTS "Allow authenticated users to insert players" ON players;
DROP POLICY IF EXISTS "Allow authenticated users to update players" ON players;
DROP POLICY IF EXISTS "Allow authenticated users to delete players" ON players;

DROP POLICY IF EXISTS "Allow authenticated users to insert matches" ON matches;
DROP POLICY IF EXISTS "Allow authenticated users to update matches" ON matches;
DROP POLICY IF EXISTS "Allow authenticated users to delete matches" ON matches;

DROP POLICY IF EXISTS "Allow authenticated users to insert balls" ON balls;
DROP POLICY IF EXISTS "Allow authenticated users to update balls" ON balls;
DROP POLICY IF EXISTS "Allow authenticated users to delete balls" ON balls;

DROP POLICY IF EXISTS "Allow authenticated users to insert scoreboard" ON scoreboard;
DROP POLICY IF EXISTS "Allow authenticated users to update scoreboard" ON scoreboard;
DROP POLICY IF EXISTS "Allow authenticated users to delete scoreboard" ON scoreboard;

DROP POLICY IF EXISTS "Allow authenticated users to insert standings" ON tournament_standings;
DROP POLICY IF EXISTS "Allow authenticated users to update standings" ON tournament_standings;
DROP POLICY IF EXISTS "Allow authenticated users to delete standings" ON tournament_standings;

CREATE POLICY "Allow authenticated users to insert teams" ON teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update teams" ON teams FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete teams" ON teams FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert players" ON players FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update players" ON players FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete players" ON players FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert matches" ON matches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update matches" ON matches FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete matches" ON matches FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert balls" ON balls FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update balls" ON balls FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete balls" ON balls FOR DELETE USING (auth.uid() IS NOT NULL);

ALTER TABLE balls
  ADD COLUMN IF NOT EXISTS is_free_hit BOOLEAN DEFAULT FALSE;

CREATE POLICY "Allow authenticated users to insert scoreboard" ON scoreboard FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update scoreboard" ON scoreboard FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete scoreboard" ON scoreboard FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert standings" ON tournament_standings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update standings" ON tournament_standings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete standings" ON tournament_standings FOR DELETE USING (auth.uid() IS NOT NULL);

-- Scoreboard helpers
CREATE OR REPLACE FUNCTION public.initialize_match_scoreboard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO scoreboard (match_id, team_id, innings)
  VALUES
    (NEW.id, NEW.team1_id, 1),
    (NEW.id, NEW.team2_id, 2)
  ON CONFLICT (match_id, team_id, innings) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_match_scoreboard(p_match_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_team1 uuid;
  v_team2 uuid;
BEGIN
  SELECT team1_id, team2_id
  INTO v_team1, v_team2
  FROM matches
  WHERE id = p_match_id;

  IF v_team1 IS NULL OR v_team2 IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO scoreboard (match_id, team_id, innings)
  VALUES
    (p_match_id, v_team1, 1),
    (p_match_id, v_team2, 2)
  ON CONFLICT (match_id, team_id, innings) DO NOTHING;

  WITH innings_totals AS (
    SELECT
      innings,
      COALESCE(SUM(runs), 0) + COALESCE(SUM(extras), 0) AS total_runs,
      COUNT(*) FILTER (WHERE wicket_type IS NOT NULL) AS wickets,
      SUM(CASE WHEN extra_type IN ('wide', 'no-ball') THEN 0 ELSE 1 END) AS legal_balls
    FROM balls
    WHERE match_id = p_match_id
    GROUP BY innings
  ),
  scoreboard_targets AS (
    SELECT
      sc.id,
      sc.innings,
      COALESCE(it.total_runs, 0) AS total_runs,
      COALESCE(it.wickets, 0) AS wickets,
      COALESCE(it.legal_balls, 0) AS legal_balls
    FROM scoreboard sc
    LEFT JOIN innings_totals it ON it.innings = sc.innings
    WHERE sc.match_id = p_match_id
  )
  UPDATE scoreboard AS sc
  SET
    runs = st.total_runs,
    wickets = st.wickets,
    overs = CASE
      WHEN st.legal_balls = 0 THEN 0
      ELSE ROUND((st.legal_balls / 6)::numeric + ((st.legal_balls % 6)::numeric / 10), 1)
    END,
    current_rr = CASE
      WHEN st.legal_balls = 0 THEN 0
      ELSE ROUND((st.total_runs::numeric * 6) / st.legal_balls, 2)
    END,
    required_rr = NULL,
    updated_at = NOW()
  FROM scoreboard_targets st
  WHERE sc.id = st.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_ball_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_match uuid;
BEGIN
  v_match := COALESCE(NEW.match_id, OLD.match_id);

  IF v_match IS NOT NULL THEN
    PERFORM public.refresh_match_scoreboard(v_match);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS matches_initialize_scoreboard ON matches;
CREATE TRIGGER matches_initialize_scoreboard
AFTER INSERT ON matches
FOR EACH ROW
EXECUTE FUNCTION public.initialize_match_scoreboard();

DROP TRIGGER IF EXISTS balls_refresh_scoreboard ON balls;
CREATE TRIGGER balls_refresh_scoreboard
AFTER INSERT OR UPDATE OR DELETE ON balls
FOR EACH ROW
EXECUTE FUNCTION public.handle_ball_change();

-- Ensure scoreboard rows exist for current matches
INSERT INTO scoreboard (match_id, team_id, innings)
SELECT m.id, m.team1_id, 1
FROM matches m
ON CONFLICT (match_id, team_id, innings) DO NOTHING;

INSERT INTO scoreboard (match_id, team_id, innings)
SELECT m.id, m.team2_id, 2
FROM matches m
ON CONFLICT (match_id, team_id, innings) DO NOTHING;

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT DISTINCT match_id FROM balls LOOP
    PERFORM public.refresh_match_scoreboard(rec.match_id);
  END LOOP;
END;
$$;
