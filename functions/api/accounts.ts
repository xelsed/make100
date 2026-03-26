interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = (context.data as any).user;

  const accounts = await context.env.DB.prepare(
    'SELECT id, platform, username, config, connected_at FROM connected_accounts WHERE user_id = ? ORDER BY connected_at ASC'
  ).bind(user.id).all();

  return Response.json(accounts.results);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = (context.data as any).user;
  const body = await context.request.json() as any;

  const { platform, username, config } = body;
  if (!platform || !username) {
    return Response.json({ error: 'platform and username are required' }, { status: 400 });
  }

  const id = crypto.randomUUID();

  try {
    await context.env.DB.prepare(
      `INSERT INTO connected_accounts (id, user_id, platform, username, config)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (user_id, platform) DO UPDATE SET username = ?, config = ?, connected_at = datetime('now')`
    ).bind(id, user.id, platform, username, JSON.stringify(config || {}), username, JSON.stringify(config || {})).run();
  } catch (e: any) {
    return Response.json({ error: 'Failed to save account' }, { status: 500 });
  }

  const saved = await context.env.DB.prepare(
    'SELECT id, platform, username FROM connected_accounts WHERE user_id = ? AND platform = ?'
  ).bind(user.id, platform).first();

  return Response.json(saved || { id, platform, username }, { status: 201 });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const user = (context.data as any).user;
  const url = new URL(context.request.url);
  const platform = url.searchParams.get('platform');

  if (!platform) {
    return Response.json({ error: 'platform query param required' }, { status: 400 });
  }

  await context.env.DB.prepare(
    'DELETE FROM connected_accounts WHERE user_id = ? AND platform = ?'
  ).bind(user.id, platform).run();

  return Response.json({ ok: true });
};
