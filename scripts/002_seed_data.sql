-- Seed data for Cricket Tournament Management System

-- Insert 11 teams
INSERT INTO teams (name, captain) VALUES
('Mumbai Warriors', 'Rohit Sharma'),
('Delhi Capitals', 'Rishabh Pant'),
('Chennai Super Kings', 'MS Dhoni'),
('Royal Challengers', 'Virat Kohli'),
('Kolkata Knight Riders', 'Shreyas Iyer'),
('Punjab Kings', 'Shikhar Dhawan'),
('Rajasthan Royals', 'Sanju Samson'),
('Sunrisers Hyderabad', 'Aiden Markram'),
('Gujarat Titans', 'Hardik Pandya'),
('Lucknow Super Giants', 'KL Rahul'),
('Mumbai Indians', 'Rohit Sharma')
ON CONFLICT (name) DO NOTHING;

-- Initialize tournament standings for all teams
INSERT INTO tournament_standings (team_id)
SELECT id
FROM teams
ON CONFLICT (team_id) DO NOTHING;

WITH numbered_players AS (
  SELECT generate_series(1, 15) AS idx
),
first_teams AS (
  SELECT id
  FROM teams
  ORDER BY created_at
  LIMIT 3
)
INSERT INTO players (name, team_id, role, batting_order, jersey_number)
SELECT
  'Player ' || np.idx AS name,
  t.id,
  CASE
    WHEN np.idx <= 6 THEN 'batsman'
    WHEN np.idx <= 10 THEN 'bowler'
    WHEN np.idx <= 13 THEN 'all-rounder'
    ELSE 'wicket-keeper'
  END,
  np.idx,
  np.idx
FROM first_teams t
CROSS JOIN numbered_players np
WHERE NOT EXISTS (SELECT 1 FROM players);

-- Insert sample matches
WITH matchup AS (
  SELECT
    t1.id AS team1_id,
    t2.id AS team2_id,
    ROW_NUMBER() OVER (ORDER BY t1.created_at, t2.created_at) AS rn
  FROM teams t1
  CROSS JOIN teams t2
  WHERE t1.id <> t2.id
)
INSERT INTO matches (team1_id, team2_id, venue, match_date, status)
SELECT
  m.team1_id,
  m.team2_id,
  'Stadium ' || m.rn,
  NOW() + (m.rn || ' day')::interval,
  CASE
    WHEN m.rn <= 2 THEN 'completed'
    WHEN m.rn <= 4 THEN 'ongoing'
    ELSE 'upcoming'
  END
FROM matchup m
WHERE m.rn <= 10
  AND NOT EXISTS (SELECT 1 FROM matches);
