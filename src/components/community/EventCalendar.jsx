import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EventCalendar({ events, selectedDate, onSelectDate, viewType }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevious = () => {
    if (viewType === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewType === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const getDaysToDisplay = () => {
    if (viewType === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const calendarStart = startOfWeek(start);
      const calendarEnd = endOfWeek(end);
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    }
  };

  const days = getDaysToDisplay();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (day) => {
    return events.filter(event => isSameDay(new Date(event.event_date), day));
  };

  const isCurrentMonth = (day) => isSameMonth(day, currentDate);

  return (
    <Card className="bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold text-center flex-1">
            {viewType === 'month' 
              ? format(currentDate, 'MMMM yyyy')
              : `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
            }
          </h2>
          <Button variant="ghost" size="icon" onClick={handleNext}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayLabels.map(label => (
            <div key={label} className="text-center font-semibold text-gray-600 py-2">
              {label}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 auto-rows-[120px]">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isOtherMonth = !isCurrentMonth(day);

            return (
              <div
                key={idx}
                onClick={() => onSelectDate(day)}
                className={`
                  border rounded-lg p-2 cursor-pointer transition-all
                  ${isOtherMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-blue-50'}
                  ${isSelected ? 'ring-2 ring-indigo-600 bg-indigo-50' : 'border-gray-200'}
                `}
              >
                <div className="font-semibold text-sm mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[85px]">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-xs bg-indigo-100 text-indigo-800 rounded px-2 py-1 truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-600 px-2">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}