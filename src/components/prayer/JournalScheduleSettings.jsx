import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Clock, Save } from 'lucide-react';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function JournalScheduleSettings() {
  const { user, isAuthenticated } = useAuth();
  const [reminderTime, setReminderTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [notificationMethod, setNotificationMethod] = useState('both');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { data: schedule } = useQuery({
    queryKey: ['journalSchedule', user?.email],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      const results = await base44.entities.PrayerJournalSchedule.filter({
        userEmail: user?.email,
      });
      return results.length > 0 ? results[0] : null;
    },
    enabled: isAuthenticated && !!user?.email,
  });

  useEffect(() => {
    if (schedule) {
      setReminderTime(schedule.reminderTime);
      setSelectedDays(schedule.reminderDaysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
      setNotificationMethod(schedule.notificationMethod || 'both');
      setIsEnabled(schedule.isEnabled ?? true);
    }
  }, [schedule]);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      return;
    }

    setIsSaving(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (schedule) {
        await base44.entities.PrayerJournalSchedule.update(schedule.id, {
          reminderTime,
          reminderDaysOfWeek: selectedDays,
          notificationMethod,
          isEnabled,
          timezone,
        });
      } else {
        await base44.entities.PrayerJournalSchedule.create({
          userEmail: user?.email,
          reminderTime,
          reminderDaysOfWeek: selectedDays,
          notificationMethod,
          isEnabled,
          timezone,
        });
      }

      toast.success('Schedule saved successfully!');
    } catch (error) {
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Card className="p-6 border-blue-200 bg-blue-50">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Daily Journal Reminder</h3>
        </div>

        {/* Enable Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label className="text-sm text-gray-700">Enable daily reminders</label>
        </div>

        {isEnabled && (
          <>
            {/* Time Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Time
              </label>
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="max-w-xs"
              />
            </div>

            {/* Day Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`px-3 py-1 text-sm rounded-full transition ${
                      selectedDays.includes(day.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Method
              </label>
              <div className="flex gap-2 flex-wrap">
                {['push', 'email', 'both'].map(method => (
                  <button
                    key={method}
                    onClick={() => setNotificationMethod(method)}
                    className={`px-3 py-1 text-sm rounded border transition ${
                      notificationMethod === method
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Schedule
        </Button>
      </div>
    </Card>
  );
}