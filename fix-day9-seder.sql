UPDATE posts SET content = REPLACE(
  content,
  'The most interesting finding isn''t the result — it''s that the experiment was flawed from the start. Designing a fair test is harder than it looks, even at the dinner table.

## Takeaway

The best part of tonight was that everyone at the table started thinking like experimenters. The worst part is that our experiment was terrible science. Happy Passover.',
  'But the most interesting finding wasn''t the experimental design flaws — it was what happened after. The older kid who proposed the hypothesis declared there was "no correlation" when the younger kid found the afikomen first. But there clearly WAS a correlation — it just wasn''t the one he expected. Instead of acknowledging that younger might correlate with faster, he dismissed the entire experiment rather than accept a result that didn''t match his theory.

This is confirmation bias in real time, at a Seder, performed by a child. Scientists do this too. When your data contradicts your hypothesis, the instinct is to throw out the data rather than update the hypothesis.

## Takeaway

The best part of tonight was that everyone at the table started thinking like experimenters. The most revealing part was watching a kid reject his own data because he didn''t like the answer. Happy Passover.'
) WHERE id = 'day9-seder-afikomen';
