import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flame, Loader2, Crown } from 'lucide-react';

export default function GroupLeaderboard({ groupId, currentUserId }) {
  const { data: members = [], isLoading: loadingMembers } = useQuery({
    queryKey: ['group-members-lb', groupId],
    queryFn: () => base44.entities.GroupMember.filter({ group_id: groupId }, '-updated_date', 100).catch(() => []),
    enabled: !!groupId, retry: false,
  });

  const memberIds = members.map(m => m.user_id).filter(Boolean);

  const { data: allPoints = [], isLoading: loadingPoints } = useQuery({
    queryKey: ['group-leaderboard-points', groupId],
    queryFn: () => base44.entities.UserPoints.list('-updated_date', 200).catch(() => []),
    enabled: memberIds.length > 0, retry: false,
  });

  const { data: allStreaks = [] } = useQuery({
    queryKey: ['group-leaderboard-streaks', groupId],
    queryFn: () => base44.entities.UserStreak.list('-updated_date', 100).catch(() => []),
    enabled: memberIds.length > 0, retry: false,
  });

  const leaderboard = members
    .map(m => {
      const pts = allPoints.find(p => p.user_id === m.user_id);
      const streak = allStreaks.find(s => s.user_id === m.user_id);
      return {
        user_id: m.user_id,
        user_name: m.user_name || 'Member',
        total_points: pts?.total_points || 0,
        badges_earned: pts?.badges_earned || 0,
        current_streak: streak?.current_streak || 0,
      };
    })
    .sort((a, b) => b.total_points - a.total_points);

  const isLoading = loadingMembers || loadingPoints;

  const medal = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;

  return (
    <Card className="border-amber-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" /> Group Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : leaderboard.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No rankings yet — start earning points!</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry, i) => (
              <div key={entry.user_id}
                className={`flex items-center gap-3 p-2.5 rounded-xl ${entry.user_id === currentUserId ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}>
                <div className="w-7 text-center flex-shrink-0">
                  {medal(i) ? <span className="text-lg">{medal(i)}</span> : <span className="text-xs font-bold text-gray-400">#{i + 1}</span>}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {entry.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{entry.user_name}{entry.user_id === currentUserId && <span className="text-xs text-indigo-600 ml-1">(You)</span>}</p>
                  {entry.current_streak > 0 && (
                    <span className="text-[10px] text-orange-500 flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" />{entry.current_streak}d streak
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-indigo-700">{entry.total_points.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}