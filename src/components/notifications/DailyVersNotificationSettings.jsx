import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Clock, Sun, CloudSun, Moon } from 'lucide-react';
import { toast } from 'sonner';

export default function DailyVerseNotificationSettings() {
  const [morning, setMorning] = useState(true);
  const [morningTime, setMorningTime] = useState('08:00');
  const [afternoon, setAfternoon] = useState(false);
  const [afternoonTime, setAfternoonTime] = useState('14:00');
  const [evening, setEvening] = useState(false);
  const [eveningTime, setEveningTime] = useState('19:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.morningDevotionEnabled !== undefined) setMorning(user.morningDevotionEnabled);
        if (user?.morningDevotionTime) setMorningTime(user.morningDevotionTime);
        if (user?.afternoonReflectionEnabled !== undefined) setAfternoon(user.afternoonReflectionEnabled);
        if (user?.afternoonReflectionTime) setAfternoonTime(user.afternoonReflectionTime);
        if (user?.eveningPrayerEnabled !== undefined) setEvening(user.eveningPrayerEnabled);
        if (user?.eveningPrayerTime) setEveningTime(user.eveningPrayerTime);
      } catch (err) {
        console.error('Failed to load preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const savePreferences = async (m, mt, af, aft, e, et) => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        morningDevotionEnabled: m,
        morningDevotionTime: mt,
        afternoonReflectionEnabled: af,
        afternoonReflectionTime: aft,
        eveningPrayerEnabled: e,
        eveningPrayerTime: et,
      });
      toast.success('Notification settings saved');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleMorningToggle = (val) => {
    setMorning(val);
    savePreferences(val, morningTime, afternoon, afternoonTime, evening, eveningTime);
  };

  const handleMorningTime = (val) => {
    setMorningTime(val);
    savePreferences(morning, val, afternoon, afternoonTime, evening, eveningTime);
  };

  const handleAfternoonToggle = (val) => {
    setAfternoon(val);
    savePreferences(morning, morningTime, val, afternoonTime, evening, eveningTime);
  };

  const handleAfternoonTime = (val) => {
    setAfternoonTime(val);
    savePreferences(morning, morningTime, afternoon, val, evening, eveningTime);
  };

  const handleEveningToggle = (val) => {
    setEvening(val);
    savePreferences(morning, morningTime, afternoon, afternoonTime, val, eveningTime);
  };

  const handleEveningTime = (val) => {
    setEveningTime(val);
    savePreferences(morning, morningTime, afternoon, afternoonTime, evening, val);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <Bell className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Spiritual Habit Loop</h3>
        <p className="text-xs text-gray-500 ml-auto">Read • Reflect • Pray</p>
      </div>

      {/* Morning Verse (always enabled, shows by default) */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 space-y-3">
        <div className="flex items-center gap-3">
          <Sun className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Morning Verse</p>
            <p className="text-xs text-gray-600">Start your day with Scripture</p>
          </div>
          <button
            onClick={() => handleMorningToggle(!morning)}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              morning ? 'bg-blue-600' : 'bg-gray-300'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                morning ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {morning && (
          <div className="flex items-center gap-3 bg-white rounded-lg p-2 ml-8">
            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="time"
              value={morningTime}
              onChange={(e) => handleMorningTime(e.target.value)}
              disabled={saving}
              className="text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
            />
          </div>
        )}
      </div>

      {/* Afternoon Reflection (opt-in) */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 space-y-3">
        <div className="flex items-center gap-3">
          <CloudSun className="w-5 h-5 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Afternoon Reflection</p>
            <p className="text-xs text-gray-600">Apply the verse to your day</p>
          </div>
          <button
            onClick={() => handleAfternoonToggle(!afternoon)}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              afternoon ? 'bg-amber-600' : 'bg-gray-300'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                afternoon ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {afternoon && (
          <div className="flex items-center gap-3 bg-white rounded-lg p-2 ml-8">
            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="time"
              value={afternoonTime}
              onChange={(e) => handleAfternoonTime(e.target.value)}
              disabled={saving}
              className="text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
            />
          </div>
        )}
      </div>

      {/* Evening Prayer (opt-in) */}
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 space-y-3">
        <div className="flex items-center gap-3">
          <Moon className="w-5 h-5 text-indigo-600" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Evening Prayer</p>
            <p className="text-xs text-gray-600">End your day in prayer</p>
          </div>
          <button
            onClick={() => handleEveningToggle(!evening)}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              evening ? 'bg-indigo-600' : 'bg-gray-300'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                evening ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {evening && (
          <div className="flex items-center gap-3 bg-white rounded-lg p-2 ml-8">
            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="time"
              value={eveningTime}
              onChange={(e) => handleEveningTime(e.target.value)}
              disabled={saving}
              className="text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
            />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 bg-gray-50 rounded p-3 border border-gray-100">
        💡 Build a daily spiritual habit: Read Scripture in the morning, reflect during the day, and pray in the evening.
      </p>
    </div>
  );
}