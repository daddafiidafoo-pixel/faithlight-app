import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, Flame, Globe, Users, Loader2, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const RANK_CONFIG = [
  { min: 0, label: 'Seeker', color: 'text-gray-500', bg: 'bg-gray-100' },
  { min: 100, label: 'Disciple', color: 'text-blue-600', bg: 'bg-blue-100' },
  { min: 500, label: 'Scholar', color: 'text-purple-600', bg: 'bg-purple-100' },
  { min: 1000, label: 'Elder', color: 'text-amber-600', bg: 'bg-amber-100' },
  { min: 2500, label: 'Apostle', color: 'text-rose-600', bg: 'bg-rose-100' },
  { min: 5000, label: 'Prophet', color: 'text-indigo-700', bg: 'bg-indigo-100' },
];

const getRank = (pts) => [...RANK_CONFIG].reverse().find(r => pts >= r.min) || RANK_CONFIG[0];

function UserRow({ entry, rank, isCurrentUser }) {
  const rankCfg = getRank(entry.total_points || 0);
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isCurrentUser ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}>
      <div className="w-8 text-center">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="text-sm font-bold text-gray-400">#{rank}</span>
        )}
      </div>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {entry.user_name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-gray-900 truncate">{entry.user_name || 'Anonymous'}</p>
          {isCurrentUser && <span className="text-[10px] text-indigo-600 font-bold">You</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${rankCfg.bg} ${rankCfg.color}`}>{rankCfg.label}</span>
          {(entry.current_streak || 0) > 0 && (
            <span className="text-[10px] text-orange-500 flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5" />{entry.current_streak}d
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-indigo-700">{(entry.total_points || 0).toLocaleString()}</p>
        <p className="text-[10px] text-gray-400">pts</p>
      </div>
    </div>
  );
}

export default function LeaderboardPanel({ currentUserId }) {
  const [view, setView] = useState('global'); // 'global' | 'friends'

  const { data: globalBoard = [], isLoading: loadingGlobal } = useQuery({
    queryKey: ['leaderboard-global'],
    queryFn: () => base44.entities.UserPoints.list('-updated_date', 50).catch(() => []),
    retry: false,
    staleTime: 60000,
  });

  const { data: friendIds = [] } = useQuery({
    queryKey: ['friend-ids', currentUserId],
    queryFn: () => base44.entities.Friend.filter({ user_id: currentUserId, status: 'accepted' }, '-updated_date', 100)
      .then(r => r.map(f => f.friend_id)).catch(() => []),
    enabled: !!currentUserId && view === 'friends',
    retry: false,
  });

  const friendsBoard = view === 'friends'
    ? globalBoard.filter(e => e.user_id === currentUserId || friendIds.includes(e.user_id))
    : globalBoard;

  const board = view === 'friends' ? friendsBoard : globalBoard;
  const isLoading = loadingGlobal;

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-gray-900">Leaderboard</h3>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView('global')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'global' ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}
          >
            <Globe className="w-3.5 h-3.5" /> Global
          </button>
          <button
            onClick={() => setView('friends')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'friends' ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}
          >
            <Users className="w-3.5 h-3.5" /> Friends
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : board.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          {view === 'friends' ? 'Add friends to see a friends leaderboard!' : 'No rankings yet.'}
        </div>
      ) : (
        <div className="space-y-1">
          {board.slice(0, 20).map((entry, i) => (
            <UserRow key={entry.id} entry={entry} rank={i + 1} isCurrentUser={entry.user_id === currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}