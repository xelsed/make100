interface Env {
  DB: D1Database;
  SESSION_SECRET?: string;
  SITE_URL?: string;
}

async function signToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`));
  const sigStr = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${header}.${body}.${sigStr}`;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Missing token', { status: 400 });
  }

  // Look up token
  const row = await env.DB.prepare(
    'SELECT token, email, expires_at, used FROM magic_tokens WHERE token = ?'
  ).bind(token).first() as any;

  if (!row) {
    return redirectWithError(env, request, 'Invalid or expired link. Request a new one.');
  }

  if (row.used) {
    return redirectWithError(env, request, 'This link has already been used. Request a new one.');
  }

  if (new Date(row.expires_at) < new Date()) {
    await env.DB.prepare('DELETE FROM magic_tokens WHERE token = ?').bind(token).run();
    return redirectWithError(env, request, 'This link has expired. Request a new one.');
  }

  // Mark token as used
  await env.DB.prepare('UPDATE magic_tokens SET used = 1 WHERE token = ?').bind(token).run();

  // Upsert user
  const email = row.email;
  let user = await env.DB.prepare('SELECT id, email, name FROM users WHERE email = ?').bind(email).first() as any;

  if (!user) {
    const id = crypto.randomUUID();
    const name = email.split('@')[0];
    await env.DB.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)').bind(id, email, name).run();
    user = { id, email, name };
  }

  // Create session
  const secret = env.SESSION_SECRET || 'make100-dev-secret-change-me';
  const sessionToken = await signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
  }, secret);

  // Redirect to app with session cookie
  const siteUrl = env.SITE_URL || new URL(request.url).origin;
  const headers = new Headers();
  headers.set('Location', siteUrl + '/');
  headers.set('Set-Cookie', `m100_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Secure`);

  return new Response(null, { status: 302, headers });
};

function redirectWithError(env: Env, request: Request, message: string): Response {
  const siteUrl = env.SITE_URL || new URL(request.url).origin;
  const headers = new Headers();
  headers.set('Location', siteUrl + '/?auth_error=' + encodeURIComponent(message));
  return new Response(null, { status: 302, headers });
}
