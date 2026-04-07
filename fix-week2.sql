-- Delete the current Week 2 posts so we can redo them properly
DELETE FROM posts WHERE id IN ('day8-quick-demo', 'day9-fast-5beat', 'day10-stronger-reward', 'day11-hard-16beat', 'day12-overnight-results', 'day13-rethinking-approach', 'day14-week2-reflection');

-- Day 8 (Tue Apr 1) - Switched from NeuroSynth to EvoSynth
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day8-evosynth',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  8,
  'Switching from NeuroSynth to EvoSynth',
  '## The Experiment

NeuroSynth wasn''t producing results, so today I switched to a different application on the Cortical Labs platform: **EvoSynth**. Where NeuroSynth tries to train neurons to reproduce Euclidean rhythms through reward/punishment feedback, EvoSynth takes a more aggressive approach — it uses high plasticity settings to try to rapidly reshape the neural network.

## What Changed

- **Application:** NeuroSynth → EvoSynth
- **Config:** Aggressive Learning, High Plasticity
- **Approach:** Instead of patient reward/punishment cycles, EvoSynth pushes the neurons harder with stronger stimulation and faster adaptation

## Results

The electrode activity grid lit up more intensely than with NeuroSynth — you could see the neurons responding to the stronger stimulation. But the rhythm visualizer still showed "NOT EUCLIDEAN" for most cycles. The neurons are more active but not more organized.

## Takeaway

More stimulation ≠ more learning. The neurons fire more but they don''t fire *better*. The temporal encoding problem from Day 6 persists regardless of which synth program I use.',
  'shared',
  '["cortical-labs","wet-computing","evosynth","plasticity"]',
  '[]'
);

-- Day 9 (Wed Apr 2) - Seder night experiment
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day9-seder-afikomen',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  9,
  'Passover experiment: is there a correlation between age and speed to find the afikomen?',
  '## The Experiment

It''s Passover. At the Seder tonight, I told the table about my 100 days of experiments and asked: what could we experiment with right now?

Two suggestions came up:
1. Whether Elijah''s cup of wine would actually get drunk (by Elijah)
2. Whether there''s a correlation between age and speed to find the afikomen

We went with #2.

## Method

The afikomen was hidden. All the kids searched. We timed who found it and noted their ages.

## Results

**No correlation found.** The youngest kid found the afikomen first — before the older kid who actually suggested the experiment.

## Do You See the Problem?

This experiment has at least three design flaws:

1. **Sample size of one.** A single Seder with a handful of kids is not enough data to establish a correlation. You''d need dozens of Seders.

2. **The person who designed the experiment was also a participant.** The older kid who proposed the hypothesis was searching too. Did they subconsciously (or consciously) search less hard, wanting to prove their theory? Experimenter bias.

3. **Motivation asymmetry.** Younger kids are typically MORE motivated to find the afikomen (the prize matters more to them). So the experimental design confounds age with motivation.

The most interesting finding isn''t the result — it''s that the experiment was flawed from the start. Designing a fair test is harder than it looks, even at the dinner table.

## Takeaway

The best part of tonight was that everyone at the table started thinking like experimenters. The worst part is that our experiment was terrible science. Happy Passover.',
  'shared',
  '["experiment","passover","seder","afikomen","experimental-design","family"]',
  '[]'
);

-- Day 10 (Thu Apr 3) - Tried BioSynth
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day10-biosynth',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  10,
  'BioSynth: a different approach to neural pattern formation',
  '## The Experiment

Third synth program this week. After NeuroSynth (reward/punishment) and EvoSynth (aggressive plasticity), today I tried **BioSynth** — which focuses on more biologically realistic stimulation patterns.

## How It Differs

- **NeuroSynth** asks: can we train neurons to match a target rhythm?
- **EvoSynth** asks: can we force rapid neural reorganization?
- **BioSynth** asks: can we create conditions where patterns emerge naturally?

BioSynth uses gentler stimulation that mimics more natural neural input rather than blasting the neurons with structured pulses. The idea is that biological systems learn better when the input looks like something they''d encounter in a real brain.

## Results

The neural activity patterns looked qualitatively different — more organic, less reactive. The spike raster plot showed more distributed activity across channels rather than the clustered bursts I saw with EvoSynth. But still no clear Euclidean rhythm emergence.

## Takeaway

