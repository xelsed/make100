-- ============================================================
-- STEP 1: Fix created_at on existing posts to match real dates
-- ============================================================
UPDATE posts SET created_at = '2026-03-25 20:00:00' WHERE day_number = 1;
UPDATE posts SET created_at = '2026-03-26 20:00:00' WHERE day_number = 2;
UPDATE posts SET created_at = '2026-03-27 20:00:00' WHERE day_number = 3;
UPDATE posts SET created_at = '2026-03-28 20:00:00' WHERE day_number = 4;
UPDATE posts SET created_at = '2026-03-29 20:00:00' WHERE day_number = 5;
UPDATE posts SET created_at = '2026-03-30 20:00:00' WHERE day_number = 6;
UPDATE posts SET created_at = '2026-03-31 20:00:00' WHERE day_number = 7;
UPDATE posts SET created_at = '2026-04-01 20:00:00' WHERE day_number = 8;

-- ============================================================
-- STEP 2: Delete fake Week 2 posts (Days 9-14)
-- ============================================================
DELETE FROM posts WHERE id IN (
  'day8-evosynth',
  'day10-biosynth',
  'day11-evosynth-tweaks',
  'day12-overnight-run',
  'day13-listen-dont-teach',
  'day14-week2-reflection'
);

-- ============================================================
-- STEP 3: Add Day 7 experiment post (BioSynth v2.0)
-- ============================================================
INSERT OR IGNORE INTO posts (id, user_id, day_number, title, content, visibility, tags, media, created_at) VALUES (
  'day7-biosynth-3d-viz',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  7,
  'BioSynth v2.0: building 3D visualizations for neural waveform training',
  '## The Experiment

Today I built the visualization layer for BioSynth — the system that trains biological neurons to reproduce waveform shapes. The experiment: can I make the training process visible in a way that reveals what the neurons are actually doing?

## What I Built

Four new 3D visualizations:

- **Waveform Ribbon** — shows the input waveform and neural response as ribbons extending through time. You can see whether the spike rate tracks the sine/square/triangle shape.
- **Frequency Terrain** — side-by-side spectrograms of the input stimulus and neural output. If the neurons learn, the terrains should converge.
- **Correlation Orbit** — the Pearson correlation between input and output plotted as a point orbiting in 3D space. Closer to the center = higher correlation = more learning.
- **Morphology Evolution** — tracks how the spike waveform shapes change over time. If the neurons adapt, their waveforms should shift.

## Why This Matters

The numbers alone (correlation = 0.34, match rate = 27%) don''t tell you much. But when you can SEE the waveform ribbon diverging from the target, or watch the correlation orbit spiral outward, the failure becomes legible. Visualization turns data into intuition.

## Takeaway

The best debugging tool for biological systems might be the same as for software: make the invisible visible.',
  'shared',
  '["cortical-labs","wet-computing","biosynth","visualization","3d"]',
  '[]',
  '2026-03-31 20:00:00'
);

