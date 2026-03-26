import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, Filter, Loader2 } from 'lucide-react';
import PostCard from '@/components/PostCard';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type SortMode = 'recent' | 'day';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>('recent');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, [filterTag]);

  async function loadPosts() {
    setLoading(true);
    try {
      const result = await api.getPosts({ tag: filterTag || undefined });
      setPosts(result.posts);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  const allTags = [...new Set(posts.flatMap((p: any) => p.tags || []))].sort();

  const sorted = [...posts].sort((a, b) => {
    if (sort === 'day') return b.day_number - a.day_number;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const maxDay = posts.length > 0 ? Math.max(...posts.map((p: any) => p.day_number)) : 0;

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold gradient-text mb-2">100 Days in Making</h1>
        <p className="text-[#7a7a85] text-sm">
          A daily log of experiments, builds, and discoveries.
        </p>
      </div>

      {/* Progress bar */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#7a7a85]">Progress</span>
          <span className="text-xs font-bold text-brand-400">
            {maxDay} / 100 days
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-coral to-amber rounded-full transition-all duration-500"
            style={{ width: `${maxDay}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSort('recent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sort === 'recent' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Recent
          </button>
          <button
            onClick={() => setSort('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sort === 'day' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            <Flame className="w-3.5 h-3.5" />
            By Day
          </button>
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <button
              onClick={() => setFilterTag(null)}
              className={`px-2 py-0.5 rounded-full text-xs transition-colors ${!filterTag ? 'bg-brand-600/30 text-brand-300' : 'bg-white/5 text-gray-500 hover:text-gray-300'
                }`}
            >
              All
            </button>
            {allTags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-full text-xs transition-colors ${filterTag === tag ? 'bg-brand-600/30 text-brand-300' : 'bg-white/5 text-gray-500 hover:text-gray-300'
                  }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
          </div>
        ) : sorted.length > 0 ? (
          sorted.map((post: any) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-16 text-gray-600">
            <p className="text-lg font-medium mb-1">No posts yet</p>
            <p className="text-sm mb-4">Start your 100-day journey by creating your first post.</p>
            <Link to="/new" className="btn-primary inline-flex">New Post</Link>
          </div>
        )}
      </div>
    </div>
  );
}
