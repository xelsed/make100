import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Play, Image as ImageIcon, Link as LinkIcon, MessageCircle } from 'lucide-react';
import type { EmbedType } from '@/lib/url-detect';
import { fetchRepoMetadata, getLanguageColor } from '@/lib/github';

interface MediaBlock {
  type: EmbedType | 'image' | 'video' | 'code' | 'file';
  url: string;
  meta?: Record<string, any>;
  language?: string;
  content?: string;
  alt?: string;
  filename?: string;
}

interface EmbedRendererProps {
  block: MediaBlock;
}

export default function EmbedRenderer({ block }: EmbedRendererProps) {
  switch (block.type) {
    case 'github':
      return <GitHubCard url={block.url} meta={block.meta} />;
    case 'youtube':
      return <YouTubeEmbed url={block.url} meta={block.meta} />;
    case 'vimeo':
      return <VimeoEmbed meta={block.meta} />;
    case 'loom':
      return <LoomEmbed meta={block.meta} />;
    case 'instagram':
      return <SocialCard url={block.url} platform="Instagram" color="#E1306C" />;
    case 'twitter':
      return <SocialCard url={block.url} platform="Twitter / X" color="#1DA1F2" />;
    case 'tiktok':
      return <SocialCard url={block.url} platform="TikTok" color="#00f2ea" />;
    case 'discord':
      return <SocialCard url={block.url} platform="Discord" color="#5865F2" icon={<MessageCircle className="w-4 h-4" />} />;
    case 'arena':
      return <SocialCard url={block.url} platform="Are.na" color="#8c8c8c" />;
    case 'image':
      return <ImageEmbed url={block.url} alt={block.alt} />;
    case 'video':
      return <VideoEmbed url={block.url} meta={block.meta} />;
    case 'code':
      return <CodeBlock language={block.language} content={block.content || ''} />;
    case 'link':
    default:
      return <GenericLink url={block.url} meta={block.meta} />;
  }
}

function GitHubCard({ url, meta }: { url: string; meta?: Record<string, any> }) {
  const [repo, setRepo] = useState<any>(meta?.fetched ? meta : null);
  const [loading, setLoading] = useState(!meta?.fetched);

  useEffect(() => {
    if (!meta?.fetched) {
      fetchRepoMetadata(url).then(r => {
        setRepo(r);
        setLoading(false);
      });
    }
  }, [url, meta]);

  if (loading) {
    return (
      <div className="glass rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
      </div>
    );
  }

  if (!repo) {
    return <GenericLink url={url} />;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block glass rounded-xl p-4 glass-hover group border-l-2 border-lime-dim">
      <div className="flex items-center gap-2 mb-1.5">
        <Github className="w-4 h-4 text-gray-400" />
        <span className="text-lime font-semibold text-sm truncate group-hover:text-lime-bright transition-colors">
          {repo.fullName || repo.full_name}
        </span>
        <ExternalLink className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {repo.description && (
        <p className="text-txt-secondary text-xs leading-relaxed line-clamp-2 mb-2">{repo.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-txt-muted">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: getLanguageColor(repo.language) }} />
            {repo.language}
          </span>
        )}
        {repo.stars != null && <span>&#9733; {repo.stars}</span>}
      </div>
    </a>
  );
}

function YouTubeEmbed({ url, meta }: { url: string; meta?: Record<string, any> }) {
  const videoId = meta?.videoId || url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/)?.[1];
  if (!videoId) return <GenericLink url={url} />;

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <div className="relative pb-[56.25%] bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    </div>
  );
}

function VimeoEmbed({ meta }: { meta?: Record<string, any> }) {
  const videoId = meta?.videoId;
  if (!videoId) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <div className="relative pb-[56.25%] bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://player.vimeo.com/video/${videoId}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo video"
        />
      </div>
    </div>
  );
}

function LoomEmbed({ meta }: { meta?: Record<string, any> }) {
  const videoId = meta?.videoId;
  if (!videoId) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <div className="relative pb-[56.25%] bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.loom.com/embed/${videoId}`}
          allowFullScreen
          title="Loom video"
        />
      </div>
    </div>
  );
}

function SocialCard({ url, platform, color, icon }: { url: string; platform: string; color: string; icon?: React.ReactNode }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block glass rounded-xl p-4 glass-hover group" style={{ borderLeft: `2px solid ${color}` }}>
      <div className="flex items-center gap-2">
        {icon || <ExternalLink className="w-4 h-4" style={{ color }} />}
        <span className="font-medium text-sm" style={{ color }}>{platform}</span>
        <ExternalLink className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-gray-500 text-xs mt-1 truncate">{url}</p>
    </a>
  );
}

function ImageEmbed({ url, alt }: { url: string; alt?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <img src={url} alt={alt || 'Uploaded image'} className="w-full object-contain max-h-[500px] bg-black/50" loading="lazy" />
    </div>
  );
}

function VideoEmbed({ url, meta }: { url: string; meta?: Record<string, any> }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-black">
      <video
        src={url}
        controls
        preload="metadata"
        className="w-full max-h-[500px]"
        playsInline
      >
        Your browser does not support video playback.
      </video>
      {meta?.size && (
        <div className="px-3 py-1.5 border-t border-white/[0.06] text-[10px] text-txt-muted flex items-center gap-2">
          <Play className="w-3 h-3" />
          <span>{(meta.size / (1024 * 1024)).toFixed(1)} MB</span>
        </div>
      )}
    </div>
  );
}

function CodeBlock({ language, content }: { language?: string; content: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-base">
      {language && (
        <div className="px-4 py-1.5 border-b border-white/5 text-xs text-gray-500 font-mono">{language}</div>
      )}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
        <code>{content}</code>
      </pre>
    </div>
  );
}

function GenericLink({ url, meta }: { url: string; meta?: Record<string, any> }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block glass rounded-xl p-4 glass-hover group border-l-2 border-gray-700">
      <div className="flex items-center gap-2">
        <LinkIcon className="w-4 h-4 text-gray-400" />
        <span className="text-accent-secondary font-medium text-sm truncate group-hover:text-lime transition-colors">
          {meta?.title || (() => { try { return new URL(url).hostname; } catch { return url; } })()}
        </span>
        <ExternalLink className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {meta?.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{meta.description}</p>}
      <p className="text-gray-600 text-xs mt-0.5 truncate">{url}</p>
    </a>
  );
}

export type { MediaBlock };
