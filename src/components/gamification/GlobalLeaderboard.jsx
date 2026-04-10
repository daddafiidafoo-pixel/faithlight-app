import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, TrendingUp, Zap } from 'lucide-react';

export default function GlobalLeaderboard() {
  const [timeframe, setTimeframe] = useState('all');

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', timeframe],
    queryFn: async () => {
      try {
        const allPoints = await base44.entities.UserPoints.filter(
          {},
          '-total_points',
          100
        );

        if (!allPoints || allPoints.length === 0) {
          return { users: [], totalUsers: 0 };
        }

        // Get user details for top users
        const topUsers = allPoints.slice(0, 50);
        const userIds = topUsers.map((p) => p.user_id);

        const userDetails = await Promise.all(
          userIds.map((userId) =>
            base44.entities.User.filter({ id: userId }, null, 1)
              .then((users) => users?.[0])
              .catch(() => null)
          )
        );

        const users = topUsers.map((points, idx) => ({
          ...points,
          user: userDetails[idx],
          rank: idx + 1,
        }));

        return { users, totalUsers: allPoints.length };
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return { users: [], totalUsers: 0 };
      }
    },
  });

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-600" />
          FaithLight Leaderboard
        </h1>
        <p className="text-gray-600">
          Celebrate progress and friendly competition in biblical education
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {['all', 'month', 'week'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeframe === tf
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {tf === 'all' ? 'All Time' : tf === 'month' ? 'This Month' : 'This Week'}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading leaderboard...</span>
          </CardContent>
        </Card>
      ) : !leaderboardData?.users || leaderboardData.users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            No participants yet. Be the first to start your training journey!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {leaderboardData.users.map((entry) => (
            <Card
              key={entry.user_id}
              className={`border ${getRankColor(entry.rank)} transition-all hover:shadow-md`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {getMedalEmoji(entry.rank) ? (
                      <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
                    ) : (
                      <span className="text-lg font-bold text-gray-500">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {entry.user?.full_name || 'Student'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {entry.user?.email || 'No email'}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Points</p>
                      <p className="text-xl font-bold text-indigo-600">
                        {entry.total_points || 0}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-600">Badges</p>
                      <p className="text-lg font-bold text-amber-600">
                        {entry.badges_earned || 0}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-600">Courses</p>
                      <p className="text-lg font-bold text-green-600">
                        {entry.courses_completed || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Achievement Badges */}
                {entry.tracks_completed > 0 && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    {entry.tracks_completed >= 1 && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Foundation Track ✓
                      </Badge>
                    )}
                    {entry.tracks_completed >= 2 && (
                      <Badge className="bg-purple-100 text-purple-800">
                        Leadership Track ✓
                      </Badge>
                    )}
                    {entry.tracks_completed >= 3 && (
                      <Badge className="bg-indigo-100 text-indigo-800">
                        Advanced Track ✓
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {leaderboardData?.totalUsers > 0 && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Community Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold">
                  Active Learners
                </p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {leaderboardData.totalUsers}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">
                  Total Points Earned
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {(
                    leaderboardData.users.reduce(
                      (sum, u) => sum + (u.total_points || 0),
                      0
                    ) || 0
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">
                  Top Score
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {leaderboardData.users[0]?.total_points || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}