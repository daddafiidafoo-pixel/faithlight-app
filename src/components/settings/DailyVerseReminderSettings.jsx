import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LazyPushNotificationRequest from '../notifications/LazyPushNotificationRequest';
import { Sun, Clock, Bell, CheckCircle2, Loader2 } from 'lucide-react';

export default function DailyVerseReminderSettings({ user }) {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('08:00');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPushRequest, setShowPushRequest] = useState(false);
  const [preferencesId, setPreferencesId] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;
    try {
      const prefs = await base44.entities.NotificationPreference.filter(
        { user_id: user.id },
        '-created_date',
        1
      ).catch(() => []);
      
      if (prefs.length > 0) {
        const p = prefs[0];
        setPreferencesId(p.id);
        setEnabled(p.daily_verse_reminder_enabled ?? false);
        setTime(p.daily_verse_reminder_time ?? '08:00');
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  };

  const handleToggle = async () => {
    if (!enabled) {
      // User is trying to ENABLE — show push notification request
      setShowPushRequest(true);
    } else {
      // User is trying to DISABLE
      setEnabled(false);
      await savePreferences(false);
    }
  };

  const handlePushApprove = async () => {
    setEnabled(true);
    setShowPushRequest(false);
    await savePreferences(true);
  };

  const savePreferences = async (enableReminder) => {
    if (!user?.id) return;
    setLoading(true);
    setSaved(false);

    try {
      const data = {
        user_id: user.id,
        daily_verse_reminder_enabled: enableReminder,
        daily_verse_reminder_time: time,
      };

      if (preferencesId) {
        await base44.entities.NotificationPreference.update(preferencesId, data);
      } else {
        const created = await base44.entities.NotificationPreference.create(data);
        setPreferencesId(created.id);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sun className="w-4 h-4 text-indigo-500" /> Daily Verse Reminder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Get a new Bible verse each day at your preferred time to start your day with Scripture.
        </p>

        {/* Push notification request */}
        {showPushRequest && (
          <LazyPushNotificationRequest
            featureName="Daily Verse Reminder"
            onApprove={handlePushApprove}
            onDismiss={() => {
              setShowPushRequest(false);
              setEnabled(false);
            }}
          />
        )}

        {/* Time picker */}
        {enabled && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-gray-600" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-indigo-500"
            />
            <span className="text-xs text-gray-500">Send daily reminder at this time</span>
          </div>
        )}

        {/* Enable/disable toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {enabled ? 'Reminders active' : 'Reminders off'}
            </span>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading || showPushRequest}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              enabled ? 'bg-indigo-600' : 'bg-gray-200'
            } ${loading || showPushRequest ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
              enabled ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Save button */}
        {enabled && time && (
          <Button
            onClick={() => savePreferences(true)}
            disabled={loading}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
            size="sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
             saved ? <CheckCircle2 className="w-4 h-4" /> : null}
            {saved ? 'Saved!' : 'Save Reminder Time'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}