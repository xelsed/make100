-- Fix Day 10 image to use the actual 4/3 screenshot
UPDATE posts SET media = '[{"type":"image","url":"/api/media/day10/biosynth-h5-run.png?v=1","alt":"BioSynth console from Apr 3 - Dual Waveform showing r=0.128 correlation on square wave, Raw Signal Alignment with spike counts per channel, BEST: TRIANGLE r=0.118"}]' WHERE id = 'day10-h5-analysis';

-- Rewrite Day 12 (Sun Apr 5): the overfiring neuron discovery
UPDATE posts SET 
  title = 'One neuron was drowning out everything. I shocked it.',
  content = '## The Discovery

Running analysis on the output from yesterday''s failed sessions, I found the problem: **one neuron was overfiring at ~200Hz**, drowning out every other signal on the array. All the software regressions, all the failed tests, all the "are the cells dying?" panic from yesterday — it was because one single neuron was blasting so loud that nothing else could be heard.

This is why the spike detector was returning zeros. This is why the response rate flatlined. The neuron wasn''t dead. One neuron was TOO alive.

## The Fix

I thought: what if I shock it? Not as punishment — as a reset. Using the CL1 GUI, I targeted that one section of the electrode array and delivered a strong stimulation burst directly to the overfiring channel.

It worked. The overfiring stopped. And suddenly, all the other neurons became visible again. Experiments that had been failing for 24 hours started producing data. The response rate came back. Correlation numbers appeared.

## What We Tested Next

With the array working again, I wanted to test something that had been bothering me all week. We had been sending stimulation pulses that lasted seconds — but real neurons fire in milliseconds. We were talking to them in slow motion.

So I switched to faster pulse rates, closer to the normal response time of a neuron. Instead of multi-second waveforms, we sent quick bursts matching biological timescales. The idea: if you want neurons to respond naturally, send signals at the speed they actually operate.

## Results

The faster pulses produced cleaner responses. The neurons seemed more "comfortable" with stimulation that matched their natural firing rate. The correlation numbers from the quick-pulse experiments were more consistent than anything we had seen with slow waveforms.

## Takeaway

Two insights today:

1. **One bad actor can ruin everything.** A single overfiring neuron at 200Hz was enough to mask the activity of 63 other channels. In biology, as in teams, the loudest signal is not always the most important one.

2. **Speak the language of the system you are trying to communicate with.** Sending second-long waveforms to neurons that fire in milliseconds is like shouting slowly at someone who speaks fast. Match the timescale.'
WHERE id = 'day12-neuroblastsynth-bugs';
