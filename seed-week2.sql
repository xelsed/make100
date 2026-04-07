-- Day 8 (Apr 1) - Switched to Quick Demo preset for faster iteration
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day8-quick-demo',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  8,
  'NeuroSynth: switching to shorter runs for faster iteration',
  '## The Experiment

After Day 6''s realization that neurons don''t know what time it is, I decided to stop running 3-hour sessions and start iterating faster. Switched to the Quick Demo 8-beat preset — same pattern (8-beat Euclidean rhythm) but with a 1-hour timeout instead of 3 hours.

The logic: if the neurons aren''t learning in the first hour, they''re probably not going to learn in hour three either. Shorter runs mean I can try more configurations per day.

## What Changed

- Timeout: 3 hours → 1 hour
- Everything else stayed the same (8-beat cycle, 80 BPM, same reward/punishment)

## Results

Same story as before — no clear learning signal. The match rate hovered around random chance. But now I''m getting through runs faster, which means I can start changing the actual experiment parameters instead of just watching the same failure for longer.

## Takeaway

Sometimes the experiment isn''t the experiment. The experiment is figuring out how to experiment faster.',
  'shared',
  '["cortical-labs","wet-computing","neurosynth","iteration"]',
  '[]'
);

-- Day 9 (Apr 2) - Tried the Fast 5-beat preset
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day9-fast-5beat',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  9,
  'NeuroSynth: can neurons learn a simpler pattern?',
  '## The Experiment

If 8-beat Euclidean rhythms are too complex, what about 5-beat? Switched to the Fast 5-beat preset today. The idea: a shorter cycle with a faster tempo should be easier for the neurons to learn because there are fewer positions to get right.

## What Changed vs Default

- Cycle length: 8 → 5 (simpler pattern)
- BPM: 80 → 120 (faster tempo, more cycles per session)
- Threshold window: 16 → 10 (evaluates learning over fewer cycles)
- Timeout: 1 hour

Faster tempo means the neurons get more training cycles in the same amount of time. More reps = more chances to learn.

## Results

The match rate was slightly higher than the 8-beat runs — hovering around 40% vs the usual 30%. Could be noise. Could be that simpler patterns are genuinely easier. Hard to tell from one run.

The 68% baseline mentioned in the preset name refers to the expected match rate if neurons fire randomly on a 5-beat cycle with 2 active beats. So 40% is actually below chance. Still not learning.

## Takeaway

Simpler patterns didn''t obviously help. Starting to think the issue isn''t complexity — it''s the feedback mechanism itself. The neurons get reward/punishment but have no way to associate it with specific timing decisions.',
  'shared',
  '["cortical-labs","wet-computing","neurosynth","5-beat","parameters"]',
  '[]'
);

-- Day 10 (Apr 3) - Tried cranking up the reward signal
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day10-stronger-reward',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  10,
  'NeuroSynth: what if the reward is louder?',
  '## The Experiment

All the presets use the same reward/punishment amplitudes — 2.5uA for reward, 1.5uA for punishment. What if the neurons just aren''t noticing the difference? Today I manually edited the config to increase the reward signal.

## What Changed

- Reward current: 2.5uA → 3.5uA (40% stronger)
- Reward duration: 0.1s → 0.2s (twice as long)
- Everything else unchanged (8-beat, 80 BPM)

The theory: if reward is a structured 100Hz burst and punishment is random noise, making the reward burst stronger and longer should make the difference more obvious to the neurons.

## Results

No improvement. Match rate still around chance. The neurons respond to the stimulation — you can see spikes on the electrode grid when reward is delivered — but there''s no evidence they''re changing their behavior because of it.

## The Frustration

I''m starting to understand why Cortical Labs ships this as an ''experiment'' and not a ''demo.'' This isn''t a guaranteed outcome. The neurons might learn, or they might not. The paper results took hundreds of cycles over many hours. I''m being impatient.

## Takeaway

Louder reward ≠ better learning. The signal strength isn''t the bottleneck. Back to the temporal encoding problem from Day 6.',
  'shared',
  '["cortical-labs","wet-computing","neurosynth","reward","parameters"]',
  '[]'
);

-- Day 11 (Apr 4) - Tried the Hard 16-beat preset overnight
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day11-hard-16beat',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  11,
  'NeuroSynth: 16-beat hard mode, let it run overnight',
  '## The Experiment

Counterintuitive move today: instead of making things simpler, I went harder. Loaded the Hard 16-beat preset and set it to run overnight — 4-hour timeout, 60 BPM, 16-step cycle.

## Why Harder?

