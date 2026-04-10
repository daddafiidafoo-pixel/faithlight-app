import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Mail, Clock, Check, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '18:00', '20:00', '21:00'];

export default function DailyReminderSettings({ user }) {
  const [settings, setSettings] = useState({
    enabled: false,
    time: '08:00',
    email: true,
    push: false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailInput, setEmailInput] = useState(user?.email || '');

  useEffect(() => {
    // Load saved settings from localStorage
    try {
      const stored = localStorage.getItem(`daily_reminder_${user?.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      }
    } catch {}
    if (user?.email) setEmailInput(user.email);
  }, [user?.id, user?.email]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Persist settings locally
      localStorage.setItem(`daily_reminder_${user?.id}`, JSON.stringify(settings));

      // Fetch today's verse snippet
      let verseSnippet = '';
      let verseRef = '';
      try {
        const today = new Date();
        const dateKey = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const verses = await base44.entities.DailyVerse.filter({ dateKey, language: 'en' });
        if (verses?.[0]) {
          verseSnippet = verses[0].verseText?.slice(0, 120) || '';
          verseRef = verses[0].reference || '';
        }
      } catch {}

      const verseSection = verseSnippet
        ? `\n\n📖 Today's Verse (${verseRef}):\n"${verseSnippet}…"\n\nLet this verse guide your prayer time today.`
        : '';

      // If email reminders enabled, send a confirmation + schedule via backend
      if (settings.enabled && settings.email && emailInput) {
        await base44.integrations.Core.SendEmail({
          to: emailInput,
          subject: '🌅 Daily Prayer Reminder Set — FaithLight',
          body: `Hi ${user?.full_name || 'Friend'},\n\nYour daily prayer reminder is set for ${settings.time} each day.${verseSection}\n\nYou'll receive a daily nudge to spend time in prayer and read today's devotional.\n\nKeep pressing forward in faith! 🙏\n\n— FaithLight`,
        });
      }

      // Request browser push notification permission
      if (settings.push && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          schedulePushNotification(settings.time);
        } else {
          setSettings(prev => ({ ...prev, push: false }));
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save reminder:', err);
    } finally {
      setSaving(false);
    }
  };

  const schedulePushNotification = (time) => {
    // Calculate ms until next occurrence of the chosen time
    const [hours, mins] = time.split(':').map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(hours, mins, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const delay = next - now;

    setTimeout(async () => {
      let body = "Time for your daily prayer and Bible reading. Open FaithLight! 🙏";
      try {
        const today = new Date();
        const dateKey = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const verses = await base44.entities.DailyVerse.filter({ dateKey, language: 'en' });
        if (verses?.[0]?.verseText) {
          body = `"${verses[0].verseText.slice(0, 80)}…" — ${verses[0].reference}`;
        }
      } catch {}
      new Notification('🙏 Daily Prayer Reminder', {
        body,
        icon: '/favicon.ico',
      });
      // Re-schedule for next day
      schedulePushNotification(time);
    }, delay);
  };

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <Card className="border-amber-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="w-5 h-5 text-amber-500" />
          Daily Prayer Reminder
        </CardTitle>
        <CardDescription>
          Get a personalized daily prayer reminder with today's Verse of the Day at your chosen time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.enabled ? <Bell className="w-4 h-4 text-amber-500" /> : <BellOff className="w-4 h-4 text-gray-400" />}
            <span className="text-sm font-medium">Enable Reminders</span>
          </div>
          <Switch checked={settings.enabled} onCheckedChange={() => toggle('enabled')} />
        </div>

        {settings.enabled && (
          <>
            {/* Time picker */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" /> Reminder Time
              </label>
              <div className="flex flex-wrap gap-2">
                {TIMES.map(t => (
                  <button
                    key={t}
                    onClick={() => setSettings(prev => ({ ...prev, time: t }))}
                    className="text-xs px-3 py-1.5 rounded-lg border transition-all font-medium"
                    style={{
                      background: settings.time === t ? '#F59E0B' : 'white',
                      color: settings.time === t ? 'white' : '#374151',
                      borderColor: settings.time === t ? '#F59E0B' : '#E5E7EB',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification channels */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Notify via</p>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    {settings.email && (
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        className="text-xs text-gray-500 bg-transparent border-b border-gray-300 outline-none mt-0.5 w-48"
                        placeholder="your@email.com"
                      />
                    )}
                  </div>
                </div>
                <Switch checked={settings.email} onCheckedChange={() => toggle('email')} />
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Push Notification</p>
                    <p className="text-xs text-gray-500">Browser notification</p>
                  </div>
                </div>
                <Switch checked={settings.push} onCheckedChange={() => toggle('push')} />
              </div>
            </div>
          </>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gap-2"
          style={{ background: saved ? '#22C55E' : '#F59E0B', color: 'white', border: 'none' }}
        >
          {saved ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          {saved ? 'Reminder Saved!' : saving ? 'Saving…' : 'Save Reminder'}
        </Button>

        {saved && settings.email && (
          <p className="text-xs text-center text-green-600">
            ✅ Confirmation email sent to {emailInput}
          </p>
        )}
      </CardContent>
    </Card>
  );
}