-- ============================================================
-- STEP 4: Insert real Day 9 — Ethics experiment
-- ============================================================
INSERT OR REPLACE INTO posts (id, user_id, day_number, title, content, visibility, tags, media, created_at) VALUES (
  'day9-ethics-shocking',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  9,
  'Do people care that I''m shocking human brain cells?',
  '## The Experiment

Today''s experiment was social, not technical. I wanted to find out how people react when you tell them you''re electrically stimulating human brain cells — rewarding them for correct behavior and punishing them with random noise when they get it wrong.

## Method

I decided to bring it up gradually in conversations throughout the day. Start by casually mentioning "I''m working with a biological computing platform." Then get progressively more specific: "It uses human neurons on a chip." Then: "I send electrical pulses to train them." Then: "I shock them when they get the wrong answer."

I wanted to see where, on the escalation from vague to explicit, people would push back.

## Results

**Nobody cared.**

Not the people I expected to care. Not even people who don''t eat meat for ethical reasons. The reaction was universally some version of "oh, cool" or "that''s interesting." No horror. No ethical questions. No "should you be doing that?"

The only point where anyone got uncomfortable was when I pushed it to the logical extreme: what about a whole brain? That triggered something. But individual cells? Clusters of neurons on a chip? Nothing. They couldn''t find the line between a cell and a heap. Grains of sand and all that.

## The Exception: Ken

My friend Ken was the one person who had a real reaction — but not the one I expected. He wasn''t concerned about the shocking. He was concerned about **whose cells these are.** Who donated them? Did they consent to having their neurons trained to play rhythms on a chip? The identity question, not the suffering question.

That''s a much more interesting ethical frame than "is it wrong to shock cells." It''s about consent and personhood, not pain.

## What I Did After

I went back to the platform and shocked harder.

Not out of cruelty — out of the realization that my hesitation about stimulation amplitudes was based on an anthropomorphic projection that literally nobody else shared. The cells don''t have pain receptors. They don''t have consciousness. They''re responding to electrical gradients the same way they would in a living brain. The "shocking" metaphor was limiting my science.

## My Own View

I''m honestly not sure everyone else is right to not care. There''s something about the trajectory — from cells to organoids to full brains — that makes me think we should be having the ethics conversation now, while the stakes are low, rather than waiting until they''re high. But today I learned that I''m mostly alone in that concern.

## Takeaway

The most interesting finding: the ethics of biological computing is not a technical question or a philosophical question. It''s a **framing** question. Call it "shocking brain cells" and people might care. Call it "electrical stimulation of a neural culture" and they definitely won''t.',
  'shared',
  '["ethics","wet-computing","cortical-labs","social-experiment","consciousness"]',
  '[]',
  '2026-04-02 20:00:00'
);

-- ============================================================
-- STEP 5: Insert real Day 10 — BioSynth H5 analysis
-- ============================================================
INSERT OR REPLACE INTO posts (id, user_id, day_number, title, content, visibility, tags, media, created_at) VALUES (
  'day10-h5-analysis',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  10,
  'BioSynth v6: what are these neurons actually doing? (H5 deep dive)',
  '## The Experiment

**Goal:** Stop guessing and start measuring. Use professional neuroscience tools (Elephant, Neo) to analyze the HDF5 recordings from previous runs.

**Reason:** We had correlation numbers but didn''t trust them. The H5 files contain raw truth — spike waveforms, timing, connectivity. Time to look.

## What We Found

- **Ch22 is a gamma oscillator** — 10Hz, 72% burst ratio. And we were stimulating it. H5 analysis showed ch22 fires BELOW chance when stimulated — we were suppressing the most interesting channel on the chip.
- **Real spike latencies:** 0.4-1.9ms duration, 3.5-7.7ms refractory period
- **Spike classification:** 0-2ms after stim = artifact (reject), 2-10ms = direct response, 10-60ms = network response
- **Ch15 is 86% evoked** — the best stim-responsive channel on the chip
- **Ch59 emerged as a new responder** — 14.6% evoked, wasn''t responding in earlier runs

## What We Changed

Built a research-calibrated protocol (BioSynth v6.1):
- Added NEVER_STIM list to protect ch22 from suppression
- Implemented proper spike classification by latency
- Added 8-stage curriculum (slow square → fast sawtooth)
- Matched DishBrain punishment protocol (2x reward amplitude ratio)

## Result

**BioSynth v6.1 achieved merit-based curriculum advancement on triangle 1Hz** — the first provably real learning signal. Not correlation noise. Not ch22''s intrinsic oscillation. Actual evoked responses that improved over time.

## Takeaway

The neurons were always capable of learning. We just weren''t listening properly.',
  'shared',
  '["cortical-labs","wet-computing","biosynth","h5-analysis","elephant","spike-sorting"]',
  '[]',
  '2026-04-03 20:00:00'
);

