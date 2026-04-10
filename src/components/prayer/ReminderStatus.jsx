import React from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReminderStatus({ prayer }) {
  if (!prayer?.reminderEnabled) {
    return null;
  }

  const frequencyLabels = {
    daily: '🔔 Daily reminder',
    every3days: '📅 Every 3 days',
    weekly: '📆 Weekly reminder',
  };

  return (
    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
      <Bell className="w-4 h-4" />
      <span>{frequencyLabels[prayer.reminderFrequency]}</span>
      {prayer.nextReminderAt && (
        <span className="text-xs text-blue-500">
          in {formatDistanceToNow(new Date(prayer.nextReminderAt))}
        </span>
      )}
    </div>
  );
}