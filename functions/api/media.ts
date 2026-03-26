interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = (context.data as any).user;

  const formData = await context.request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: `File type ${file.type} not allowed. Accepted: JPEG, PNG, GIF, WebP, SVG` }, { status: 415 });
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return Response.json({ error: 'File too large (max 10MB)' }, { status: 413 });
  }

  const ext = file.name.split('.').pop() || 'bin';
  const key = `${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  await context.env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { userId: user.id, originalName: file.name },
  });

  return Response.json({
    url: `/api/media/${key}`,
    key,
    contentType: file.type,
    size: file.size,
  }, { status: 201 });
};
