interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const users = await context.env.DB.prepare(
    'SELECT id, email, name, avatar_url, bio, github_username, created_at FROM users ORDER BY created_at ASC'
  ).all();

  return Response.json(users.results);
};
