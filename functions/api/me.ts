interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = (context.data as any).user;
  const full = await context.env.DB.prepare(
    'SELECT id, email, name, avatar_url, bio, github_username, role, created_at FROM users WHERE id = ?'
  ).bind(user.id).first();

  return Response.json(full);
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const user = (context.data as any).user;
  const body = await context.request.json() as Record<string, unknown>;

  const allowed = ['name', 'bio', 'github_username', 'avatar_url'];
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const key of allowed) {
    if (key in body) {
      updates.push(`${key} = ?`);
      values.push(body[key]);
    }
  }

  if (updates.length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(user.id);

  await context.env.DB.prepare(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  const updated = await context.env.DB.prepare(
    'SELECT id, email, name, avatar_url, bio, github_username, role, created_at FROM users WHERE id = ?'
  ).bind(user.id).first();

  return Response.json(updated);
};
