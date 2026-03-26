export type EmbedType = 'github' | 'youtube' | 'vimeo' | 'instagram' | 'twitter' | 'discord' | 'tiktok' | 'loom' | 'arena' | 'link';

export interface DetectedEmbed {
  type: EmbedType;
  url: string;
  meta?: Record<string, string>;
}

const patterns: Array<{ type: EmbedType; regex: RegExp; extract?: (match: RegExpMatchArray) => Record<string, string> }> = [
  {
    type: 'github',
    regex: /https?:\/\/github\.com\/([^/]+\/[^/]+)(\/(?:tree|blob|commit|pull|issues)\/[^\s]*)?/,
    extract: (m) => ({ fullName: m[1], path: m[2] || '' }),
  },
  {
    type: 'youtube',
    regex: /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    extract: (m) => ({ videoId: m[1] }),
  },
  {
    type: 'vimeo',
    regex: /https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/,
    extract: (m) => ({ videoId: m[1] }),
  },
  {
    type: 'loom',
    regex: /https?:\/\/(?:www\.)?loom\.com\/share\/([a-zA-Z0-9]+)/,
    extract: (m) => ({ videoId: m[1] }),
  },
  {
    type: 'instagram',
    regex: /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/,
    extract: (m) => ({ postId: m[1] }),
  },
  {
    type: 'twitter',
    regex: /https?:\/\/(?:(?:www\.)?twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/,
    extract: (m) => ({ username: m[1], tweetId: m[2] }),
  },
  {
    type: 'tiktok',
    regex: /https?:\/\/(?:www\.)?tiktok\.com\/@([^/]+)\/video\/(\d+)/,
    extract: (m) => ({ username: m[1], videoId: m[2] }),
  },
  {
    type: 'discord',
    regex: /https?:\/\/(?:www\.)?discord\.com\/channels\/(\d+)\/(\d+)(?:\/(\d+))?/,
    extract: (m) => ({ guildId: m[1], channelId: m[2], messageId: m[3] || '' }),
  },
  {
    type: 'arena',
    regex: /https?:\/\/(?:www\.)?are\.na\/([^/]+)\/([^/\s]+)/,
    extract: (m) => ({ username: m[1], channel: m[2] }),
  },
];

export function detectUrl(url: string): DetectedEmbed {
  const trimmed = url.trim();
  for (const { type, regex, extract } of patterns) {
    const match = trimmed.match(regex);
    if (match) {
      return {
        type,
        url: trimmed,
        meta: extract ? extract(match) : undefined,
      };
    }
  }
  return { type: 'link', url: trimmed };
}

export function isUrl(text: string): boolean {
  try {
    const u = new URL(text.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function embedTypeLabel(type: EmbedType): string {
  const labels: Record<EmbedType, string> = {
    github: 'GitHub',
    youtube: 'YouTube',
    vimeo: 'Vimeo',
    loom: 'Loom',
    instagram: 'Instagram',
    twitter: 'Twitter / X',
    tiktok: 'TikTok',
    discord: 'Discord',
    arena: 'Are.na',
    link: 'Link',
  };
  return labels[type];
}
