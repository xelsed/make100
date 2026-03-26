interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ALLOWED_DOMAINS: string;
}

interface CfAccessJWT {
  email: string;
  sub: string;
  iat: number;
  exp: number;
}

function parseJwt(token: string): CfAccessJWT | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload as CfAccessJWT;
  } catch {
    return null;
  }
}

function generateId(): string {
  return crypto.randomUUID();
}

async function upsertUser(db: D1Database, email: string): Promise<{ id: string; email: string; name: string }> {
  const existing = await db.prepare('SELECT id, email, name FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    return existing as { id: string; email: string; name: string };
  }

  const id = generateId();
  const name = email.split('@')[0];
  await db.prepare(
    'INSERT INTO users (id, email, name) VALUES (?, ?, ?)'
  ).bind(id, email, name).run();

  return { id, email, name };
}

export const onRequest: PagesFunction<Env>[] = [
  async (context) => {
    const { request, env, data } = context;

    // CORS headers for all API routes
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // In development, allow a mock user via X-Dev-Email header
    const devEmail = request.headers.get('X-Dev-Email');
    const cfJwt = request.headers.get('CF-Access-Jwt-Assertion');

    let email: string | null = null;

    if (cfJwt) {
      const jwt = parseJwt(cfJwt);
      if (jwt?.email) {
        email = jwt.email;
      }
    } else if (devEmail) {
      email = devEmail;
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'Unauthorized — no valid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check email domain
    const allowedDomains = (env.ALLOWED_DOMAINS || 'nyu.edu').split(',').map(d => d.trim());
    const emailDomain = email.split('@')[1];
    if (!allowedDomains.includes(emailDomain)) {
      return new Response(JSON.stringify({ error: `Email domain @${emailDomain} is not allowed` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upsert user and attach to context
    const user = await upsertUser(env.DB, email);
    (data as any).user = user;

    // Continue to the actual route handler
    const response = await context.next();

    // Add CORS headers to response
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    return newResponse;
  },
];
