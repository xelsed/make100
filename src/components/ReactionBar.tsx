import { useState, useEffect } from 'react';
import { SmilePlus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const EMOJI_OPTIONS = ['🔥', '❤️', '🤯', '👀', '🎉', '💡', '🚀', '✨'];

interface ReactionBarProps {
  postId: string;
  reactions: any[];
}

export default function ReactionBar({ postId, reactions: initialReactions }: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [reactions, setReactions] = useState(initialReactions);

  useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);
  const { user } = useAuth();

  const grouped = reactions.reduce<Record<string, { count: number; hasOwn: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasOwn: false };
    acc[r.emoji].count++;
    if (r.user_id === user?.id) acc[r.emoji].hasOwn = true;
    return acc;
  }, {});

  async function toggleReaction(emoji: string) {
    setShowPicker(false);
    try {
      const result = await api.toggleReaction(postId, emoji);
      if (result.toggled === 'on') {
        setReactions(prev => [...prev, { emoji, user_id: user?.id, id: crypto.randomUUID() }]);
      } else {
        setReactions(prev => prev.filter(r => !(r.user_id === user?.id && r.emoji === emoji)));
      }
    } catch { }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap relative">
      {Object.entries(grouped).map(([emoji, { count, hasOwn }]) => (
        <button
          key={emoji}
          onClick={() => toggleReaction(emoji)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-150 ${hasOwn
            ? 'bg-lime/15 border border-lime/25 text-lime'
            : 'bg-surface-raised border border-white/[0.06] text-txt-secondary hover:border-lime/20'
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
          title="Add reaction"
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
                  title={emoji}
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
