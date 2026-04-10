import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';

const STATUS_DOT = {
  answered: 'bg-green-500',
  active: 'bg-amber-400',
  ongoing: 'bg-blue-400',
};

export default function PrayerCalendarView({ prayers, month, onMonthChange }) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const startPad = getDay(start); // 0=Sun

  const prayersByDay = useMemo(() => {
    const map = {};
    prayers.forEach(p => {
      const d = (p.created_date || '').split('T')[0];
      if (!map[d]) map[d] = [];
      map[d].push(p);
    });
    return map;
  }, [prayers]);

  const totalThisMonth = days.filter(d => {
    const key = format(d, 'yyyy-MM-dd');
    return prayersByDay[key]?.length > 0;
  }).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          ‹
        </button>
        <div className="text-center">
          <p className="font-bold text-gray-900">{format(month, 'MMMM yyyy')}</p>
          <p className="text-xs text-gray-400">{totalThisMonth} days with prayer</p>
        </div>
        <button
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 px-3 pb-4">
        {/* Leading empty cells */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayPrayers = prayersByDay[key] || [];
          const isToday = isSameDay(day, new Date());
          const hasAnswered = dayPrayers.some(p => p.status === 'answered');
          const hasPrayers = dayPrayers.length > 0;

          return (
            <div key={key}
              className={`relative flex flex-col items-center justify-center rounded-xl p-1.5 min-h-[44px] transition-colors
                ${isToday ? 'ring-2 ring-indigo-500 bg-indigo-50' : hasPrayers ? 'bg-rose-50' : 'bg-transparent'}
              `}>
              <span className={`text-xs font-semibold ${isToday ? 'text-indigo-700' : hasPrayers ? 'text-rose-700' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </span>
              {hasPrayers && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {dayPrayers.slice(0, 3).map((p, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[p.status] || 'bg-gray-300'}`} />
                  ))}
                  {dayPrayers.length > 3 && <span className="text-[8px] text-gray-400">+{dayPrayers.length - 3}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 pb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Active</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Ongoing</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Answered</span>
      </div>
    </div>
  );
}