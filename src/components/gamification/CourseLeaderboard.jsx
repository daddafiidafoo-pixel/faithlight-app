import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Medal, Flame, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CourseLeaderboard({ courseId, limit = 10 }) {
  const [timeframe, setTimeframe] = useState('alltime');

  // Get all users who completed this course
  const { data: completions = [], isLoading } = useQuery({
    queryKey: ['course-completions', courseId],
    queryFn: async () => {
      const courseProgress = await base44.entities.UserCourseProgress.filter(
        { course_id: courseId, status: 'completed' },
        '-completed_at'
      );
      return courseProgress || [];
    },
    enabled: !!courseId,
  });

  // Get user points for all completed users
  const { data: leaderboardData = [], isLoading: isLoadingPoints } = useQuery({
    queryKey: ['course-leaderboard', courseId, completions],
    queryFn: async () => {
      if (completions.length === 0) return [];

      const userIds = completions.map(c => c.user_id);
      const allUserPoints = await Promise.all(
        userIds.map(userId =>
          base44.entities.UserPoints.filter({ user_id: userId }, '-created_date', 1)
        )
      );

      const userDetails = await Promise.all(
        userIds.map(userId => base44.auth.me())
      );

      return completions
        .map((completion, idx) => ({
          ...completion,
          points: allUserPoints[idx]?.[0]?.total_points || 0,
          badges: allUserPoints[idx]?.[0]?.badges_earned || 0,
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, limit);
    },
    enabled: completions.length > 0 && !isLoading,
  });

  if (isLoading || isLoadingPoints) {
    return <div className="text-gray-600 py-4">Loading leaderboard...</div>;
  }

  if (leaderboardData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Medal className="w-5 h-5" />
            Course Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 text-center py-8">
            Complete this course to appear on the leaderboard!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Medal className="w-5 h-5 text-yellow-500" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboardData.map((user, idx) => {
            let medal = '🥇';
            let medalColor = 'text-yellow-500';
            if (idx === 1) {
              medal = '🥈';
              medalColor = 'text-gray-400';
            } else if (idx === 2) {
              medal = '🥉';
              medalColor = 'text-orange-600';
            }

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  idx < 3 ? 'bg-yellow-50 border-l-4 border-yellow-500' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl min-w-max">{medal}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">#{idx + 1}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-lg">⚡</span>
                      <span className="font-bold text-indigo-600">{user.points}</span>
                    </div>
                    <p className="text-xs text-gray-600">{user.badges} badges</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-600 text-center mt-4 pt-4 border-t">
          Ranking based on total points and badges earned
        </p>
      </CardContent>
    </Card>
  );
}