import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Post } from '@/types';
import UserAvatar from './UserAvatar';
import GitHubEmbed from './GitHubEmbed';
import ReactionBar from './ReactionBar';

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);

  const contentPreview = post.content.length > 400 && !expanded
    ? post.content.slice(0, 400) + '...'
    : post.content;

  return (
    <article className="post-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <UserAvatar user={post.user} showOnline />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-100">{post.user.name}</span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Day {post.dayNumber}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <Link
        to={`/post/${post.id}`}
        className="block group mb-3"
      >
        <h2 className="text-lg font-bold text-gray-50 group-hover:text-brand-400 transition-colors">
          {post.title}
        </h2>
      </Link>

      {/* Content */}
      {!compact && (
        <div className="markdown-body mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {contentPreview}
          </ReactMarkdown>
          {post.content.length > 400 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-brand-400 hover:text-brand-300 text-sm font-medium mt-1 transition-colors"
            >
              Read more
            </button>
          )}
        </div>
      )}

      {/* GitHub Repos */}
      {post.repos.length > 0 && (
        <div className="space-y-2 mb-4">
          {post.repos.map(repo => (
            <GitHubEmbed key={repo.url} repo={repo} />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="tag">
              <Hash className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Reactions + Comments */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <ReactionBar post={post} />
        <Link
          to={`/post/${post.id}`}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {post.comments.length > 0 && <span>{post.comments.length}</span>}
        </Link>
      </div>
    </article>
  );
}