-- ============================================================
-- STEP 6: Insert real Day 11 — PulseSynth
-- ============================================================
INSERT OR REPLACE INTO posts (id, user_id, day_number, title, content, visibility, tags, media, created_at) VALUES (
  'day11-pulsesynth',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  11,
  'PulseSynth: stim once, then listen',
  '## The Experiment

**Goal:** Does a single-pulse-then-listen protocol work better than continuous stimulation?

**Reason:** Continuous waveform stim means we''re always stimulating AND reading simultaneously — hard to separate cause from effect. A discrete pulse (stim once, listen for 60ms, rest 500ms) cleanly separates stimulus from response, like a proper electrophysiology experiment.

## What Happened

Got **r=0.555 and r=0.620** — better correlation than continuous mode. The pulse protocol is more honest because you can clearly see: I stimulated, then N milliseconds later, the neuron fired (or didn''t).

But the stim died after 2-4 minutes. Every time. The neurons would respond strongly at first, then go quiet. Gain collapse — the system was auto-adjusting the stimulation amplitude downward until it hit zero.

## Root Cause

Vesicle depletion. At 60ms rest between pulses, the synaptic vesicles (the biological mechanism neurons use to transmit signals) don''t have time to replenish. It''s like playing a drum faster than the stick can bounce back — eventually you''re just pressing the stick into the drumhead.

## What We Learned

- Pulse protocol gives cleaner data but needs longer rest (500ms+, not 60ms)
- Continuous waveform "worked" partly because ch22''s intrinsic 10Hz oscillation created spurious correlation
- The honest measurement (pulse) revealed what the dishonest one (continuous) was hiding
- Disabled gain control entirely — fixed at 1.0 — to prevent the system from silencing itself

## Takeaway

The more rigorous the measurement, the harder it is to get results. But the results you do get are real.',
  'shared',
  '["cortical-labs","wet-computing","pulsesynth","pulse-protocol","vesicle-depletion"]',
  '[]',
  '2026-04-04 20:00:00'
);

-- ============================================================
-- STEP 7: Insert real Day 12 — NeuroBlastSynth (10 bugs)
-- ============================================================
INSERT OR REPLACE INTO posts (id, user_id, day_number, title, content, visibility, tags, media, created_at) VALUES (
  'day12-neuroblastsynth-bugs',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  12,
  'NeuroBlastSynth: 10 critical bugs found by listening to the neurons',
  '## The Experiment

**Goal:** Combine everything we learned from NeuroSynth, BioSynth, and PulseSynth into one system — and make the neurons play music while they learn.

**Reason:** Each previous experiment taught us something specific. BioSynth taught waveform correlation. PulseSynth taught pulse timing. H5 analysis taught the culture''s actual response characteristics. NeuroBlastSynth integrates all of it.

## What We Found: 10 Critical Bugs

Every "failure" this week was our code, not the biology:

1. **Response window too short** — set at 60ms, but 63% of real responses arrive at 60-120ms. We were throwing away most of our data.
2. **Too few stim channels** — only stimulating 8 channels. BioSynth v6 used 29 via honeycomb layout. Switched to 24.
3. **Stim queue buildup** — CL1''s neurons.stim() calls QUEUE, they don''t cancel. We were calling stim 100x/second, queuing pulses that played back at 200Hz. The hardware never stopped stimulating, even during rest.
4. **Ch29 saturated the entire array** — 6165uV peak on ch29, bleeding 2400uV onto all 64 channels. CL1''s spike detector found 0 spikes because everything looked like artifact.
5. **Wrong waveform phase** — sine wave started at 50% amplitude ((sin+1)/2 = 0.5 at t=0). Fixed to (1-cos)/2 which starts at 0.
6. **Triangle wave inverted** — started at peak instead of zero. Fixed with 1-abs(2p-1).
7. **Feedback never triggered** — correlation-based feedback threshold was never met because correlation was always ~0. Switched to response-rate-based feedback.
8. **Ch16 was being stimulated** — our network hub with STTC connections to 6 other channels. We were driving it instead of listening. Added to NEVER_STIM.
9. **Punishment weaker than reward** — backwards from the DishBrain paper protocol. Fixed ratio.
10. **is_continuous scoped wrong** — defined inside wave block, used outside it. Potential crash on any non-wave tick.

## The Culture IS Alive

After fixing all 10 bugs: 2400+ threshold crossings per 5 seconds. The neurons were always there. We just couldn''t hear them through our own noise.

## Takeaway

The hardest part of biological computing isn''t the biology. It''s the software between you and the biology.',
  'shared',
  '["cortical-labs","wet-computing","neuroblastsynth","bugs","h5-analysis","debugging"]',
  '[]',
  '2026-04-05 20:00:00'
);

