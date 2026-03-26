export const onRequestPost: PagesFunction = async () => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Set-Cookie', 'm100_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure');
  return new Response(JSON.stringify({ ok: true }), { headers });
};
