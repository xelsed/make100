interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const postId = context.params.id as string;
  const currentUser = (context.data as any).user;
  const currentUserId = currentUser?.id || '__anonymous__';

  const post = await context.env.DB.prepare(
    `SELECT p.*, u.name as user_name, u.email as user_email, u.avatar_url as user_avatar_url,
            u.github_username as user_github_username
     FROM posts p JOIN users u ON p.user_id = u.id
     WHERE p.id = ? AND (p.visibility = 'shared' OR p.user_id = ?)`
  ).bind(postId, currentUserId).first();

  if (!post) {
    return Response.json({ error: 'Post not found' }, { status: 404 });
  }

  const reactions = await context.env.DB.prepare(
    'SELECT r.*, u.name as user_name FROM reactions r JOIN users u ON r.user_id = u.id WHERE r.post_id = ?'
  ).bind(postId).all();

  const comments = await context.env.DB.prepare(
    `SELECT c.*, u.name as user_name, u.avatar_url as user_avatar_url
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ? ORDER BY c.created_at ASC`
  ).bind(postId).all();

  return Response.json({
    ...(post as any),
    tags: JSON.parse((post as any).tags || '[]'),
    media: JSON.parse((post as any).media || '[]'),
    reactions: reactions.results,
    comments: comments.results.map((c: any) => ({
      ...c,
      user: { id: c.user_id, name: c.user_name, avatar_url: c.user_avatar_url },
    })),
    user: {
      id: (post as any).user_id,
      name: (post as any).user_name,
      email: (post as any).user_email,
      avatar_url: (post as any).user_avatar_url,
      github_username: (post as any).user_github_username,
    },
  });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const postId = context.params.id as string;
  const user = (context.data as any).user;

  const existing = await context.env.DB.prepare(
    'SELECT user_id FROM posts WHERE id = ?'
  ).bind(postId).first();

  if (!existing) return Response.json({ error: 'Post not found' }, { status: 404 });
  if ((existing as any).user_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = await context.request.json() as any;
  const allowed = ['title', 'content', 'tags', 'media', 'visibility', 'day_number'];
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const key of allowed) {
    if (key in body) {
      const val = (key === 'tags' || key === 'media') ? JSON.stringify(body[key]) : body[key];
      updates.push(`${key} = ?`);
      values.push(val);
    }
  }

  if (updates.length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(postId);

  await context.env.DB.prepare(
    `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  const updated = await context.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(postId).first();

  return Response.json({
    ...(updated as any),
    tags: JSON.parse((updated as any).tags || '[]'),
    media: JSON.parse((updated as any).media || '[]'),
  });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const postId = context.params.id as string;
  const user = (context.data as any).user;

  const existing = await context.env.DB.prepare(
    'SELECT user_id FROM posts WHERE id = ?'
  ).bind(postId).first();

  if (!existing) return Response.json({ error: 'Post not found' }, { status: 404 });
  if ((existing as any).user_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

  await context.env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();

  return Response.json({ ok: true });
};
