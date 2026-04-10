import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Clock, Save } from 'lucide-react';

export default function DailyNotificationScheduler({ userId }) {
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [enabled, setEnabled] = useState(true);
  const [frequency, setFrequency] = useState('daily');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.notification_time) {
        setNotificationTime(user.notification_time);
      }
      if (user?.notifications_enabled !== undefined) {
        setEnabled(user.notifications_enabled);
      }
      if (user?.notification_frequency) {
        setFrequency(user.notification_frequency);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        notification_time: notificationTime,
        notifications_enabled: enabled,
        notification_frequency: frequency,
      });
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-600" />
        Daily Reminder Settings
      </h3>

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-gray-700">Enable daily verse reminders</span>
        </label>

        {enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Frequency
              </label>
              <div className="flex gap-3 flex-wrap">
                {['daily', 'weekdays', 'weekends', 'custom'].map(freq => (
                  <label key={freq} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value={freq}
                      checked={frequency === freq}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 capitalize">{freq === 'weekdays' ? 'Weekdays only' : freq === 'weekends' ? 'Weekends only' : freq}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Choose how often you'd like to receive your daily verse reminder
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Time
              </label>
              <input
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                You'll get a notification at this time in your timezone
              </p>
            </div>
          </>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {saving ? (
          <>
            <Clock className="w-4 h-4 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </>
        )}
      </Button>
    </div>
  );
}