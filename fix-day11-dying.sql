UPDATE posts SET 
  title = 'Everything stopped working. Are the cells dying?',
  content = '## The Plan

Saturday. After a week of learning the platform — NeuroSynth, BioSynth, H5 analysis, spike classification — I was going to be smart and combine everything we learned into one system. We now kind of understand the parts of the neuron predictably: which channels respond to stim, which ones have intrinsic rhythms, how long the response latency is, what the spike waveforms look like.

I was also wondering: if you can wake up parts of the sample by training them, can you selectively wake up and put to sleep different regions? Like targeted activation of specific neural pathways?

## What Actually Happened

The whole platform stopped working.

Not a code bug. Not a config issue. The neurons just... stopped responding. I could see stimulation going out on the electrode grid but nothing was coming back. The spike count dropped to near zero. The response rate, which had been climbing all week, flatlined.

## The Debugging

I spent the entire day trying to reproduce old tests that had worked earlier in the week. Ran the same BioSynth configs that gave us correlative behavior on Thursday. Ran the NeuroSynth rhythm detection from Tuesday. Tried different stimulation amplitudes, different channels, different waveforms.

Nothing.

## The Fear

I started to think the cells were dying.

Biological neurons on a chip have a finite lifespan. The culture medium needs to be maintained. The cells can be overstimulated — we were sending electrical pulses 24 hours a day for most of the week. What if we literally killed them?

The CL1 console still showed the electrode array. The hardware was fine. But the biology might not be.

## What This Means

If the cells are dying, everything changes. The experiments become time-limited. Every run burns through the culture''s remaining life. The question shifts from "can neurons learn" to "can neurons learn before they die."

## Takeaway

The most humbling thing about biological computing: the hardware has an expiration date. Software doesn''t die when you run it too hard. Neurons do.',
  media = '[]'
WHERE id = 'day11-pulsesynth';
