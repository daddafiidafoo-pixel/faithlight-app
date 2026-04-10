import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Flame, Trophy, Target, TrendingUp, Users } from 'lucide-react';

export default function DashboardStatsBar({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [streak, badges, goals] = await Promise.all([
        base44.entities.UserStreak.filter({ user_id: user.id }).catch(() => []),
        base44.entities.UserBadge.filter({ user_id: user.id }).catch(() => []),
        base44.entities.ReadingGoal.filter({ user_id: user.id }).catch(() => []),
      ]);
      const activeStreak = streak[0];
      setStats({
        streak: activeStreak?.current_streak || 0,
        longestStreak: activeStreak?.longest_streak || 0,
        badges: badges.length,
        goals: goals.length,
        points: user.total_points || 0,
        level: user.spiritual_level || 1,
      });
      setLoading(false);
    };
    load();
  }, [user]);

  const items = stats ? [
    { icon: Flame, label: 'Day Streak', value: stats.streak, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', trend: stats.streak > 0 },
    { icon: Trophy, label: 'Badges', value: stats.badges, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { icon: Target, label: 'Goals', value: stats.goals, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { icon: TrendingUp, label: 'Points', value: stats.points.toLocaleString(), color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
    { icon: BookOpen, label: 'Level', value: stats.level, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  ] : [];

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-3 py-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {items.map(({ icon: Icon, label, value, color, bg, border, trend }) => (
        <div
          key={label}
          className={`flex items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-3 transition-all hover:shadow-sm hover:-translate-y-0.5`}
        >
          <div className={`${color} flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
              {trend && <span className="text-xs text-orange-500 font-bold">🔥</span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}