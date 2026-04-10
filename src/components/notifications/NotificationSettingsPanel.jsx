import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestNotificationPermission,
  sendTestNotification,
} from '@/lib/notifications';

export default function NotificationSettingsPanel({ userEmail }) {
  const [settings, setSettings] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getNotificationPreferences(userEmail));
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, [userEmail]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionStatus('granted');
      handleSave({ dailyVerseEnabled: true });
    }
  };

  const handleSave = (updates = {}) => {
    const updated = {
      ...settings,
      ...updates,
    };
    saveNotificationPreferences(userEmail, updated);
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestNotification = () => {
    sendTestNotification('John 3:16', 'For God so loved the world...');
  };

  if (!settings) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="card p-6 rounded-xl space-y-6">
      <div>
        <h3 className="font-bold text-lg text-slate-900 mb-4">Daily Verse Reminder</h3>

        {permissionStatus !== 'granted' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-amber-800 mb-3">
              {permissionStatus === 'denied'
                ? 'Notifications are blocked. Please enable them in your browser settings.'
                : 'Enable browser notifications to receive daily verse reminders.'}
            </p>
            {permissionStatus !== 'denied' && (
              <Button
                onClick={handleEnableNotifications}
                className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
              >
                <Bell className="w-4 h-4" />
                Enable Notifications
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailyVerseEnabled}
                  onChange={(e) =>
                    handleSave({ dailyVerseEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-slate-700">Send daily verse reminder</span>
              </label>

              {settings.dailyVerseEnabled && (
                <div className="ml-7">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={settings.dailyVerseTime}
                    onChange={(e) =>
                      handleSave({ dailyVerseTime: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {settings.dailyVerseEnabled && (
                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Send Test Notification
                </Button>
              )}
            </div>

            {saved && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                <Check className="w-4 h-4" />
                <span className="text-sm font-semibold">Settings saved</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}