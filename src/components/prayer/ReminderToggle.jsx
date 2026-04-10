import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReminderToggle({ prayer, userEmail }) {
  const [showSettings, setShowSettings] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(prayer?.reminderEnabled || false);
  const [reminderFrequency, setReminderFrequency] = useState(prayer?.reminderFrequency || 'daily');
  const queryClient = useQueryClient();

  const frequencyOptions = [
    { value: 'daily', label: '🔔 Daily' },
    { value: 'every3days', label: '📅 Every 3 Days' },
    { value: 'weekly', label: '📆 Weekly' },
  ];

  const reminderMutation = useMutation({
    mutationFn: async ({ enabled, frequency }) => {
      const nextReminderAt = enabled ? calculateNextReminder(frequency) : null;

      await base44.functions.invoke('prayerCRUD', {
        action: 'update',
        prayerId: prayer.id,
        reminderEnabled: enabled,
        reminderFrequency: enabled ? frequency : null,
        nextReminderAt,
      });

      return { enabled, frequency };
    },
    onSuccess: (data) => {
      setReminderEnabled(data.enabled);
      setReminderFrequency(data.frequency || 'daily');
      setShowSettings(false);
      queryClient.invalidateQueries({ queryKey: ['prayers', userEmail] });
      toast.success(data.enabled ? 'Reminder enabled' : 'Reminder disabled');
    },
    onError: () => {
      toast.error('Failed to update reminder');
    },
  });

  const calculateNextReminder = (frequency) => {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'every3days':
        next.setDate(next.getDate() + 3);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
    }

    return next.toISOString();
  };

  const handleToggle = (enabled) => {
    reminderMutation.mutate({
      enabled,
      frequency: reminderFrequency,
    });
  };

  const handleFrequencyChange = (frequency) => {
    reminderMutation.mutate({
      enabled: true,
      frequency,
    });
  };

  return (
    <div>
      <Button
        onClick={() => setShowSettings(!showSettings)}
        variant={reminderEnabled ? 'default' : 'outline'}
        size="sm"
        className="flex items-center gap-2"
        disabled={reminderMutation.isPending}
      >
        <Bell className="w-4 h-4" />
        {reminderEnabled ? 'Reminder On' : 'Set Reminder'}
      </Button>

      {showSettings && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`reminder-toggle-${prayer.id}`}
              checked={reminderEnabled}
              onChange={(e) => handleToggle(e.target.checked)}
              className="w-4 h-4 border border-gray-300 rounded cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
            />
            <label htmlFor={`reminder-toggle-${prayer.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
              Enable reminders for this prayer
            </label>
          </div>

          {reminderEnabled && (
            <div className="ml-6 space-y-2">
              <p className="text-xs font-medium text-gray-600">Frequency</p>
              <div className="flex flex-col gap-2">
                {frequencyOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`frequency-${prayer.id}`}
                      value={option.value}
                      checked={reminderFrequency === option.value}
                      onChange={() => handleFrequencyChange(option.value)}
                      className="w-4 h-4 border border-gray-300 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowSettings(false)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] rounded px-2 py-1"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}