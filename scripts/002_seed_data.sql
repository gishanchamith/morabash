-- Seed data for Cricket Tournament Management System

-- Insert 11 teams
INSERT INTO teams (name, captain_name) VALUES
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
('Mumbai Indians', 'Rohit Sharma');

-- Initialize tournament standings for all teams
INSERT INTO tournament_standings (team_id)
SELECT id FROM teams;

-- Insert sample players for first few teams
INSERT INTO players (name, team_id, role, batting_order, jersey_number) 
SELECT 'Player ' || generate_series(1, 15), t.id, 
  CASE 
    WHEN generate_series(1, 15) <= 6 THEN 'batsman'
    WHEN generate_series(1, 15) <= 10 THEN 'bowler'
    WHEN generate_series(1, 15) <= 13 THEN 'all-rounder'
    ELSE 'wicket-keeper'
  END,
  generate_series(1, 15),
  generate_series(1, 15)
FROM teams t
LIMIT 3;

-- Insert sample matches
INSERT INTO matches (team1_id, team2_id, venue, match_date, status) 
SELECT 
  t1.id, 
  t2.id, 
  'Stadium ' || (ROW_NUMBER() OVER()),
  NOW() + (ROW_NUMBER() OVER()) * INTERVAL '1 day',
  CASE 
    WHEN ROW_NUMBER() OVER() <= 2 THEN 'completed'
    WHEN ROW_NUMBER() OVER() <= 4 THEN 'ongoing'
    ELSE 'upcoming'
  END
FROM teams t1
CROSS JOIN teams t2
WHERE t1.id != t2.id
LIMIT 10;
