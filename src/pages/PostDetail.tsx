import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Hash, Send, Lock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/api';
import UserAvatar from '@/components/UserAvatar';
import EmbedRenderer from '@/components/EmbedRenderer';
import ReactionBar from '@/components/ReactionBar';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getPost(id).then(p => {
      setPost(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !post) return;
    setSubmittingComment(true);
    try {
      const comment = await api.addComment(post.id, commentText.trim());
      setPost((prev: any) => ({
        ...prev,
        comments: [...(prev.comments || []), comment],
      }));
      setCommentText('');
    } catch { } finally {
      setSubmittingComment(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }

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

  const user = post.user || { name: 'Unknown' };
  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];
  const mediaBlocks: any[] = Array.isArray(post.media) ? post.media : [];
  const reactions: any[] = Array.isArray(post.reactions) ? post.reactions : [];
  const comments: any[] = Array.isArray(post.comments) ? post.comments : [];

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </Link>

      <article className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <UserAvatar user={user} size="lg" showOnline={false} />
          <div>
            <span className="font-semibold text-txt">{user.name}</span>
            <div className="flex items-center gap-2 text-xs text-txt-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Day {post.day_number}
              </span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              {post.visibility === 'private' && <Lock className="w-3 h-3 text-warm" />}
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-txt mb-6">{post.title}</h1>

        <div className="markdown-body mb-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        {mediaBlocks.length > 0 && (
          <div className="space-y-3 mb-6">
            {mediaBlocks.map((block: any, i: number) => (
              <EmbedRenderer key={i} block={block} />
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {tags.map((tag: string) => (
              <span key={tag} className="tag">
                <Hash className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-white/[0.06]">
          <ReactionBar postId={post.id} reactions={reactions} />
        </div>
      </article>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-sm text-txt mb-4">
          Comments ({comments.length})
        </h3>

        {comments.length > 0 && (
          <div className="space-y-4 mb-6">
            {comments.map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                <UserAvatar user={comment.user || { name: comment.user_name || 'Unknown' }} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-txt">
                      {comment.user?.name || comment.user_name || 'Unknown'}
                    </span>
                    <span className="text-xs text-txt-muted">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-txt-secondary leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

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
            disabled={!commentText.trim() || submittingComment}
            className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-40"
            title="Post comment"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
