import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Star, Award, TrendingUp } from 'lucide-react';

export default function StreakDashboard() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const me = await base44.auth.me();
        if (!isMounted) return;
        setUser(me);

        const streaks = await base44.entities.UserStreak.filter({ user_email: me.email });
        if (isMounted && streaks.length > 0) {
          setStreak(streaks[0]);
        }
      } catch (error) {
        console.error('Failed to load streak:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  if (loading || !streak) return <div className="p-4 text-center">Loading streak...</div>;

  const xpToNextLevel = (streak.level * 100);
  const xpProgress = (streak.total_xp % xpToNextLevel) / xpToNextLevel * 100;

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl space-y-6">
      {/* Streak Counter */}
      <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-100 rounded-full">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-slate-600">Current Streak</p>
            <p className="text-3xl font-bold text-slate-900">{streak.current_streak}</p>
            <p className="text-xs text-slate-500">Longest: {streak.longest_streak}</p>
          </div>
        </div>
      </div>

      {/* XP & Level */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <p className="text-xs text-slate-600">Level</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{streak.level}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <p className="text-xs text-slate-600">Total XP</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{streak.total_xp}</p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-600 mb-2">XP to Level {streak.level + 1}</p>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-purple-500" />
          <p className="text-sm font-semibold text-slate-900">Badges ({streak.badges.length})</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {streak.badges.length > 0 ? (
            streak.badges.map((badge) => (
              <span key={badge} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                {badge}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-500">Complete reading goals to earn badges!</p>
          )}
        </div>
      </div>
    </div>
  );
}