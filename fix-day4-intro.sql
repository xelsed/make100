UPDATE posts SET content = REPLACE(
  content,
  'Finally got around to properly testing my access to Cortical Labs'' wet computing platform. Turns out you need API access to actually run experiments — the web dashboard alone isn''t enough. But I got it working and ran their NeuroSynth experiment: can biological neurons self-organize into Euclidean rhythms?',
  'Finally got around to properly testing my access to Cortical Labs'' wet computing platform. Turns out you need API access to actually run experiments — the web dashboard alone isn''t enough. But I got it working and ran their NeuroSynth experiment: can biological neurons learn to play back Euclidean rhythms?'
) WHERE id = 'day4-cortical-labs';
