import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, Clock, Volume2 } from 'lucide-react';

export default function NotificationPreferencesPanel({ userEmail, language = 'en' }) {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, [userEmail]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const result = await base44.entities.NotificationPreferences.filter({
        userEmail,
      });
      if (result && result.length > 0) {
        setPrefs(result[0]);
      } else {
        // Create default preferences
        const defaults = {
          userEmail,
          enablePushNotifications: true,
          enableEmailReminders: true,
          verseReminderEnabled: true,
          prayerReminderEnabled: true,
          readingPlanReminderEnabled: true,
          reminderTimeLocal: '08:00',
          reminderTimezone: 'America/Toronto',
          reminderLanguage: language,
          snoozMinutesDefault: 60,
        };
        const created = await base44.entities.NotificationPreferences.create(defaults);
        setPrefs(created);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates) => {
    try {
      setSaving(true);
      const updated = await base44.entities.NotificationPreferences.update(prefs.id, updates);
      setPrefs(updated);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading preferences...</div>;
  if (!prefs) return <div className="text-center py-8">Failed to load preferences</div>;

  return (
    <div className="space-y-6 w-full max-w-2xl">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Delivery Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Push Notifications</Label>
            <Switch
              checked={prefs.enablePushNotifications}
              onCheckedChange={(val) =>
                handleUpdate({ enablePushNotifications: val })
              }
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Email Reminders</Label>
            <Switch
              checked={prefs.enableEmailReminders}
              onCheckedChange={(val) =>
                handleUpdate({ enableEmailReminders: val })
              }
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminder Types */}
      <Card>
        <CardHeader>
          <CardTitle>Reminder Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Verse of the Day</Label>
            <Switch
              checked={prefs.verseReminderEnabled}
              onCheckedChange={(val) =>
                handleUpdate({ verseReminderEnabled: val })
              }
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Prayer Reminders</Label>
            <Switch
              checked={prefs.prayerReminderEnabled}
              onCheckedChange={(val) =>
                handleUpdate({ prayerReminderEnabled: val })
              }
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Reading Plan Updates</Label>
            <Switch
              checked={prefs.readingPlanReminderEnabled}
              onCheckedChange={(val) =>
                handleUpdate({ readingPlanReminderEnabled: val })
              }
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timing & Timezone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Reminder Time (Local)</Label>
            <input
              type="time"
              value={prefs.reminderTimeLocal || '08:00'}
              onChange={(e) =>
                handleUpdate({ reminderTimeLocal: e.target.value })
              }
              disabled={saving}
              className="mt-2 px-3 py-2 border border-gray-300 rounded-lg w-full"
            />
          </div>
          <div>
            <Label>Timezone</Label>
            <input
              type="text"
              value={prefs.reminderTimezone}
              onChange={(e) =>
                handleUpdate({ reminderTimezone: e.target.value })
              }
              disabled={saving}
              placeholder="America/Toronto"
              className="mt-2 px-3 py-2 border border-gray-300 rounded-lg w-full text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              E.g., America/Toronto, Europe/London, Asia/Kolkata
            </p>
          </div>

          <div className="space-y-2">
            <Label>Quiet Hours (Optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="time"
                  value={prefs.quietHoursStart || ''}
                  onChange={(e) =>
                    handleUpdate({
                      quietHoursStart: e.target.value || null,
                    })
                  }
                  disabled={saving}
                  placeholder="Start"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Start</p>
              </div>
              <div>
                <input
                  type="time"
                  value={prefs.quietHoursEnd || ''}
                  onChange={(e) =>
                    handleUpdate({
                      quietHoursEnd: e.target.value || null,
                    })
                  }
                  disabled={saving}
                  placeholder="End"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">End</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              No reminders will be sent during quiet hours
            </p>
          </div>

          <div>
            <Label>Snooze Duration (minutes)</Label>
            <input
              type="number"
              value={prefs.snoozMinutesDefault || 60}
              onChange={(e) =>
                handleUpdate({ snoozMinutesDefault: parseInt(e.target.value) })
              }
              disabled={saving}
              min="5"
              max="480"
              className="mt-2 px-3 py-2 border border-gray-300 rounded-lg w-full"
            />
          </div>
        </CardContent>
      </Card>

      {saving && (
        <p className="text-sm text-gray-500 text-center">Saving changes...</p>
      )}
    </div>
  );
}