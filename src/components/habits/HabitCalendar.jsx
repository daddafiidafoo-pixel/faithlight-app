import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function HabitCalendar({ goal, completions, onComplete }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const days = daysInMonth(currentMonth, currentYear);

  const completionDates = new Set(completions.map(c => c.completion_date));
  const today_str = today.toISOString().split('T')[0];
  const completedToday = completionDates.has(today_str);

  const calendar = [];
  for (let i = 0; i < firstDay; i++) {
    calendar.push(null);
  }
  for (let i = 1; i <= days; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendar.push(dateStr);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>{goal.goal_name}</CardTitle>
          <p className="text-sm text-gray-600 mt-1">{goal.target_value} {goal.target_unit} daily</p>
        </div>
        <Button
          onClick={onComplete}
          disabled={completedToday}
          className={completedToday ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}
        >
          <Check className="w-4 h-4" />
          {completedToday ? 'Done Today' : 'Mark Today'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            {monthNames[currentMonth]} {currentYear}
          </p>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-bold text-center text-gray-500 py-2">
                {day}
              </div>
            ))}

            {calendar.map((date, idx) => {
              const isCompleted = date && completionDates.has(date);
              return (
                <div
                  key={idx}
                  className={`aspect-square rounded text-sm font-medium flex items-center justify-center ${
                    date
                      ? isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                      : ''
                  }`}
                >
                  {date && date.split('-')[2].replace(/^0/, '')}
                </div>
              );
            })}
          </div>

          <div className="text-xs text-gray-600 mt-4">
            <span className="font-semibold">{completions.length}</span> completions
          </div>
        </div>
      </CardContent>
    </Card>
  );
}