Two reasons:
1. Maybe the 5-beat and 8-beat patterns are too short for the neurons to develop any temporal structure. A 16-beat cycle at 60 BPM gives each cycle 16 seconds — maybe that''s enough time for the neural activity to evolve within a single cycle.
2. The 5-minute assay at the start (vs 1 minute in other presets) gives a better baseline reading of natural neural activity. Maybe I''ve been starting from bad baselines.

## What Changed

- Cycle length: 16 beats (much more complex)
- BPM: 60 (slower, each beat is 1 second)
- Timeout: 4 hours
- Assay: 5 minutes (longer baseline)
- Threshold window: 32 (evaluates over more cycles)
- Reward duration: 0.15s (slightly longer than default)

## Results

Set it running before bed. Will check in the morning.

## Takeaway

Sometimes you need to just let the experiment breathe. Stop hovering over it and let time do the work.',
  'shared',
  '["cortical-labs","wet-computing","neurosynth","16-beat","overnight","patience"]',
  '[]'
);

-- Day 12 (Apr 5) - Checking overnight results
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day12-overnight-results',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  12,
  'NeuroSynth overnight results: 603 cycles, still no clear learning',
  '## The Results

The 16-beat overnight run completed. 603 cycles over roughly 3 hours before the session ended.

Match rate: started around 75% (likely random noise given the pattern), dropped to about 20% over the session. The learning curve went down, not up.

This is the same pattern I saw on Day 4. The neurons start with a high apparent match rate (because with 16 beats and some random firing, you''ll accidentally match parts of the Euclidean pattern) and then the match rate drops as the system tightens its evaluation criteria.

## What This Means

After a full week of NeuroSynth experiments with different presets, tempos, cycle lengths, reward strengths, and session durations, the consistent result is: no clear evidence of rhythmic learning.

This doesn''t mean the neurons CAN''T learn. It means:
1. The NeuroSynth experiment may need fundamentally different parameters than the presets provide
2. The temporal encoding problem from Day 6 is real and unsolved
3. Or the specific neuron culture on my chip may not be in a good state for this type of learning

## Takeaway

Negative results are still results. I now have a week of data showing what doesn''t work, which is useful for figuring out what might.',
  'shared',
  '["cortical-labs","wet-computing","neurosynth","results","negative-results"]',
  '[]'
);

-- Day 13 (Apr 6) - Reflecting on the approach
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day13-rethinking-approach',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  13,
  'Maybe I should stop trying to teach rhythm and start listening',
  '## The Realization

After a week of failed NeuroSynth runs, I''m stepping back from the ''teach neurons a pattern'' framing and asking a different question: what patterns are the neurons already producing on their own?

Instead of rewarding a target rhythm and punishing everything else, what if I just record the natural activity and look for structure? The neurons fire spontaneously. They have their own dynamics. Maybe the interesting experiment isn''t training — it''s observation.

## The Analogy

It''s like trying to teach a river to flow in a specific pattern vs studying where the river naturally wants to go. The river has its own physics. The neurons have their own biology.

## What I Want To Try Next

- Run a long recording session with NO reward/punishment, just the clock stimulus
- Analyze the motor channel output for any naturally occurring patterns
- See if the neurons have a preferred rhythm before I try to impose one

## Takeaway

Sometimes the best experiment is to stop experimenting and start observing.',
  'shared',
  '["cortical-labs","wet-computing","observation","approach","philosophy"]',
  '[]'
);

-- Day 14 (Apr 7) - Week 2 reflection
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day14-week2-reflection',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  14,
  'Week 2 Reflection: a week of negative results',
  '## Weekly Check-In

**What made me proud this week?**

I committed to the wet computing experiments fully. Every day was a new configuration, a new hypothesis, a new run. I didn''t just stare at the same failure — I systematically varied parameters: shorter cycles, faster tempo, stronger rewards, longer sessions, harder patterns. I worked the problem.

**What surprised me about the process?**

How much I learned from things not working. The Day 6 insight (neurons don''t know what time it is) was the most important observation of the entire two weeks. And it only came from repeated failure. If the first run had worked, I never would have thought about temporal encoding.

Also: the shift from ''teaching'' to ''listening'' on Day 13 felt like a real breakthrough in thinking, even though I haven''t run the observation experiment yet.

**Rating for the week: 6/10**

Higher than last week because the quality of thinking improved even though the results didn''t. The negative results were productive. But I need to actually run the observation experiment next week, not just talk about it.',
  'shared',
  '["reflection","week2","wet-computing","negative-results"]',
  '[]'
);
