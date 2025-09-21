ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS overs_per_innings INTEGER DEFAULT 20 CHECK (overs_per_innings BETWEEN 1 AND 90);

UPDATE matches
SET overs_per_innings = 20
WHERE overs_per_innings IS NULL;

ALTER TABLE matches
  ALTER COLUMN overs_per_innings SET NOT NULL;
