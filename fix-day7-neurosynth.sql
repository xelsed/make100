-- Replace Day 7 BioSynth 3D viz post with actual NeuroSynth Day 1 content
UPDATE posts SET 
  title = 'NeuroSynth Day 1: can we even communicate with the neurons?',
  content = '## The Experiment

**Goal:** Can we get the Cortical Labs CL1 platform running and make neurons do anything detectable?

This was day one with the hardware. The first question is not "can neurons learn" — it is "can we even communicate with them?" We needed to prove the basic loop works: stimulate electrodes, detect spikes, classify patterns, deliver feedback.

## What We Tried

Euclidean rhythm detection via the Free Energy Principle. The setup: stimulate sensory channels with a clock rhythm, read motor channels, classify the binary fire/silent pattern as Euclidean or not, then reward structured responses and punish random ones.

## What Went Wrong (and Got Fixed)

The code crashed on cycle 1. Multiple bugs:

- **random.randint with floats** — Python''s randint only takes integers, but we were passing float channel counts
- **phase_width type casting** — the CL1 hardware expects integer microseconds, not floats
- **No honeycomb layout** — we were stimulating and reading from the same channels. Added alternating checkerboard: even positions = sensory (stim), odd positions = motor (read)

After fixing these, we also built:
- **Per-beat feedback mode** — immediate reward/punishment after each beat instead of waiting for the end of the cycle
- **First audio engine** — pentatonic scale mapping of neural spike activity so you can hear what the neurons are doing
- **Live parameter control** — a control.json file that the experiment watches for real-time adjustments without restarting

## Results

The code ran. Neurons fired. The rhythm visualizer lit up. The electrode activity grid showed purple (stimulation) and orange (spikes) in the right channels.

But we could not tell if the patterns were learned or random. The match rate hovered around what you would expect from chance. The neurons were active but not obviously organized.

## What This Led To

That uncertainty is what drove the next day''s pivot from rhythm detection to continuous waveform training. Binary pattern matching (Euclidean or not) gives you a yes/no answer with no gradient. Continuous waveform correlation (Pearson r) gives you a number between -1 and 1 — a measurable learning signal that can improve gradually.

## Takeaway

Day 1 with biological hardware is never about results. It is about proving the communication channel works. Stimulus in, spikes out, feedback delivered. Everything else builds on that.',
  media = '[{"type":"image","url":"/api/media/day7/biosynth-first-run.png?v=1","alt":"First hardware run - Dual Waveform display showing square wave input (teal) vs neural response (orange), r=-0.023 correlation at Cycle 21, with Raw Signal Alignment showing stim current vs spike counts across channels"}]'
WHERE id = 'day7-biosynth-3d-viz';
