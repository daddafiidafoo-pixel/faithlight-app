import React, { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const timezones = [
  'America/Toronto',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export default function DailyReminderSettings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    is_enabled: true,
    reminder_time: '08:00',
    timezone: 'America/Toronto',
    reminder_type: 'both',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Try to load existing settings
        const existingSettings = await base44.entities.DailyReminderSettings.filter(
          { user_email: currentUser.email },
          null,
          1
        );

        if (existingSettings.length > 0) {
          setSettings(existingSettings[0]);
          setFormData(existingSettings[0]);
        } else {
          setFormData({
            is_enabled: true,
            reminder_time: '08:00',
            timezone: 'America/Toronto',
            reminder_type: 'both',
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      if (settings) {
        // Update existing
        await base44.entities.DailyReminderSettings.update(settings.id, formData);
      } else {
        // Create new
        await base44.entities.DailyReminderSettings.create({
          user_email: user.email,
          ...formData,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Please log in to manage reminder settings</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 text-violet-600" />
            <h1 className="text-3xl font-bold text-slate-900">Daily Reminders</h1>
          </div>
          <p className="text-slate-600">
            Configure when you'd like to receive your daily verse and reflection
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          {/* Enable/Disable */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_enabled"
                checked={formData.is_enabled}
                onChange={handleInputChange}
                className="w-5 h-5 rounded accent-violet-600 cursor-pointer"
              />
              <span className="font-medium text-slate-900">Enable daily reminders</span>
            </label>
          </div>

          {formData.is_enabled && (
            <>
              {/* Time Picker */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Preferred Time
                </label>
                <input
                  type="time"
                  name="reminder_time"
                  value={formData.reminder_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-2">
                  You'll receive your reminder at this time in your local timezone
                </p>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reminder Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  What to Receive
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'verse_of_day', label: 'Verse of the Day Only' },
                    { value: 'reflection', label: 'Reflection Only' },
                    { value: 'both', label: 'Both Verse and Reflection' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="reminder_type"
                        value={option.value}
                        checked={formData.reminder_type === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-violet-600 cursor-pointer"
                      />
                      <span className="text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              } disabled:opacity-50`}
            >
              {saved && <Check className="h-5 w-5" />}
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}