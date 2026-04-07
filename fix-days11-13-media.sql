-- Day 11: dead neurons screenshot - r=0.000, Response Rate 0%, flat response
UPDATE posts SET media = '[{"type":"image","url":"/api/media/day11/dead-neurons.png?v=1","alt":"NeuroBlastSynth console showing r=0.000, Response Rate 0%, flat yellow response line, NO VARIANCE - the neurons stopped responding"}]' WHERE id = 'day11-pulsesynth';

-- Day 12: neuroblast working - r=0.782, Response Rate 4%, reward_strong
UPDATE posts SET media = '[{"type":"image","url":"/api/media/day12/neuroblast-working.png?v=1","alt":"NeuroBlastSynth console showing r=0.782 correlation, Response Rate 4%, feedback reward_strong - after fixing 10 bugs, the neurons are responding again"}]' WHERE id = 'day12-neuroblastsynth-bugs';

-- Day 13: neural circuit connections + cross-correlogram
UPDATE posts SET media = '[{"type":"image","url":"/api/media/day13/neural-circuit.png?v=1","alt":"Neural Circuit showing stim-to-response connections between channels, cross-correlogram of response timing, live spectrum bars, and phase coherence analysis"}]' WHERE id = 'day13-neural-constellation';
