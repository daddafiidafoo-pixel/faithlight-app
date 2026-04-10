import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NotificationSettings({ userId }) {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const data = await base44.entities.NotificationPreferences.filter({
          user_id: userId
        });
        setPrefs(
          data?.[0] || {
            user_id: userId,
            email_notifications: true,
            push_notifications: true,
            in_app_notifications: true,
            quiet_hours_enabled: false
          }
        );
      } catch (err) {
        console.error('Error loading preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPrefs();
  }, [userId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (prefs.id) {
        await base44.entities.NotificationPreferences.update(prefs.id, prefs);
      } else {
        await base44.entities.NotificationPreferences.create(prefs);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl space-y-4">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={prefs.in_app_notifications}
              onChange={(e) =>
                setPrefs({ ...prefs, in_app_notifications: e.target.checked })
              }
            />
            <div>
              <p className="font-medium">In-App Notifications</p>
              <p className="text-sm text-gray-600">See alerts in the notification center</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={prefs.push_notifications}
              onChange={(e) =>
                setPrefs({ ...prefs, push_notifications: e.target.checked })
              }
            />
            <div>
              <p className="font-medium">Browser Push Notifications</p>
              <p className="text-sm text-gray-600">Desktop alerts (requires permission)</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={prefs.email_notifications}
              onChange={(e) =>
                setPrefs({ ...prefs, email_notifications: e.target.checked })
              }
            />
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Get updates via email</p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Event Types */}
      <Card>
        <CardHeader>
          <CardTitle>Event Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'message_notifications', label: 'New Messages' },
            { key: 'friend_request_notifications', label: 'Friend Requests' },
            { key: 'live_event_notifications', label: 'Live Events & Calls' },
            { key: 'group_notifications', label: 'Group Activity' },
            { key: 'study_reminders', label: 'Study Reminders' }
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs[key] !== false}
                onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
              />
              <span>{label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours (Do Not Disturb)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prefs.quiet_hours_enabled}
              onChange={(e) =>
                setPrefs({ ...prefs, quiet_hours_enabled: e.target.checked })
              }
            />
            <span>Enable quiet hours</span>
          </label>

          {prefs.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <Input
                  type="time"
                  value={prefs.quiet_hours_start || '22:00'}
                  onChange={(e) =>
                    setPrefs({ ...prefs, quiet_hours_start: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <Input
                  type="time"
                  value={prefs.quiet_hours_end || '08:00'}
                  onChange={(e) =>
                    setPrefs({ ...prefs, quiet_hours_end: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}