Three programs, three philosophies, same result: neurons on a chip don''t spontaneously organize into Euclidean rhythms. Starting to think this is a fundamental constraint of dissociated neuron cultures, not a software problem.',
  'shared',
  '["cortical-labs","wet-computing","biosynth","pattern-formation"]',
  '[]'
);

-- Day 11 (Fri Apr 4) - Back to EvoSynth with different config
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day11-evosynth-tweaks',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  11,
  'EvoSynth round 2: tweaking the aggression',
  '## The Experiment

Went back to EvoSynth but dialed down the aggression. The high plasticity config was making the neurons hyperactive without producing structure. Today I used a moderate config — still more aggressive than NeuroSynth but less than Tuesday''s run.

## What Changed

Reduced the stimulation amplitude and increased the window size so the system evaluates patterns over more cycles before deciding to reward or punish. The theory: give the neurons more time to settle into a pattern before judging them.

## Results

The match rate was slightly more stable — less of the wild swings I saw on Day 8. But stable doesn''t mean improving. It stabilized around 25-30%, which is roughly chance for the pattern complexity.

## Takeaway

I''m becoming a better experimentalist through failure. Each run teaches me something about the parameter space even when the neurons don''t learn anything.',
  'shared',
  '["cortical-labs","wet-computing","evosynth","parameters","iteration"]',
  '[]'
);

-- Day 12 (Sat Apr 5) - Long overnight run
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day12-overnight-run',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  12,
  'Overnight run: 4 hours, 603 cycles, patience as a variable',
  '## The Experiment

Set up a long EvoSynth run before bed. 4-hour timeout. Let the neurons work while I sleep.

## Results

603 cycles completed. The learning curve followed the same pattern I keep seeing: starts with an apparent high match rate (random noise + loose criteria) then drops as the evaluation tightens. Ended around 20%.

The console screenshot from this run is the one I captured for the Day 6 post — it shows the full dashboard with electrode activity, rhythm visualizer, and the declining learning curve.

## Takeaway

I''ve now run every preset, every synth program, short runs and long runs. The consistent finding: no evidence of Euclidean rhythm learning under any condition I''ve tested. This is either a fundamental limit or I''m still missing something about how to set up the experiment.',
  'shared',
  '["cortical-labs","wet-computing","overnight","patience","results"]',
  '[]'
);

-- Day 13 (Sun Apr 6) - Rethinking the whole approach
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day13-listen-dont-teach',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  13,
  'Stop teaching, start listening: what are the neurons already doing?',
  '## The Realization

After a full week of switching between NeuroSynth, EvoSynth, and BioSynth — all trying to impose a pattern ON the neurons — I''m flipping the question: what patterns are the neurons already producing on their own?

Instead of reward/punishment, what if I just record the natural activity and look for structure? The neurons fire spontaneously. They have their own dynamics. Maybe the interesting experiment isn''t training — it''s observation.

## The Analogy

It''s like trying to teach a river to flow in a specific pattern vs studying where the river naturally wants to go. The river has its own physics. The neurons have their own biology.

## What I Want To Try Next

- Run a long recording session with NO reward/punishment
- Just the clock stimulus and observation
- Analyze what patterns naturally emerge from motor channels

## Takeaway

Sometimes the best experiment is to stop experimenting and start observing.',
  'shared',
  '["cortical-labs","wet-computing","observation","philosophy"]',
  '[]'
);

-- Day 14 (Mon Apr 7) - Week 2 reflection
INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media) VALUES (
  'day14-week2-reflection',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  14,
  'Week 2 Reflection: three synths, one Seder, zero Euclidean rhythms',
  '## Weekly Check-In

**What made me proud this week?**

I tried everything. NeuroSynth, EvoSynth, BioSynth — three different programs, multiple configs, short runs and overnight runs. And on Wednesday I turned Passover into a science experiment (even if the experimental design was terrible). The range of experiments this week was wide.

**What surprised me about the process?**

The Seder experiment surprised me the most. Not the result (no correlation between age and afikomen-finding speed) but the realization that our experiment was flawed in at least three ways. The kid who designed it was also a participant. The sample size was one. And younger kids are more motivated by the prize. Teaching my kids to think about experimental design at the dinner table might be the most valuable outcome of this whole 100 days project.

**Rating for the week: 6/10**

Higher than last week. The wet computing work was all negative results, but I systematically explored the parameter space. The Seder experiment was the highlight. And the shift toward observation over teaching (Day 13) feels like the right next move.',
  'shared',
  '["reflection","week2","wet-computing","seder","experimental-design"]',
  '[]'
);
