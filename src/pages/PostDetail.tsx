import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Hash, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePosts, addComment } from '@/lib/store';
import UserAvatar from '@/components/UserAvatar';
import GitHubEmbed from '@/components/GitHubEmbed';
import ReactionBar from '@/components/ReactionBar';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const posts = usePosts();
  const post = posts.find(p => p.id === id);
  const [commentText, setCommentText] = useState('');

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Post not found</p>
        <Link to="/" className="text-brand-400 hover:text-brand-300 text-sm mt-2 inline-block">
          Back to feed
        </Link>
      </div>
    );
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !post) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </Link>

      <article className="glass rounded-2xl p-6 mb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <UserAvatar user={post.user} size="lg" showOnline />
          <div>
            <span className="font-semibold text-gray-100">{post.user.name}</span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Day {post.dayNumber}
              </span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-gray-50 mb-6">{post.title}</h1>

        {/* Content */}
        <div className="markdown-body mb-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        {/* Repos */}
        {post.repos.length > 0 && (
          <div className="space-y-2 mb-6">
            {post.repos.map(repo => (
              <GitHubEmbed key={repo.url} repo={repo} />
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {post.tags.map(tag => (
              <span key={tag} className="tag">
                <Hash className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="pt-4 border-t border-white/5">
          <ReactionBar post={post} />
        </div>
      </article>

      {/* Comments */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-sm text-gray-300 mb-4">
          Comments ({post.comments.length})
        </h3>

        {post.comments.length > 0 && (
          <div className="space-y-4 mb-6">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <UserAvatar user={comment.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-200">{comment.user.name}</span>
                    <span className="text-xs text-gray-600">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment form */}
        <form onSubmit={handleComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="input-field flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
