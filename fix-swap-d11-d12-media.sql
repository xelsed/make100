-- Day 11 (Sat): everything stopped, no useful screenshot to show
UPDATE posts SET media = '[]' WHERE id = 'day11-pulsesynth';

-- Day 12 (Sun): the dead neurons screenshot shows the problem BEFORE the fix (r=0.000, flat response, NO VARIANCE)
-- Plus the working screenshot AFTER shocking the overfiring neuron (r=0.782, reward_strong)
UPDATE posts SET media = '[{"type":"image","url":"/api/media/day11/dead-neurons.png?v=1","alt":"BEFORE: NeuroBlastSynth showing r=0.000, Response Rate 0%, flat response, NO VARIANCE — one neuron overfiring at 200Hz drowning everything out"},{"type":"image","url":"/api/media/day12/neuroblast-working.png?v=1","alt":"AFTER: shocked the overfiring neuron — r=0.782, Response Rate 4%, reward_strong, experiments working again"}]' WHERE id = 'day12-neuroblastsynth-bugs';
