import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Crown, Users, Globe, Star, MessageCircle, HelpCircle, Loader2 } from 'lucide-react';

const RANK_CONFIG = [
  { min: 0, label: 'Seeker', color: 'text-gray-500', bg: 'bg-gray-100' },
  { min: 100, label: 'Disciple', color: 'text-blue-600', bg: 'bg-blue-100' },
  { min: 500, label: 'Scholar', color: 'text-purple-600', bg: 'bg-purple-100' },
  { min: 1000, label: 'Elder', color: 'text-amber-600', bg: 'bg-amber-100' },
  { min: 2500, label: 'Apostle', color: 'text-rose-600', bg: 'bg-rose-100' },
  { min: 5000, label: 'Prophet', color: 'text-indigo-700', bg: 'bg-indigo-100' },
];
const getRank = (pts) => [...RANK_CONFIG].reverse().find(r => pts >= r.min) || RANK_CONFIG[0];

const VIEWS = [
  { id: 'global', label: 'Global', icon: Globe },
  { id: 'contributions', label: 'Contributions', icon: MessageCircle },
  { id: 'streaks', label: 'Streaks', icon: Flame },
];

function UserRow({ entry, rank, isCurrentUser, viewMode }) {
  const rankCfg = getRank(entry.total_points || 0);
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isCurrentUser ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}>
      <div className="w-8 text-center flex-shrink-0">
        {medal ? <span className="text-xl">{medal}</span> : <span className="text-sm font-bold text-gray-400">#{rank}</span>}
      </div>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {entry.user_name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-sm text-gray-900 truncate">{entry.user_name || 'Anonymous'}</p>
          {isCurrentUser && <span className="text-[10px] text-indigo-600 font-bold bg-indigo-100 px-1.5 py-0.5 rounded-full">You</span>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${rankCfg.bg} ${rankCfg.color}`}>{rankCfg.label}</span>
          {(entry.current_streak || 0) > 0 && (
            <span className="text-[10px] text-orange-500 flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5" />{entry.current_streak}d streak
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        {viewMode === 'streaks' ? (
          <>
            <p className="font-bold text-orange-600">{entry.current_streak || 0}</p>
            <p className="text-[10px] text-gray-400">days</p>
          </>
        ) : viewMode === 'contributions' ? (
          <>
            <p className="font-bold text-green-600">{entry.contribution_points || entry.total_points || 0}</p>
            <p className="text-[10px] text-gray-400">contrib pts</p>
          </>
        ) : (
          <>
            <p className="font-bold text-indigo-700">{(entry.total_points || 0).toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">pts</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CommunityLeaderboard({ currentUserId }) {
  const [view, setView] = useState('global');

  const { data: globalBoard = [], isLoading } = useQuery({
    queryKey: ['community-leaderboard'],
    queryFn: async () => {
      const [points, streaks] = await Promise.all([
        base44.entities.UserPoints.list('-total_points', 50).catch(() => []),
        base44.entities.UserStreak.list('-current_streak', 50).catch(() => []),
      ]);
      // Merge streak data into points
      return points.map(p => {
        const streak = streaks.find(s => s.user_id === p.user_id);
        return { ...p, current_streak: streak?.current_streak || 0 };
      });
    },
    staleTime: 60000,
  });

  const sorted = view === 'streaks'
    ? [...globalBoard].sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0))
    : view === 'contributions'
    ? [...globalBoard].sort((a, b) => (b.contribution_points || b.total_points || 0) - (a.contribution_points || a.total_points || 0))
    : globalBoard;

  const currentUserEntry = sorted.find(e => e.user_id === currentUserId);
  const currentUserRank = currentUserEntry ? sorted.indexOf(currentUserEntry) + 1 : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" /> Community Leaderboard
          </CardTitle>
          {currentUserRank && (
            <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">
              Your rank: #{currentUserRank}
            </Badge>
          )}
        </div>
        <div className="flex gap-1 mt-2 p-1 bg-gray-100 rounded-lg">
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setView(id)}
              className={`flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-md transition-all ${
                view === id ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No rankings yet.</div>
        ) : (
          <div className="space-y-1">
            {sorted.slice(0, 20).map((entry, i) => (
              <UserRow key={entry.id} entry={entry} rank={i + 1}
                isCurrentUser={entry.user_id === currentUserId} viewMode={view} />
            ))}
          </div>
        )}

        {view === 'contributions' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-2">How to earn contribution points:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { icon: '📝', label: 'Answer a forum question', pts: '+15 pts' },
                { icon: '👍', label: 'Get your post liked', pts: '+2 pts' },
                { icon: '💬', label: 'Write an insightful comment', pts: '+5 pts' },
                { icon: '🙏', label: 'Pray for a request', pts: '+3 pts' },
                { icon: '📖', label: 'Complete a study plan', pts: '+50 pts' },
                { icon: '🏆', label: 'Win a challenge', pts: '+100 pts' },
              ].map(({ icon, label, pts }) => (
                <div key={label} className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="text-xs text-gray-600 flex-1">{label}</span>
                  <span className="text-xs font-semibold text-green-600">{pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}