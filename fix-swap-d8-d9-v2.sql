-- Swap Day 8 and Day 9 using temp value to avoid unique constraint
UPDATE posts SET day_number = 99 WHERE id = 'day8-evosynth';
UPDATE posts SET day_number = 8 WHERE id = 'day9-seder-afikomen';
UPDATE posts SET day_number = 9 WHERE id = 'day8-evosynth';
