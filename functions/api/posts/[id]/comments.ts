interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const postId = context.params.id as string;

  const comments = await context.env.DB.prepare(
    `SELECT c.*, u.name as user_name, u.avatar_url as user_avatar_url
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ? ORDER BY c.created_at ASC`
  ).bind(postId).all();

  return Response.json(comments.results.map((c: any) => ({
    ...c,
    user: { id: c.user_id, name: c.user_name, avatar_url: c.user_avatar_url },
  })));
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const postId = context.params.id as string;
  const user = (context.data as any).user;
  const body = await context.request.json() as any;

  const { content } = body;
  if (!content?.trim()) {
    return Response.json({ error: 'content is required' }, { status: 400 });
  }

  const id = crypto.randomUUID();

  await context.env.DB.prepare(
    'INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)'
  ).bind(id, postId, user.id, content.trim()).run();

  return Response.json({
    id,
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
    user: { id: user.id, name: user.name },
    created_at: new Date().toISOString(),
  }, { status: 201 });
};
