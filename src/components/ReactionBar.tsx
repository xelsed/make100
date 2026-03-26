import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import type { Post } from '@/types';
import { addReaction, removeReaction, getCurrentUser } from '@/lib/store';
import { EMOJI_OPTIONS } from '@/lib/mock-data';

interface ReactionBarProps {
  post: Post;
}

export default function ReactionBar({ post }: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const currentUser = getCurrentUser();

  const grouped = post.reactions.reduce<Record<string, { count: number; hasOwn: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasOwn: false };
    acc[r.emoji].count++;
    if (r.userId === currentUser.id) acc[r.emoji].hasOwn = true;
    return acc;
  }, {});

  function toggleReaction(emoji: string) {
    const group = grouped[emoji];
    if (group?.hasOwn) {
      removeReaction(post.id, emoji);
    } else {
      addReaction(post.id, emoji);
    }
    setShowPicker(false);
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap relative">
      {Object.entries(grouped).map(([emoji, { count, hasOwn }]) => (
        <button
          key={emoji}
          onClick={() => toggleReaction(emoji)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-150 ${
            hasOwn
              ? 'bg-brand-600/30 border border-brand-500/40 text-brand-300'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
          }`}
        >
          <span>{emoji}</span>
          <span className="font-medium">{count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <SmilePlus className="w-4 h-4" />
        </button>

        {showPicker && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
            <div className="absolute bottom-full left-0 mb-2 z-20 glass rounded-xl p-2 flex gap-1 animate-fade-in">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-base"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
