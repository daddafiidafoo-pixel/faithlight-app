import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Volume2, BookOpen, Loader2 } from 'lucide-react';

export default function TodayStreakWidget({ userId }) {
  const [stats, setStats] = useState(null);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const loadData = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated().catch(() => false);
        if (!isAuth) { setLoading(false); return; }
        const response = await base44.functions.invoke('getUserStats', {});
        setStats(response.data?.stats || null);

        // Calculate today's minutes from sessions
        const today = new Date().toISOString().split('T')[0];
        const readingSessions = await base44.entities.ReadingSessions.filter({ user_id: userId, date: today }).catch(() => []);
        const listeningSessions = await base44.entities.ListeningSessions.filter({ user_id: userId, date: today }).catch(() => []);

        const readingMin = readingSessions.reduce((sum, s) => sum + (s.readingMinutes || 0), 0);
        const listeningMin = listeningSessions.reduce((sum, s) => sum + (s.listeningMinutes || 0), 0);
        setTodayMinutes(readingMin + listeningMin);
      } catch (error) {
        console.error('Error loading today data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  if (loading || !stats) {
    return (
      <Card>
        <CardContent className="pt-4 pb-4 flex items-center justify-center h-24">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const streakActive = stats.currentStreak > 0;
  const todayGoalMet = todayMinutes >= 3;

  return (
    <Card className={`border-2 ${streakActive ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100' : 'border-gray-200'}`}>
      <CardContent className="pt-5 pb-4">
        <div className="space-y-3">

          {/* Streak Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`w-6 h-6 ${streakActive ? 'text-orange-500 animate-pulse' : 'text-gray-300'}`} />
              <div>
                <p className="text-xs text-gray-500">Current Streak</p>
                <p className={`text-2xl font-bold ${streakActive ? 'text-orange-600' : 'text-gray-400'}`}>
                  {stats.currentStreak}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Longest</p>
              <p className="text-lg font-bold text-gray-700">{stats.longestStreak}</p>
            </div>
          </div>

          {/* Today's Progress */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className={`w-4 h-4 ${todayGoalMet ? 'text-blue-500' : 'text-gray-300'}`} />
                <span className="text-xs text-gray-600">Read</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Volume2 className={`w-4 h-4 ${todayGoalMet ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-xs text-gray-600">Listen</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold ${todayGoalMet ? 'text-indigo-600' : 'text-gray-400'}`}>
                {todayMinutes}
              </span>
              <span className="text-xs text-gray-500">minutes today</span>
              {todayGoalMet && <span className="text-xs font-semibold text-green-600">✓ Goal Met</span>}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}