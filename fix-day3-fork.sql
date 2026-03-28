UPDATE posts SET content = REPLACE(
  content,
  'Now I know it takes about 50 seconds to completely burn a gummy worm. Perhaps one day that will save someone''s life.',
  'Now I know it takes about 50 seconds to completely burn a gummy worm. Perhaps one day that will save someone''s life.

Also worth noting: the fork was completely fine afterwards. No damage, no residue that wouldn''t wash off. The sugar burns clean.'
) WHERE id = 'day3-burn-and-learn';
