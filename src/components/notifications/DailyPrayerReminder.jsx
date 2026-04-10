import React, { useState, useEffect } from 'react';
import { Bell, Clock } from 'lucide-react';
import { getPushNotificationPrefs, setPushNotificationPrefs, scheduleNotification } from '@/lib/pushNotificationService';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

export default function DailyPrayerReminder({ userEmail, uiLang, onReminderTime }) {
  const [prefs, setPrefs] = useState({ enabled: false, time: '09:00' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail) {
      const stored = getPushNotificationPrefs(userEmail);
      setPrefs(stored);
      setLoading(false);

      // Schedule the notification
      scheduleNotification(userEmail, () => {
        onReminderTime?.();
      });
    }
  }, [userEmail, onReminderTime]);

  const handleToggle = () => {
    const updated = { ...prefs, enabled: !prefs.enabled };
    setPrefs(updated);
    setPushNotificationPrefs(userEmail, updated);
    
    const message = updated.enabled
      ? t(uiLang, 'notifications.reminderEnabled') || 'Daily reminders enabled'
      : t(uiLang, 'notifications.reminderDisabled') || 'Daily reminders disabled';
    
    toast.success(message);
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    const updated = { ...prefs, time };
    setPrefs(updated);
    setPushNotificationPrefs(userEmail, updated);
    
    toast.success(t(uiLang, 'notifications.reminderTimeUpdated') || 'Reminder time updated');
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-200">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-blue-600" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {t(uiLang, 'notifications.dailyReminder') || 'Daily Prayer Reminder'}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {t(uiLang, 'notifications.reminderDescription') || 'Get prompted to pray at your chosen time'}
            </p>
          </div>
        </div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.enabled}
            onChange={handleToggle}
            className="sr-only"
          />
          <div
            className={`w-12 h-7 rounded-full transition-colors ${
              prefs.enabled ? 'bg-blue-600' : 'bg-gray-300'
            } relative`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                prefs.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
        </label>
      </div>

      {prefs.enabled && (
        <div className="p-4 bg-white rounded-2xl border border-gray-200">
          <label className="block">
            <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              {t(uiLang, 'notifications.reminderTime') || 'Reminder Time'}
            </p>
            <input
              type="time"
              value={prefs.time}
              onChange={handleTimeChange}
              className="w-full px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-gray-900 font-medium"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            {t(uiLang, 'notifications.reminderNote') || 'You\'ll receive a reminder at this time each day'}
          </p>
        </div>
      )}
    </div>
  );
}