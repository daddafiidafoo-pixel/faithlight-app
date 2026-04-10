import React, { useState } from 'react';
import { toast } from 'sonner';
import { useReactions } from './useReactions';
import ReactionPicker from './ReactionPicker';
import { REACTION_MAP } from './ReactionConfig';

/**
 * Drop-in reaction bar component.
 * Props:
 *   targetType: 'post' | 'comment' | 'prayer_request' | 'forum_reply'
 *   targetId: string
 *   user: current user object (or null)
 *   onViewers?: (reactionKey | 'all') => void  - open who-reacted sheet
 */
export default function ReactionBar({ targetType, targetId, user, compact = false }) {
  const [showPicker, setShowPicker] = useState(false);
  const { counts, myReactionKey, reactMutation } = useReactions(targetType, targetId, user);

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const topReactions = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleReact = (key) => {
    if (!user) { toast.info('Sign in to react'); return; }
    const wasMyKey = myReactionKey === key;
    reactMutation.mutate(key);
    if (!wasMyKey) {
      const r = REACTION_MAP[key];
      toast.success(`${r.emoji} ${r.label_en}`, { duration: 1500 });
    }
  };

  const myR = myReactionKey ? REACTION_MAP[myReactionKey] : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* React button */}
      <div className="relative">
        <button
          onClick={() => {
            if (myReactionKey) {
              // Toggle off
              handleReact(myReactionKey);
            } else {
              setShowPicker(p => !p);
            }
          }}
          onContextMenu={(e) => { e.preventDefault(); setShowPicker(p => !p); }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all select-none ${
            myR
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          {myR ? (
            <>
              <span className="text-base leading-none">{myR.emoji}</span>
              <span>{myR.label_en}</span>
            </>
          ) : (
            <>
              <span className="text-base leading-none">🤲</span>
              <span>React</span>
            </>
          )}
        </button>

        {showPicker && (
          <ReactionPicker
            currentKey={myReactionKey}
            onSelect={handleReact}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>

      {/* Reaction counts */}
      {totalCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {topReactions.map(([key, count]) => {
            const r = REACTION_MAP[key];
            if (!r) return null;
            return (
              <button
                key={key}
                onClick={() => setShowPicker(p => !p)}
                className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs transition-all ${
                  myReactionKey === key
                    ? 'bg-indigo-100 text-indigo-700 font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={r.label_en}
              >
                <span className="text-sm leading-none">{r.emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
          {!compact && totalCount > 0 && (
            <span className="text-xs text-gray-400 ml-1">{totalCount} {totalCount === 1 ? 'reaction' : 'reactions'}</span>
          )}
        </div>
      )}
    </div>
  );
}