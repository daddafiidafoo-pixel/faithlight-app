import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PrayerStreakCalendar({ prayers = [], month, onMonthChange }) {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const prayerDates = new Set(prayers.map(p => new Date(p.prayer_date).toDateString()));

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrevMonth = () => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1));
  const handleNextMonth = () => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-semibold text-xs text-slate-600 py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const date = day ? new Date(month.getFullYear(), month.getMonth(), day) : null;
          const hasPrayer = date && prayerDates.has(date.toDateString());
          
          return (
            <div
              key={idx}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-semibold
                ${!day ? 'bg-transparent' : hasPrayer ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}