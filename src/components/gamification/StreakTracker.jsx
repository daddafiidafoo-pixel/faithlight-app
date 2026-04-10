import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';

export default function StreakTracker({ userId, streakType = 'daily_learning' }) {
  const { data: streak, isLoading } = useQuery({
    queryKey: ['user-streak', userId, streakType],
    queryFn: async () => {
      const streaks = await base44.entities.UserStreak.filter(
        { user_id: userId, streak_type: streakType },
        '-created_date',
        1
      );
      return streaks[0] || null;
    },
    enabled: !!userId,
  });

  if (isLoading || !streak) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Flame className="w-8 h-8 text-orange-500" />
              <div className="absolute inset-0 animate-pulse opacity-50">
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600">Current Streak</p>
              <p className="text-3xl font-bold text-orange-600">{streak.current_streak}</p>
              <p className="text-xs text-gray-600">{streakType.replace(/_/g, ' ')}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <p className="text-xs text-gray-600">Personal Best</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{streak.longest_streak}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Next milestone</span>
            <span className="text-gray-600">{Math.min(streak.current_streak + 1, 30)} days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all"
              style={{ width: `${(streak.current_streak / 30) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}