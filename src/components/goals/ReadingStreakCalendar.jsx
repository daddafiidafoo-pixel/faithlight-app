import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';

const DAYS = ['S','M','T','W','T','F','S'];

export default function ReadingStreakCalendar({ sessions = [], streakCount = 0 }) {
  // Build a set of YYYY-MM-DD dates that had at least one session
  const readDates = useMemo(() => {
    const s = new Set();
    sessions.forEach(sess => {
      const d = sess.completed_date_local || sess.created_date?.split('T')[0];
      if (d) s.add(d.split('T')[0]);
    });
    return s;
  }, [sessions]);

  // Build last 35 days grid (5 weeks)
  const today = new Date();
  const days = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ key, day: d.getDate(), isToday: i === 0, read: readDates.has(key), month: d.getMonth() });
  }

  // Streak intensity: count consecutive days back from today
  let streak = 0;
  for (let i = 0; i < 35; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (readDates.has(key)) streak++;
    else if (i > 0) break;
  }

  const monthLabel = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-extrabold text-gray-900 text-sm">Reading Streak Calendar</h3>
          <p className="text-xs text-gray-400">{monthLabel}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-xl px-3 py-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-extrabold text-orange-600">{streak} day streak</span>
          </div>
        )}
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs font-bold text-gray-300">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Pad start */}
        {Array.from({ length: (new Date(today.getFullYear(), today.getMonth(), days[0].day).getDay()) }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map(d => (
          <div key={d.key}
            title={d.key}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all
              ${d.isToday ? 'ring-2 ring-indigo-400' : ''}
              ${d.read ? 'bg-indigo-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
            {d.day}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-indigo-500" /> Read</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" /> No reading</div>
        <div className="ml-auto">{readDates.size} days total</div>
      </div>
    </div>
  );
}