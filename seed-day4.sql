INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day4-cortical-labs',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  4,
  'Finally got my Cortical Labs wet computing access working',
  '## The Experiment

Finally got around to properly testing my access to Cortical Labs'' wet computing platform. Turns out you need API access to actually run experiments — the web dashboard alone isn''t enough. But I got it working and ran their NeuroSynth experiment: can biological neurons self-organize into Euclidean rhythms?

## What I''m Looking At

The experiment rewards neurons when they produce structured rhythmic patterns and punishes them with random noise when they don''t. The dashboard shows:

- **Rhythm Visualizer** — a circular plot showing which beats the neurons are firing on (filled = fire, hollow = silent)
- **Electrode Activity** — a grid of 64 electrodes on the chip, lit up purple when stimulated, orange when spiking
- **Training Stats** — after 32 cycles: 34% overall match rate, 50% in the last 10 cycles, with 11 Euclidean matches
- **Learning Curve** — started around 75% match rate, then dropped to about 20% over time
- **Spike Raster Plot** — raw neural activity across all channels

## What Happened

The learning curve is honestly not encouraging — it went *down* over the session, from ~75% to ~20%. The dominant pattern was E(1,8) which appeared 6 times, meaning the neurons mostly just fired on one beat out of eight. The system was giving more PUNISHMENT (random noise) than REWARD (structured stimulation).

But the match rate in the last 10 cycles jumped to 50%, so maybe there''s something starting to happen at the tail end. Need longer sessions to know.

## The Cool Part

Regardless of the results, I''m running experiments on actual biological neurons on a chip from my laptop. The config file shows the setup: 30 sensory channels, 29 motor channels, reward delivered as structured 100Hz bursts at 2.5uA, punishment as random noise between 3-25Hz. This is genuinely new territory — most people don''t have access to this yet.

## What''s Next

Need to figure out the API access to run longer unattended sessions. The web interface times out. Will try adjusting the reward/punishment parameters to see if the neurons learn faster with different feedback strengths.',
  'shared',
  '["cortical-labs","wet-computing","neurons","experiment","biological-computing"]',
  '[{"type":"image","url":"/api/media/day4/cortical-dashboard.png?v=1","alt":"Cortical Labs NeuroSynth dashboard - rhythm visualizer, electrode activity, training stats"},{"type":"image","url":"/api/media/day4/cortical-learning-curve.png?v=1","alt":"Learning curve, feedback log, spike raster plot, and current cycle view"}]'
);
