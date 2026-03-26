interface Env {
  DB: D1Database;
  ALLOWED_DOMAINS: string;
  SESSION_SECRET?: string;
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const body = await context.request.json() as any;
  const email = body.email?.trim()?.toLowerCase();

  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }

  const allowedDomains = (env.ALLOWED_DOMAINS || 'nyu.edu').split(',').map(d => d.trim());
  const domain = email.split('@')[1];

  if (!allowedDomains.includes(domain)) {
    return Response.json({ error: `@${domain} is not an allowed domain` }, { status: 403 });
  }

  // Upsert user
  let user = await env.DB.prepare('SELECT id, email, name FROM users WHERE email = ?').bind(email).first() as any;

  if (!user) {
    const id = crypto.randomUUID();
    const name = email.split('@')[0];
    await env.DB.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)').bind(id, email, name).run();
    user = { id, email, name };
  }

  // Create signed session token (7 day expiry)
  const secret = env.SESSION_SECRET || 'make100-dev-secret-change-me';
  const token = await signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
  }, secret);

  // Set as httpOnly cookie
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Set-Cookie', `m100_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Secure`);

  return new Response(JSON.stringify({ ok: true, user: { id: user.id, email: user.email, name: user.name } }), { headers });
};
