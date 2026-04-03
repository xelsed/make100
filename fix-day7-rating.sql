UPDATE posts SET content = REPLACE(
  content,
  '**Rating for the week: 7/10**',
  '**Rating for the week: 5.5/10**'
) WHERE id = 'day7-week1-reflection';
