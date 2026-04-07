-- Remove bad image and rewrite Day 13 content
UPDATE posts SET 
  title = 'Building a parameter sweep generator: how do you learn a specimen?',
  content = '## The Experiment

**Goal:** Build a system that automatically generates many different stimulation patterns to map the response profile of a specific neural culture.

**Reason:** All week we have been manually tweaking parameters — try this waveform, try that amplitude, change the pulse width, adjust the frequency. Each run teaches us one thing about one setting. What if we could systematically sweep across the entire parameter space and let the data tell us what this particular specimen responds to?

## The Idea

Every neural culture is different. The cells grew differently, formed different connections, have different excitability profiles. What works on one chip might not work on another. Instead of guessing, we need a way to characterize each specimen — like running a diagnostic before you start training.

The parameter sweep generator creates a config file that cycles through combinations of:

- **Waveform types** — sine, square, triangle, sawtooth
- **Frequencies** — 0.5Hz, 1Hz, 2Hz, 5Hz, 10Hz
- **Amplitudes** — 0.5uA to 2.5uA in steps
- **Pulse widths** — 100us to 300us
- **Rest periods** — 50ms to 500ms
- **Channel configurations** — different honeycomb rotations

Each combination runs for a fixed number of cycles, logs the response rate, correlation, and spike characteristics, then moves to the next. At the end you have a heat map of what this culture responds to.

## Why This Matters

The current approach is artisanal — we sit at the console, watch the numbers, and manually adjust. That does not scale. If you want to run experiments on multiple cultures or repeat experiments across days, you need a systematic baseline measurement.

Think of it like a hearing test. Before you put headphones on someone and play music, you test which frequencies they can hear and at what volume. The sweep generator is a hearing test for neurons.

## What We Built

A Python script that:
1. Takes a base config as input
2. Generates N variations across the parameter space
3. Runs each variation for a set number of cycles
4. Logs all metrics to a structured output file
5. Produces a summary showing which parameters got the strongest responses

## Takeaway

The best experiment is often not the experiment itself — it is building the tool that lets you run a thousand experiments automatically. Today was about infrastructure, not results.',
  media = '[]'
WHERE id = 'day13-neural-constellation';
