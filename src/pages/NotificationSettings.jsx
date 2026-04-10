import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  saveNotificationPreferences,
  getNotificationPreferences,
  sendTestNotification,
} from '@/lib/notificationManager';
import DailyVerseLanguageSettings from '@/components/notifications/DailyVerseLanguageSettings';

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState('daily');
  const [customDays, setCustomDays] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const prefs = getNotificationPreferences();
    setEnabled(prefs.enabled);
    setTime(prefs.time);
    setFrequency(prefs.frequency);
    setCustomDays(prefs.customDays);
    setPermissionStatus(getNotificationPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const result = await requestNotificationPermission();
      setPermissionStatus(result.status);
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to request permission');
    }
    setLoading(false);
  };

  const handleSavePreferences = () => {
    saveNotificationPreferences({
      enabled: enabled && permissionStatus === 'granted',
      time,
      frequency,
      customDays,
    });
    setMessage('Preferences saved!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSendTest = async () => {
    setLoading(true);
    try {
      await sendTestNotification('FaithLight Daily Verse', 'This is a test notification. Customize the time and frequency in settings.');
      setMessage('Test notification sent!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to send test notification: ' + error.message);
    }
    setLoading(false);
  };

  const toggleDay = (dayIndex) => {
    setCustomDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <a href="#notif-content" className="skip-to-content min-h-[44px] inline-flex items-center px-4 py-3">Skip to main content</a>
      <main id="notif-content" className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-indigo-600" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        </div>

        {/* Daily Verse Language Settings */}
        <div className="mb-6">
          <DailyVerseLanguageSettings />
        </div>

        {/* Prayer Reminder shortcut */}
        <Link to="/PrayerReminderSettings" className="flex items-center gap-3 mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl hover:bg-indigo-100 transition-colors">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-indigo-800">Prayer Time Reminders</p>
            <p className="text-xs text-indigo-500">Set a daily prayer alarm with sound options</p>
          </div>
          <span className="text-indigo-400 text-lg">→</span>
        </Link>

        {/* Permission Status */}
        <Card className="mb-6 p-6 border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            {permissionStatus === 'granted' ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : permissionStatus === 'denied' ? (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">Notification Permission</h3>
              <p className="text-sm text-slate-600 mb-3">
                {permissionStatus === 'granted' && 'Notifications enabled! You will receive daily verses at your chosen time.'}
                {permissionStatus === 'denied' && 'Notifications blocked. Check your browser settings to enable them.'}
                {permissionStatus === 'default' && 'Allow notifications to receive daily Bible verses.'}
              </p>
              {permissionStatus !== 'granted' && (
                <Button onClick={handleRequestPermission} disabled={loading} size="sm">
                  Enable Notifications
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Settings Form */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Master Toggle */}
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="notif-toggle" className="font-semibold text-slate-900 flex-1">
                Daily Verse Notifications
              </label>
              <Switch
                id="notif-toggle"
                checked={enabled && permissionStatus === 'granted'}
                onCheckedChange={setEnabled}
                disabled={permissionStatus !== 'granted'}
                aria-label="Enable daily verse notifications"
              />
            </div>

            {enabled && (
              <>
                {/* Time Selection */}
                <div>
                 <label htmlFor="notif-time" className="block text-sm font-semibold text-slate-900 mb-2">Notification Time</label>
                 <input
                   id="notif-time"
                   type="time"
                   value={time}
                   onChange={(e) => setTime(e.target.value)}
                   className="w-full max-w-xs px-3 min-h-[44px] border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:border-transparent"
                 />
                  <p className="text-xs text-slate-500 mt-1">Choose when you want your daily verse</p>
                </div>

                {/* Frequency Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Frequency</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        value="daily"
                        checked={frequency === 'daily'}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">Every day</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        value="weekdays"
                        checked={frequency === 'weekdays'}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">Weekdays only (Mon-Fri)</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        value="custom"
                        checked={frequency === 'custom'}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">Custom days</span>
                    </label>
                  </div>
                </div>

                {/* Custom Days */}
                {frequency === 'custom' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">Select Days</label>
                    <div className="grid grid-cols-7 gap-2">
                      {daysOfWeek.map((day, idx) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(idx)}
                          aria-pressed={customDays.includes(idx)}
                          className={`min-h-[44px] min-w-[44px] py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                            customDays.includes(idx)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <Button onClick={handleSavePreferences} className="gap-2">
                    Save Preferences
                  </Button>
                  <Button onClick={handleSendTest} variant="outline" disabled={loading}>
                    Send Test Notification
                  </Button>
                </div>
              </>
            )}

            {/* Message */}
            {message && (
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                {message}
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}