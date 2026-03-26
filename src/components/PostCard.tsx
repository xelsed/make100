import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, Hash, Globe, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import UserAvatar from './UserAvatar';
import EmbedRenderer from './EmbedRenderer';
import ReactionBar from './ReactionBar';

interface PostCardProps {
  post: any;
  compact?: boolean;
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);

  const contentPreview = post.content?.length > 400 && !expanded
    ? post.content.slice(0, 400) + '...'
    : post.content || '';

  const user = post.user || { id: post.user_id, name: post.user_name || 'Unknown' };
  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];
  const mediaBlocks: any[] = Array.isArray(post.media) ? post.media : [];
  const reactions: any[] = Array.isArray(post.reactions) ? post.reactions : [];
  const commentCount = post.comment_count ?? post.comments?.length ?? 0;

  return (
    <article className="post-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <UserAvatar user={user} showOnline={false} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-100">{user.name}</span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Day {post.day_number}</span>
            {post.visibility === 'private' && <Lock className="w-3 h-3 ml-1 text-amber" />}
          </div>
        </div>
      </div>

      {/* Title */}
      <Link to={`/post/${post.id}`} className="block group mb-3">
        <h2 className="text-lg font-bold text-gray-50 group-hover:text-brand-400 transition-colors">
          {post.title}
        </h2>
      </Link>

      {/* Content */}
      {!compact && contentPreview && (
        <div className="markdown-body mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentPreview}</ReactMarkdown>
          {post.content?.length > 400 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-brand-400 hover:text-brand-300 text-sm font-medium mt-1 transition-colors"
            >
              Read more
            </button>
          )}
        </div>
      )}

      {/* Media embeds */}
      {mediaBlocks.length > 0 && (
        <div className="space-y-2 mb-4">
          {mediaBlocks.slice(0, compact ? 1 : 3).map((block: any, i: number) => (
            <EmbedRenderer key={i} block={block} />
          ))}
          {mediaBlocks.length > 3 && !compact && (
            <Link to={`/post/${post.id}`} className="text-xs text-gray-500 hover:text-gray-300">
              +{mediaBlocks.length - 3} more
            </Link>
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag: string) => (
            <span key={tag} className="tag">
              <Hash className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <ReactionBar postId={post.id} reactions={reactions} />
        <Link
          to={`/post/${post.id}`}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {commentCount > 0 && <span>{commentCount}</span>}
        </Link>
      </div>
    </article>
  );
}
