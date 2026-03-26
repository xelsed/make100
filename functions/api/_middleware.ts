interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ALLOWED_DOMAINS: string;
  SESSION_SECRET?: string;
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

function decodeJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

async function verifyToken(token: string, secret: string): Promise<Record<string, any> | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );

  const sigBytes = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(`${parts[0]}.${parts[1]}`));

  if (!valid) return null;

  const payload = decodeJwt(token);
  if (!payload) return null;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export const onRequest: PagesFunction<Env>[] = [
  async (context) => {
    const { request, env, data } = context;
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Dev-Email',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Public routes — no auth required
    const isAuthRoute = url.pathname.startsWith('/api/auth/');
    const isMediaRoute = url.pathname.startsWith('/api/media/');
    const isPublicGet = request.method === 'GET' && (
      url.pathname.startsWith('/api/posts') ||
      url.pathname === '/api/users'
    );

    if (isAuthRoute || isMediaRoute || isPublicGet) {
      // Still try to resolve user if cookie exists (for visibility filtering)
      const secret = env.SESSION_SECRET || 'make100-dev-secret-change-me';
      const cookies = request.headers.get('Cookie') || '';
      const sessionToken = parseCookie(cookies, 'm100_session');
      if (sessionToken) {
        const payload = await verifyToken(sessionToken, secret);
        if (payload?.sub) {
          const existing = await env.DB.prepare('SELECT id, email, name FROM users WHERE id = ?').bind(payload.sub).first();
          if (existing) (data as any).user = existing;
        }
      }

      const response = await context.next();
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      return newResponse;
    }

    // --- Resolve session ---
    const secret = env.SESSION_SECRET || 'make100-dev-secret-change-me';
    const isDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    let userId: string | null = null;
    let email: string | null = null;
    let userName: string | null = null;

    // 1. Check session cookie
    const cookies = request.headers.get('Cookie') || '';
    const sessionToken = parseCookie(cookies, 'm100_session');
    if (sessionToken) {
      const payload = await verifyToken(sessionToken, secret);
      if (payload) {
        userId = payload.sub;
        email = payload.email;
        userName = payload.name;
      }
    }

    // 2. Dev mode fallback
    if (!email && isDev) {
      const devEmail = request.headers.get('X-Dev-Email');
      if (devEmail) email = devEmail;
    }

    // No session found
    if (!email) {
      return new Response(JSON.stringify({ error: 'Not logged in' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Look up or create user
    let user: { id: string; email: string; name: string };
    if (userId) {
      const existing = await env.DB.prepare('SELECT id, email, name FROM users WHERE id = ?').bind(userId).first();
      if (existing) {
        user = existing as any;
      } else {
        return new Response(JSON.stringify({ error: 'Session invalid' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    } else {
      // Dev mode: upsert by email
      let existing = await env.DB.prepare('SELECT id, email, name FROM users WHERE email = ?').bind(email).first();
      if (!existing) {
        const id = crypto.randomUUID();
        const name = email.split('@')[0];
        await env.DB.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)').bind(id, email, name).run();
        existing = { id, email, name };
      }
      user = existing as any;
    }

    (data as any).user = user;

    const response = await context.next();
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    return newResponse;
  },
];