-- ============================================================
-- STEP 8: Insert real Day 13 — Neural Constellation
-- ============================================================
INSERT OR REPLACE INTO posts (id, user_id, day_number, title, content, visibility, tags, media, created_at) VALUES (
  'day13-neural-constellation',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  13,
  'Neural Constellation: a visualization that doesn''t exist anywhere else',
  '## The Experiment

**Goal:** Can we visualize network self-organization in real time? Build something nobody has built before.

## What I Built

**Neural Constellation** — a living star map where each neuron is a star, STTC connections are gravitational bonds, and learning becomes visible as spatial clustering.

- 59 stars on a deep space background. Cyan = readout channels, amber = stim channels.
- **Gravitational physics** — STTC-connected neurons pull toward each other. Strongly connected pairs cluster. Disconnected ones drift apart.
- **Spike pulses** — when a neuron fires, its star flashes bright with a radial glow halo.
- **Evoked response arcs** — when a stim triggers a readout spike, a golden particle arcs between them on a bezier curve. These arcs show active learning pathways.
- **Spring-home physics** — nodes spring gently back toward their grid position so the display doesn''t collapse, but connected clusters visibly tighten.

## Why It''s Unique

Existing MEA visualizations show either spatial grids (heatmaps) or temporal plots (rasters). This is neither — it''s a force-directed connectivity graph that evolves in real time from live neural data. If neurons learn to fire together, their stars literally migrate toward each other across the canvas.

## Also Built: Ch29 VCA Drone

Channel 29''s spike activity controls a sawtooth oscillator like a voltage-controlled amplifier. Record the neural envelope into a loop buffer and the neurons become the sequencer. REC/PLAY/STOP with adjustable loop length and pitch.

## Takeaway

The best way to understand a living system is to watch it move.',
  'shared',
  '["cortical-labs","wet-computing","neuroblastsynth","visualization","constellation","audio"]',
  '[]',
  '2026-04-06 20:00:00'
);

-- ============================================================
-- STEP 9: Insert real Day 14 — Week 2 Reflection
-- ============================================================
INSERT OR REPLACE INTO posts (id, user_id, day_number, title, content, visibility, tags, media, created_at) VALUES (
  'day14-week2-reflection-v2',
  '7ef65aac-ae17-4ce9-9777-3c83dc2f392d',
  14,
  'Week 2 Reflection: from shocking cells to hearing them',
  '## Weekly Check-In

**What made me proud this week?**

The range. This week I ran a social experiment about the ethics of shocking brain cells (nobody cared), analyzed HDF5 neural recordings with professional neuroscience tools, discovered that our most interesting channel was a gamma oscillator we were accidentally suppressing, built a pulse protocol that proved continuous mode was giving us fake correlation, found and fixed 10 critical bugs in our neural synthesizer, and invented a visualization called Neural Constellation that nobody has built before.

Also the Seder afikomen experiment from last night — my kid dismissed his own data because it contradicted his hypothesis. Confirmation bias at the dinner table.

**What surprised me about the process?**

That every single failure was our code, not the biology. The neurons were alive and responding the entire time. We just couldn''t hear them through our own bugs — wrong response window, stim queue buildup, channel saturation, phase errors. The culture was always capable. We were the bottleneck.

Also: nobody caring about shocking human brain cells. I pushed it hard. Even vegetarians shrugged. The only concern was Ken asking whose cells were donated. The consent question, not the suffering question.

**Rating for the week: 7.5/10**

Major jump from last week. The H5 analysis day (Day 10) was the turning point — once we started measuring properly instead of guessing, everything accelerated. The Neural Constellation visualization and the ethics experiment were the creative highlights. The 10-bug discovery on Day 12 was the technical highlight. Best week so far.',
  'shared',
  '["reflection","week2","wet-computing","ethics","bugs","visualization"]',
  '[]',
  '2026-04-07 20:00:00'
);
