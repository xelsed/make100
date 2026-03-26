interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
  'video/x-matroska', 'video/ogg',
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;   // 10 MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;  // 500 MB

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = (context.data as any).user;

  const formData = await context.request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return Response.json({
      error: `File type ${file.type} not allowed. Accepted: images (JPEG, PNG, GIF, WebP, SVG) and videos (MP4, WebM, MOV, AVI, MKV)`,
    }, { status: 415 });
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const limitMB = Math.round(maxSize / (1024 * 1024));
    return Response.json({ error: `File too large (max ${limitMB}MB for ${isVideo ? 'videos' : 'images'})` }, { status: 413 });
  }

  const ext = file.name.split('.').pop() || 'bin';
  const mediaType = isVideo ? 'video' : 'image';
  const key = `${user.id}/${mediaType}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  await context.env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { userId: user.id, originalName: file.name, mediaType },
  });

  return Response.json({
    url: `/api/media/${key}`,
    key,
    contentType: file.type,
    mediaType,
    size: file.size,
  }, { status: 201 });
};
