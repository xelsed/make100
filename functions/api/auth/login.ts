interface Env {
  DB: D1Database;
  ALLOWED_DOMAINS: string;
  RESEND_API_KEY?: string;
  SITE_URL?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const body = await request.json() as any;
  const email = body.email?.trim()?.toLowerCase();

  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Check access: domain whitelist OR individual invite
  const allowedDomains = (env.ALLOWED_DOMAINS || 'nyu.edu').split(',').map(d => d.trim());
  const domain = email.split('@')[1];
  const domainAllowed = allowedDomains.includes(domain);

  const invited = await env.DB.prepare('SELECT email FROM invited_emails WHERE email = ?').bind(email).first();

  if (!domainAllowed && !invited) {
    return Response.json({ error: `Not authorized. Need an @${allowedDomains[0]} email or an invite.` }, { status: 403 });
  }

  // Generate magic token (48 random chars, 15 min expiry)
  const token = Array.from(crypto.getRandomValues(new Uint8Array(36)))
    .map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 48);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Clean up old tokens for this email, then insert new one
  await env.DB.prepare('DELETE FROM magic_tokens WHERE email = ? OR expires_at < datetime("now")').bind(email).run();
  await env.DB.prepare('INSERT INTO magic_tokens (token, email, expires_at) VALUES (?, ?, ?)').bind(token, email, expiresAt).run();

  // Build magic link
  const siteUrl = env.SITE_URL || new URL(request.url).origin;
  const magicLink = `${siteUrl}/api/auth/verify?token=${token}`;

  // Send email via Resend (or skip in dev)
  const resendKey = env.RESEND_API_KEY;
  if (resendKey) {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'make100 <onboarding@resend.dev>',
        to: [email],
        subject: 'Your make100 login link',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: #18181b; border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.06);">
              <h1 style="color: #84cc16; font-size: 24px; margin: 0 0 8px;">make100</h1>
              <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 24px;">Click the button below to log in to your workshop.</p>
              <a href="${magicLink}" style="display: inline-block; background: #84cc16; color: #09090b; font-weight: 600; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 14px;">
                Enter Workshop
              </a>
              <p style="color: #52525b; font-size: 11px; margin: 24px 0 0;">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error('Resend error:', err);
      return Response.json({ error: 'Failed to send email. Try again.' }, { status: 500 });
    }

    return Response.json({ ok: true, message: 'Magic link sent! Check your email.' });
  }

  // No Resend key = dev mode — return the link directly
  return Response.json({ ok: true, message: 'Magic link sent! Check your email.', devLink: magicLink });
};
