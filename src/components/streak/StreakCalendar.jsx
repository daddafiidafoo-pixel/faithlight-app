import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function StreakCalendar({ readingDates, month = new Date() }) {
  const [currentMonth, setCurrentMonth] = React.useState(month);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const dateSet = new Set(readingDates || []);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getIntensity = (day) => {
    if (!day) return 'bg-gray-50';
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateSet.has(dateStr)) return 'bg-indigo-500 text-white';
    return 'bg-white border border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">
            {d}
          </div>
        ))}
        {days.map((day, i) => (
          <div key={i} className={`aspect-square flex items-center justify-center rounded text-sm font-medium ${getIntensity(day)}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs">
        <span className="text-gray-600">Activity:</span>
        <div className="w-3 h-3 rounded bg-indigo-500"></div>
        <span className="text-gray-600">Read</span>
      </div>
    </div>
  );
}