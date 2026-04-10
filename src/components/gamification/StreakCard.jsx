import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Flame, Calendar, TrendingUp, Star } from 'lucide-react';

export default function StreakCard({ userId }) {
  const { data: streak } = useQuery({
    queryKey: ['streak-card', userId],
    queryFn: () => base44.entities.UserStreak.filter({ user_id: userId }, '-updated_date', 1).then(r => r[0] || null).catch(() => null),
    enabled: !!userId, retry: false,
  });

  const current = streak?.current_streak || 0;
  const best = streak?.longest_streak || 0;
  const weekly = streak?.weekly_streak || 0;

  // Build 7-day visual
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
      active: i >= (7 - Math.min(current, 7)),
      isToday: i === 6,
    };
  });

  const getMessage = () => {
    if (current === 0) return "Start your streak today! 🌱";
    if (current < 3) return "Great start! Keep going! 🔥";
    if (current < 7) return "You're on a roll! 💪";
    if (current < 30) return "Incredible dedication! 🌟";
    return "You're a legend! 👑";
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-orange-100">Daily Streak</p>
            <p className="text-2xl font-bold leading-tight">{current} <span className="text-base font-normal">days</span></p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-orange-100">Best</p>
          <p className="text-lg font-bold">{best}d</p>
        </div>
      </div>

      {/* 7-day visual */}
      <div className="flex justify-between mb-3">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
              ${d.active ? 'bg-white text-orange-600 border-white shadow' : 'bg-white/20 text-white/60 border-white/20'}
              ${d.isToday ? 'ring-2 ring-white ring-offset-1 ring-offset-orange-500' : ''}`}>
              {d.active ? <Flame className="w-3.5 h-3.5" /> : d.label}
            </div>
            <span className="text-[9px] text-orange-200">{d.label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-orange-100 text-center">{getMessage()}</p>

      <div className="flex justify-around mt-3 pt-3 border-t border-white/20">
        <div className="text-center">
          <p className="text-lg font-bold">{weekly}</p>
          <p className="text-[10px] text-orange-200">This week</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{streak?.total_days_active || 0}</p>
          <p className="text-[10px] text-orange-200">Total days</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{streak?.monthly_streak || 0}</p>
          <p className="text-[10px] text-orange-200">This month</p>
        </div>
      </div>
    </div>
  );
}