-- Swap Day 8 and Day 9: Seder goes to Day 8, EvoSynth goes to Day 9
UPDATE posts SET day_number = 8 WHERE id = 'day9-seder-afikomen';
UPDATE posts SET day_number = 9 WHERE id = 'day8-evosynth';
