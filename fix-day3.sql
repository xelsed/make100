UPDATE posts SET content = REPLACE(
  content,
  '**Results:**
- Worm 1: ~50 seconds
- Worm 2: ~52 seconds
- **Average: ~51 seconds**',
  '**Result:** About 50 seconds per worm across two trials.'
) WHERE id = 'day3-burn-and-learn';
