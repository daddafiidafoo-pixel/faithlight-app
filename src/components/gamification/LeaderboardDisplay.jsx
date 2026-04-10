import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Flame, Loader2 } from 'lucide-react';

/**
 * Display leaderboards for points and streaks
 */
export default function LeaderboardDisplay({ currentUserId, limit = 10 }) {
  const [activeTab, setActiveTab] = useState('points');

  const { data: pointsLeaderboard = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['leaderboard-points'],
    queryFn: async () => {
      const records = await base44.entities.UserPoints.filter(
        {},
        '-total_points',
        limit
      );
      // Enrich with user info
      const enriched = await Promise.all(
        records.map(async (record) => {
          const users = await base44.entities.User.filter({ id: record.user_id });
          return { ...record, user: users[0] };
        })
      );
      return enriched;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const { data: streakLeaderboard = [], isLoading: streakLoading } = useQuery({
    queryKey: ['leaderboard-streak'],
    queryFn: async () => {
      const records = await base44.entities.UserProgress.filter(
        {},
        '-learning_streak_current',
        limit
      );
      // Enrich with user info
      const enriched = await Promise.all(
        records.map(async (record) => {
          const users = await base44.entities.User.filter({ id: record.user_id });
          return { ...record, user: users[0] };
        })
      );
      return enriched;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const LeaderboardRow = ({ rank, entry, isCurrentUser, metric, value }) => (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
        isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
      }`}
    >
      <div className="text-2xl font-bold text-gray-400 w-8 text-center">
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">
          {entry.user?.full_name || 'Anonymous'}
        </p>
        <p className="text-xs text-gray-600">{entry.user?.country_code}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-indigo-600">{value}</p>
        <p className="text-xs text-gray-500">{metric}</p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Leaderboards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="streak" className="gap-1">
              <Flame className="w-4 h-4" />
              Streaks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points" className="space-y-2 mt-4">
            {pointsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              pointsLeaderboard.map((entry, idx) => (
                <LeaderboardRow
                  key={entry.id}
                  rank={idx + 1}
                  entry={entry}
                  isCurrentUser={entry.user_id === currentUserId}
                  metric="points"
                  value={entry.total_points.toLocaleString()}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="streak" className="space-y-2 mt-4">
            {streakLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              streakLeaderboard.map((entry, idx) => (
                <LeaderboardRow
                  key={entry.id}
                  rank={idx + 1}
                  entry={entry}
                  isCurrentUser={entry.user_id === currentUserId}
                  metric="days"
                  value={entry.learning_streak_current || 0}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-700">
            <strong>💡 Tip:</strong> Earn points by completing lessons, participating in discussions, and reaching milestones. Your position updates in real-time!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}