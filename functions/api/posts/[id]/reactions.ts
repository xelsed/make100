interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const postId = context.params.id as string;
  const user = (context.data as any).user;
  const body = await context.request.json() as any;

  const { emoji } = body;
  if (!emoji) {
    return Response.json({ error: 'emoji is required' }, { status: 400 });
  }

  const id = crypto.randomUUID();

  try {
    await context.env.DB.prepare(
      'INSERT INTO reactions (id, post_id, user_id, emoji) VALUES (?, ?, ?, ?)'
    ).bind(id, postId, user.id, emoji).run();
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      // Already reacted with this emoji — remove it (toggle)
      await context.env.DB.prepare(
        'DELETE FROM reactions WHERE post_id = ? AND user_id = ? AND emoji = ?'
      ).bind(postId, user.id, emoji).run();
      return Response.json({ toggled: 'off', emoji });
    }
    throw e;
  }

  return Response.json({ toggled: 'on', emoji, id }, { status: 201 });
};
