-- The weekly reflection is day 7, so insert the experiment as a second day 7 post with unique ID
-- First remove the unique constraint issue by using day_number 7 but different id
-- Actually, just update the existing reflection to INCLUDE the experiment content
UPDATE posts SET 
  title = 'NeuroSynth Day 1: can we even talk to the neurons? (+ Week 1 reflection)',
  content = '## The Experiment

**Goal:** Can we get the Cortical Labs CL1 platform running and make neurons do anything detectable?

This was day one with the hardware. The first question is not "can neurons learn" — it is "can we even communicate with them?" We needed to prove the basic loop works: stimulate electrodes, detect spikes, classify patterns, deliver feedback.

## What We Tried

Euclidean rhythm detection via the Free Energy Principle. The setup: stimulate sensory channels with a clock rhythm, read motor channels, classify the binary fire/silent pattern as Euclidean or not, then reward structured responses and punish random ones.

## What Went Wrong (and Got Fixed)

The code crashed on cycle 1. Multiple bugs:

- **random.randint with floats** — Python only takes integers, we were passing float channel counts
- **phase_width type casting** — CL1 hardware expects integer microseconds, not floats
- **No honeycomb layout** — stimulating and reading from the same channels. Added alternating checkerboard: even = sensory (stim), odd = motor (read)

After fixing, we also built:
- **Per-beat feedback** — immediate reward/punishment after each beat instead of end-of-cycle
- **First audio engine** — pentatonic scale mapping of neural spike activity
- **Live parameter control** — control.json watched for real-time adjustments

## Results

The code ran. Neurons fired. But we could not tell if the patterns were learned or random. The match rate hovered around chance. That uncertainty drove the next day''s pivot from rhythm detection to continuous waveform training — a signal we could measure with Pearson correlation instead of just pattern matching.

---

## Week 1 Reflection

**What made me proud this week?**

I didn''t miss a day. Seven experiments in seven days. Some were technical (wet computing, building this site), some were observational (Julia at ITP), and one involved holding candy over an open flame. But every day had something.

The gummy bear vs Sour Patch experiment was genuinely fun — when an experiment makes you want to do more experiments, that''s the sign it was actually interesting.

**What surprised me about the process?**

Nobody seems to have an issue with me shocking human brain cells. I''ve been running experiments on actual biological neurons on a chip all week and the reaction from everyone has been nothing.

**Rating for the week: 5.5/10**',
  media = '[{"type":"image","url":"/api/media/day7/biosynth-first-run.png?v=1","alt":"First hardware run - Dual Waveform display showing square wave input (teal) vs neural response (orange), r=-0.023 correlation at Cycle 21, with Raw Signal Alignment showing stim current vs spike counts across channels"}]'
WHERE id = 'day7-week1-reflection';
