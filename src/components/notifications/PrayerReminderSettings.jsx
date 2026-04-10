import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const STORAGE_KEY = 'faithlight_prayer_reminder';

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

export default function PrayerReminderSettings() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('07:00');
  const [permission, setPermission] = useState('default'); // 'default' | 'granted' | 'denied'

  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs) { setEnabled(prefs.enabled); setTime(prefs.time || '07:00'); }
    setPermission(Notification?.permission ?? 'default');
  }, []);

  const save = (nextEnabled, nextTime) => {
    const prefs = { enabled: nextEnabled, time: nextTime };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    // Schedule using setTimeout trick (works within the browser session)
    // Clear any existing interval
    if (window.__prayerReminderTimer) clearInterval(window.__prayerReminderTimer);

    if (nextEnabled && Notification?.permission === 'granted') {
      scheduleReminder(nextTime);
    }
  };

  const scheduleReminder = (targetTime) => {
    // Calculate ms until next occurrence of targetTime
    const fire = () => {
      const [h, m] = targetTime.split(':').map(Number);
      const now = new Date();
      const next = new Date(now);
      next.setHours(h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      const ms = next - now;
      return ms;
    };

    const scheduleNext = () => {
      const ms = fire();
      window.__prayerReminderTimer = setTimeout(() => {
        const n = new Notification('🙏 Prayer Time – FaithLight', {
          body: 'It\'s your daily prayer time. Join the Community Prayer Wall.',
          icon: '/icon-192.png',
          tag: 'prayer-reminder',
          data: { url: '/CommunityPrayerWall' },
        });
        n.onclick = () => { window.focus(); window.location.hash = '/CommunityPrayerWall'; n.close(); };
        scheduleNext(); // reschedule for tomorrow
      }, ms);
    };

    scheduleNext();
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) { toast.error('Notifications not supported in this browser'); return; }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      toast.success('Notifications allowed!');
      if (enabled) scheduleReminder(time);
    } else {
      toast.error('Permission denied. Enable notifications in browser settings.');
    }
  };

  const handleToggle = async (val) => {
    if (val && permission !== 'granted') {
      await requestPermission();
      const fresh = Notification?.permission;
      setPermission(fresh);
      if (fresh !== 'granted') return;
    }
    setEnabled(val);
    save(val, time);
    toast.success(val ? `Prayer reminder set for ${time}` : 'Prayer reminder disabled');
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
    save(enabled, e.target.value);
    if (enabled) toast.success(`Reminder updated to ${e.target.value}`);
  };

  return (
    <div className="rounded-xl border bg-white p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-50">
          <Bell className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Daily Prayer Reminder</h3>
          <p className="text-xs text-gray-500">Get a push notification linking to the Community Prayer Wall</p>
        </div>
        <Switch className="ml-auto" checked={enabled} onCheckedChange={handleToggle} />
      </div>

      {/* Permission status */}
      {permission === 'denied' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700">Notifications are blocked. Please enable them in your browser settings, then come back.</p>
        </div>
      )}
      {permission === 'default' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-amber-800 mb-2">Browser permission needed to send notifications.</p>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={requestPermission}>Allow Notifications</Button>
          </div>
        </div>
      )}
      {permission === 'granted' && (
        <div className="flex items-center gap-2 text-xs text-green-700">
          <CheckCircle2 className="w-3.5 h-3.5" /> Notifications allowed
        </div>
      )}

      {/* Time picker */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-500" /> Reminder Time
        </Label>
        <input
          type="time"
          value={time}
          onChange={handleTimeChange}
          disabled={!enabled}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-400">Reminder fires once daily at this time while the app is open in your browser.</p>
      </div>
    </div>
  );
}