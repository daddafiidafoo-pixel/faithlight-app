import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Clock, Sun, Moon, Check, Loader2, Lock, ChevronRight } from 'lucide-react';
import { getDailyVerse } from '../components/lib/dailyVerseList';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const TIME_SLOTS = [
  { value: '06:00', label: '6:00 AM – Early Morning' },
  { value: '07:00', label: '7:00 AM – Morning' },
  { value: '08:00', label: '8:00 AM – Morning' },
  { value: '09:00', label: '9:00 AM – Mid Morning' },
  { value: '12:00', label: '12:00 PM – Noon' },
  { value: '18:00', label: '6:00 PM – Evening' },
  { value: '20:00', label: '8:00 PM – Night' },
  { value: '21:00', label: '9:00 PM – Night' },
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Vancouver', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Africa/Nairobi', 'Africa/Addis_Ababa', 'Africa/Lagos', 'Asia/Jerusalem', 'Asia/Kolkata',
  'Australia/Sydney',
];

export default function VerseOfDaySettings() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushStatus, setPushStatus] = useState('not_requested'); // 'not_requested' | 'granted' | 'denied'

  const verse = getDailyVerse('en');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadSettings(u);
    }).catch(() => {}).finally(() => setAuthChecked(true));

    // Check push support
    if ('Notification' in window) {
      setPushSupported(true);
      setPushStatus(Notification.permission);
    }
  }, []);

  const loadSettings = async (u) => {
    const existing = await base44.entities.NotificationSettings.filter({ user_id: u.id });
    if (existing.length > 0) {
      setSettings(existing[0]);
    } else {
      const created = await base44.entities.NotificationSettings.create({
        user_id: u.id,
        verse_of_day_enabled: false,
        verse_of_day_time: '08:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        push_permission_status: 'not_requested',
      });
      setSettings(created);
    }
  };

  const requestPushPermission = async () => {
    if (!pushSupported) return;
    const permission = await Notification.requestPermission();
    setPushStatus(permission);
    if (settings) {
      const updated = { ...settings, push_permission_status: permission };
      setSettings(updated);
      await base44.entities.NotificationSettings.update(settings.id, updated);
    }
    if (permission === 'granted') {
      // Show a test notification
      new Notification('FaithLight 🌅', {
        body: `"${verse.text.slice(0, 80)}…" — ${verse.ref}`,
        icon: '/favicon.ico',
      });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await base44.entities.NotificationSettings.update(settings.id, settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!authChecked) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verse of the Day Reminders</h2>
          <p className="text-gray-500 text-sm mb-5">Sign in to set up your daily verse notification at your preferred time.</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-700">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white px-4 py-10 text-center">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Bell className="w-7 h-7 text-amber-300" />
        </div>
        <h1 className="text-2xl font-extrabold mb-1">Daily Verse Reminders</h1>
        <p className="text-indigo-200 text-sm">Get Scripture delivered to you every day</p>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 space-y-5">

        {/* Today's Preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">Today's Verse Preview</p>
          <p className="text-sm text-gray-700 italic leading-relaxed">"{verse.text.slice(0, 120)}{verse.text.length > 120 ? '…' : ''}"</p>
          <p className="text-xs font-bold text-indigo-700 mt-2">— {verse.ref}</p>
        </div>

        {/* Main Toggle */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings?.verse_of_day_enabled ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                {settings?.verse_of_day_enabled ? <Bell className="w-5 h-5 text-indigo-600" /> : <BellOff className="w-5 h-5 text-gray-400" />}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Verse of the Day</p>
                <p className="text-xs text-gray-500">Daily Scripture notification</p>
              </div>
            </div>
            <Switch
              checked={settings?.verse_of_day_enabled || false}
              onCheckedChange={v => setSettings(s => ({ ...s, verse_of_day_enabled: v }))}
            />
          </div>
        </div>

        {/* Time & Timezone — shown when enabled */}
        {settings?.verse_of_day_enabled && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Delivery Time
              </h3>
              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1.5">Preferred Time</label>
                <Select value={settings?.verse_of_day_time} onValueChange={v => setSettings(s => ({ ...s, verse_of_day_time: v }))}>
                  <SelectTrigger className="bg-gray-50 text-sm">
                    <SelectValue placeholder="Choose time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          {parseInt(t.value) < 12 ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                          {t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1.5">Timezone</label>
                <Select value={settings?.timezone} onValueChange={v => setSettings(s => ({ ...s, timezone: v }))}>
                  <SelectTrigger className="bg-gray-50 text-sm">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz.replace(/_/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Push Permission */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" /> Browser Push Notifications
              </h3>
              {pushStatus === 'granted' ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl p-3">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-semibold">Push notifications enabled ✓</span>
                </div>
              ) : pushStatus === 'denied' ? (
                <div className="bg-red-50 rounded-xl p-3 text-sm text-red-600">
                  Notifications are blocked. Please enable them in your browser settings.
                </div>
              ) : pushSupported ? (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Allow browser notifications to receive your daily verse even when the app isn't open.</p>
                  <Button onClick={requestPushPermission} variant="outline" className="gap-2 text-sm w-full">
                    <Bell className="w-4 h-4" /> Enable Browser Notifications
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Push notifications are not supported in this browser.</p>
              )}
            </div>
          </>
        )}

        {/* Prayer Reminders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <span className="text-lg">🙏</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Prayer Reminders</p>
                <p className="text-xs text-gray-500">Morning & evening prayer prompts</p>
              </div>
            </div>
            <Switch
              checked={settings?.prayer_reminder_enabled || false}
              onCheckedChange={v => setSettings(s => ({ ...s, prayer_reminder_enabled: v }))}
            />
          </div>
        </div>

        {/* Save */}
        <Button onClick={handleSave} disabled={saving || !settings} className="w-full bg-indigo-700 hover:bg-indigo-800 gap-2 h-12 text-base font-bold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Notification Settings'}
        </Button>

        {/* Link to full notification prefs */}
        <Link to={createPageUrl('NotificationPreferencesPage')}>
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors cursor-pointer">
            <span className="text-sm font-medium text-gray-700">All Notification Preferences</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </Link>

      </div>
    </div>
  );
}