interface Env {
  MEDIA: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const path = (context.params.path as string[]).join('/');

  if (!path) {
    return new Response('Not found', { status: 404 });
  }

  const object = await context.env.MEDIA.get(path);

  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
};
