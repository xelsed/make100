interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const userId = url.searchParams.get('user_id');
  const tag = url.searchParams.get('tag');
  const cursor = url.searchParams.get('cursor');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const currentUser = (context.data as any).user;
  const currentUserId = currentUser?.id || '__anonymous__';

  let query = `
    SELECT p.*, u.name as user_name, u.email as user_email, u.avatar_url as user_avatar_url,
           u.github_username as user_github_username,
           (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE (p.visibility = 'shared' OR p.user_id = ?)
  `;
  const bindings: unknown[] = [currentUserId];

  if (userId) {
    query += ' AND p.user_id = ?';
    bindings.push(userId);
  }

  if (tag) {
    const sanitizedTag = tag.replace(/[%_"\\]/g, '');
    query += " AND p.tags LIKE ?";
    bindings.push(`%"${sanitizedTag}"%`);
  }

  if (cursor) {
    query += ' AND p.created_at < ?';
    bindings.push(cursor);
  }

  query += ' ORDER BY p.created_at DESC LIMIT ?';
  bindings.push(limit);

  const posts = await context.env.DB.prepare(query).bind(...bindings).all();

  // Fetch reactions for these posts
  const postIds = posts.results.map((p: any) => p.id);
  let reactions: any[] = [];
  if (postIds.length > 0) {
    const placeholders = postIds.map(() => '?').join(',');
    const rxResult = await context.env.DB.prepare(
      `SELECT r.*, u.name as user_name FROM reactions r JOIN users u ON r.user_id = u.id WHERE r.post_id IN (${placeholders})`
    ).bind(...postIds).all();
    reactions = rxResult.results;
  }

  // Group reactions by post
  const reactionsByPost: Record<string, any[]> = {};
  for (const r of reactions) {
    if (!reactionsByPost[r.post_id]) reactionsByPost[r.post_id] = [];
    reactionsByPost[r.post_id].push(r);
  }

  const enriched = posts.results.map((p: any) => ({
    ...p,
    tags: JSON.parse(p.tags || '[]'),
    media: JSON.parse(p.media || '[]'),
    reactions: reactionsByPost[p.id] || [],
    user: {
      id: p.user_id,
      name: p.user_name,
      email: p.user_email,
      avatar_url: p.user_avatar_url,
      github_username: p.user_github_username,
    },
  }));

  const nextCursor = posts.results.length === limit
    ? (posts.results[posts.results.length - 1] as any).created_at
    : null;

  return Response.json({ posts: enriched, nextCursor });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = (context.data as any).user;
  const body = await context.request.json() as any;

  const { title, content, day_number, tags, media, visibility } = body;

  if (!title || !day_number) {
    return Response.json({ error: 'title and day_number are required' }, { status: 400 });
  }

  if (day_number < 1 || day_number > 100) {
    return Response.json({ error: 'day_number must be between 1 and 100' }, { status: 400 });
  }

  const id = crypto.randomUUID();

  try {
    await context.env.DB.prepare(
      `INSERT INTO posts (id, user_id, day_number, title, content, visibility, tags, media)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      user.id,
      day_number,
      title,
      content || '',
      visibility || 'shared',
      JSON.stringify(tags || []),
      JSON.stringify(media || []),
    ).run();
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return Response.json({ error: `You already have a post for day ${day_number}` }, { status: 409 });
    }
    throw e;
  }

  const post = await context.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();

  return Response.json({
    ...post,
    tags: JSON.parse((post as any).tags || '[]'),
    media: JSON.parse((post as any).media || '[]'),
    reactions: [],
    user: { id: user.id, name: user.name, email: user.email },
  }, { status: 201 });
};
