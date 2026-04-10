import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function StreakCounter({ user }) {
  const [streak, setStreak] = useState(0);
  const [longest, setLongest] = useState(0);
  const [readToday, setReadToday] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadStreak();
  }, [user]);

  const loadStreak = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const current = user.reading_streak || 0;
    const longest = user.longest_streak || 0;
    const lastRead = user.last_read_date;

    // If last read was yesterday or today, streak is valid
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let validStreak = current;
    if (lastRead && lastRead !== today && lastRead !== yesterdayStr) {
      // Streak broken — reset
      validStreak = 0;
    }

    setStreak(validStreak);
    setLongest(longest);
    setReadToday(lastRead === today);
  };

  const flameColor = streak === 0 ? 'text-gray-300' : streak >= 30 ? 'text-purple-500' : streak >= 7 ? 'text-orange-500' : 'text-amber-400';
  const flameBg = streak === 0 ? 'bg-gray-100' : streak >= 30 ? 'bg-purple-100' : streak >= 7 ? 'bg-orange-100' : 'bg-amber-100';

  if (!user) return null;

  return (
    <Link to={createPageUrl('GrowthDashboard')} className="block">
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md active:scale-[0.98] transition-all">
        <div className={`w-14 h-14 rounded-2xl ${flameBg} flex flex-col items-center justify-center flex-shrink-0`}>
          <Flame className={`w-6 h-6 ${flameColor}`} />
          <span className="text-xs font-bold text-gray-700 mt-0.5">{streak}d</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">
            {streak === 0 ? 'Start Your Streak!' : `${streak}-Day Streak 🔥`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {readToday ? '✅ Read today' : '📖 Read today to keep your streak'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span className="text-xs font-bold text-gray-600">{longest}</span>
          </div>
          <span className="text-[10px] text-gray-400">best</span>
        </div>
      </div>
    </Link>
  );
}

// Call this when a chapter is read to update the streak
export async function recordChapterRead(user) {
  if (!user) return;
  const today = new Date().toISOString().slice(0, 10);
  if (user.last_read_date === today) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const prevStreak = user.last_read_date === yesterdayStr ? (user.reading_streak || 0) : 0;
  const newStreak = prevStreak + 1;
  const newLongest = Math.max(newStreak, user.longest_streak || 0);

  await base44.auth.updateMe({
    reading_streak: newStreak,
    longest_streak: newLongest,
    last_read_date: today,
  });
}