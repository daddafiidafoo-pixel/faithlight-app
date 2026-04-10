import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Loader2, Save, AlertCircle, BookOpen, Bell, CheckCircle2 } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function NotificationPreferencesPage() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const prefs = await base44.entities.NotificationPreference.filter({
          user_id: currentUser.id
        });

        if (prefs && prefs.length > 0) {
          setPreferences(prefs[0]);
        } else {
          // Create default preferences
          const newPrefs = await base44.entities.NotificationPreference.create({
            user_id: currentUser.id,
            email_enabled: true,
            in_app_enabled: true,
            task_assignment: true,
            task_deadline: true,
            comment_mention: true,
            status_change: true,
            group_invite: true,
            group_activity: true,
            event_reminder: true
          });
          setPreferences(newPrefs);
        }
      } catch (err) {
        setError('Failed to load preferences');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggle = (field) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await base44.entities.NotificationPreference.update(preferences.id, preferences);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save preferences');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
        <p className="text-gray-600 mt-2">Customize how and when you receive notifications</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">✓ Preferences saved successfully</p>
        </div>
      )}

      {preferences && (
        <>
          {/* General Settings */}
          <Card className="mb-6 p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General</h2>
            <div className="space-y-4">
              <ToggleSetting
                label="In-App Notifications"
                description="Show notifications inside the app"
                checked={preferences.in_app_enabled}
                onChange={() => handleToggle('in_app_enabled')}
              />
              <ToggleSetting
                label="Email Notifications"
                description="Send notifications via email"
                checked={preferences.email_enabled}
                onChange={() => handleToggle('email_enabled')}
              />
            </div>
          </Card>

          {/* Notification Types */}
          <Card className="mb-6 p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h2>
            <div className="space-y-4">
              <ToggleSetting
                label="Task Assignments"
                description="When you're assigned a new task"
                checked={preferences.task_assignment}
                onChange={() => handleToggle('task_assignment')}
              />
              <ToggleSetting
                label="Task Deadlines"
                description="Reminder 24 hours before deadline"
                checked={preferences.task_deadline}
                onChange={() => handleToggle('task_deadline')}
              />
              <ToggleSetting
                label="Comment Mentions"
                description="When you're mentioned in a comment"
                checked={preferences.comment_mention}
                onChange={() => handleToggle('comment_mention')}
              />
              <ToggleSetting
                label="Status Changes"
                description="Updates on items you're following"
                checked={preferences.status_change}
                onChange={() => handleToggle('status_change')}
              />
              <ToggleSetting
                label="Group Invitations"
                description="When invited to join a group"
                checked={preferences.group_invite}
                onChange={() => handleToggle('group_invite')}
              />
              <ToggleSetting
                label="Group Activity"
                description="New posts and activity in your groups"
                checked={preferences.group_activity}
                onChange={() => handleToggle('group_activity')}
              />
              <ToggleSetting
                label="Event Reminders"
                description="Reminders when events are starting soon"
                checked={preferences.event_reminder}
                onChange={() => handleToggle('event_reminder')}
              />
            </div>
          </Card>

          {/* Quiet Hours */}
          <Card className="mb-6 p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Quiet Hours</h2>
                <p className="text-sm text-gray-600 mt-1">Don't disturb mode - no notifications during these hours</p>
              </div>
              <Switch
                checked={preferences.quiet_hours_enabled}
                onCheckedChange={() => handleToggle('quiet_hours_enabled')}
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time (24h format)</label>
                  <Input
                    type="time"
                    value={preferences.quiet_hours_start || '22:00'}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      quiet_hours_start: e.target.value
                    })}
                    className="max-w-xs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time (24h format)</label>
                  <Input
                    type="time"
                    value={preferences.quiet_hours_end || '08:00'}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      quiet_hours_end: e.target.value
                    })}
                    className="max-w-xs"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Prayer Journal & Prayer Wall Daily Reminder */}
          <Card className="mb-6 p-6 border border-purple-100 bg-purple-50/30">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Prayer Journal & Prayer Wall Reminder</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Receive a daily prompt to visit your prayer journal or the community prayer wall.</p>

            <div className="space-y-4">
              <ToggleSetting
                label="Enable Daily Prayer Reminder"
                description="Get reminded each day to pray and reflect"
                checked={preferences.prayer_reminder_enabled ?? false}
                onChange={() => handleToggle('prayer_reminder_enabled')}
              />

              {preferences.prayer_reminder_enabled && (
                <div className="bg-white rounded-xl p-4 border border-purple-100 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reminder Time</label>
                    <Input
                      type="time"
                      value={preferences.prayer_reminder_time || '07:00'}
                      onChange={(e) => setPreferences({ ...preferences, prayer_reminder_time: e.target.value })}
                      className="max-w-[160px] font-medium"
                    />
                    <p className="text-xs text-gray-400 mt-1">Times are in your local timezone</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Remind me to visit</label>
                    <div className="flex gap-3">
                      {[
                        { key: 'prayer_remind_journal', label: '📓 Prayer Journal' },
                        { key: 'prayer_remind_wall', label: '🙏 Prayer Wall' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setPreferences(p => ({ ...p, [key]: !p[key] }))}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            preferences[key] !== false
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">How to notify</label>
                    <div className="flex gap-3">
                      {[
                        { key: 'prayer_notify_push', label: '🔔 Push' },
                        { key: 'prayer_notify_email', label: '✉️ Email' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setPreferences(p => ({ ...p, [key]: !p[key] }))}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            preferences[key]
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <Bell className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-purple-700">
                      You'll receive a daily reminder at your chosen time. Make sure browser notifications are enabled for push alerts when the app is closed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Reading Plan Daily Reminder */}
          <Card className="mb-6 p-6 border border-indigo-100 bg-indigo-50/30">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Daily Reading Plan Reminder</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Get a daily reminder to complete your active reading plan.</p>

            <div className="space-y-4">
              <ToggleSetting
                label="Enable Daily Reminder"
                description="Receive a push notification at your chosen time each day"
                checked={preferences.reading_plan_reminder_enabled ?? false}
                onChange={() => handleToggle('reading_plan_reminder_enabled')}
              />

              {preferences.reading_plan_reminder_enabled && (
                <div className="bg-white rounded-xl p-4 border border-indigo-100 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reminder Time
                    </label>
                    <Input
                      type="time"
                      value={preferences.reading_plan_reminder_time || '08:00'}
                      onChange={(e) => setPreferences({ ...preferences, reading_plan_reminder_time: e.target.value })}
                      className="max-w-[160px] font-medium"
                    />
                    <p className="text-xs text-gray-400 mt-1">Times are in your local timezone</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reminder Days</label>
                    <div className="flex gap-2 flex-wrap">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                        const activeDays = preferences.reading_reminder_days || [1,2,3,4,5,6,0];
                        const isActive = activeDays.includes(idx);
                        return (
                          <button
                            key={day}
                            onClick={() => {
                              const days = activeDays.includes(idx)
                                ? activeDays.filter(d => d !== idx)
                                : [...activeDays, idx];
                              setPreferences({ ...preferences, reading_reminder_days: days });
                            }}
                            className={`w-10 h-10 rounded-full text-xs font-bold transition-all
                              ${isActive ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-indigo-50'}`}>
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <Bell className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      You'll receive an in-app notification at your chosen time. Enable browser notifications for push alerts when the app is closed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = createPageUrl('Settings')}
            >
              Back to Settings
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}