import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, differenceInDays, parseISO, isToday, isYesterday } from 'date-fns';

function computeStreak(dates) {
  if (!dates.length) return 0;
  const uniqueDays = [...new Set(dates.map(d => {
    try { return format(parseISO(d), 'yyyy-MM-dd'); } catch { return null; }
  }).filter(Boolean))].sort().reverse();

  if (!uniqueDays.length) return 0;
  const latest = parseISO(uniqueDays[0]);
  if (!isToday(latest) && !isYesterday(latest)) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const diff = differenceInDays(parseISO(uniqueDays[i - 1]), parseISO(uniqueDays[i]));
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export default function PrayerStreakCard({ userId }) {
  const { data: journalEntries = [] } = useQuery({
    queryKey: ['prayer-journal-streak', userId],
    queryFn: () => base44.entities.PrayerJournal.filter({ user_id: userId }, '-created_date', 100).catch(() => []),
    enabled: !!userId,
  });

  const { data: prayerSupports = [] } = useQuery({
    queryKey: ['prayer-support-streak', userId],
    queryFn: () => base44.entities.PrayerSupport.filter({ user_id: userId }, '-created_date', 100).catch(() => []),
    enabled: !!userId,
  });

  const allDates = [
    ...journalEntries.map(e => e.created_date),
    ...prayerSupports.map(s => s.prayed_at || s.created_date),
  ].filter(Boolean);

  const streak = computeStreak(allDates);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = format(d, 'yyyy-MM-dd');
    const active = allDates.some(date => date?.startsWith(key));
    return { key, label: format(d, 'EEE'), active };
  });

  const message =
    streak === 0 ? 'Start today! Journal, read, or pray to begin your streak.' :
    streak < 3 ? 'Great start! Keep going to build your streak.' :
    streak < 7 ? `${streak} days strong! You're building a habit.` :
    `You're on fire! ${streak} days of consistent practice!`;

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" /> Prayer Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-extrabold text-orange-500 leading-none">{streak}</p>
            <p className="text-xs text-gray-500 font-semibold mt-1">day streak</p>
          </div>
          <p className="text-sm text-gray-600 leading-snug">{message}</p>
        </div>

        {/* Last 7 days */}
        <div className="flex gap-1.5 justify-between">
          {last7.map(day => (
            <div key={day.key} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-all shadow-sm
                ${day.active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                {day.active ? '🔥' : '·'}
              </div>
              <span className="text-xs text-gray-400">{day.label}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Counts journal entries, prayer wall activity & reading plans
        </p>
      </CardContent>
    </Card>
  );
}