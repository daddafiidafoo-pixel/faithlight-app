import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'faithlight_daily_verse_notif';

// Curated daily verses (day-of-year index mod length)
const DAILY_VERSES = [
  { ref: 'John 3:16', book: 'JHN', chapter: 3, text: 'For God so loved the world…' },
  { ref: 'Philippians 4:13', book: 'PHP', chapter: 4, text: 'I can do all things through Christ…' },
  { ref: 'Psalm 23:1', book: 'PSA', chapter: 23, text: 'The Lord is my shepherd…' },
  { ref: 'Romans 8:28', book: 'ROM', chapter: 8, text: 'All things work together for good…' },
  { ref: 'Isaiah 40:31', book: 'ISA', chapter: 40, text: 'Those who hope in the Lord will renew their strength…' },
  { ref: 'Jeremiah 29:11', book: 'JER', chapter: 29, text: 'I know the plans I have for you…' },
  { ref: 'Proverbs 3:5', book: 'PRO', chapter: 3, text: 'Trust in the Lord with all your heart…' },
  { ref: 'Matthew 11:28', book: 'MAT', chapter: 11, text: 'Come to me, all you who are weary…' },
  { ref: 'Psalm 46:10', book: 'PSA', chapter: 46, text: 'Be still and know that I am God…' },
  { ref: '1 John 4:18', book: '1JN', chapter: 4, text: 'Perfect love drives out fear…' },
  { ref: '2 Timothy 1:7', book: '2TI', chapter: 1, text: 'God has given us a spirit of power…' },
  { ref: 'Psalm 119:105', book: 'PSA', chapter: 119, text: 'Your word is a lamp to my feet…' },
  { ref: 'Joshua 1:9', book: 'JOS', chapter: 1, text: 'Be strong and courageous…' },
  { ref: 'Romans 5:8', book: 'ROM', chapter: 5, text: 'God demonstrates his own love for us…' },
];

function getTodayVerse() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

export default function DailyVerseNotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('08:00');
  const [permission, setPermission] = useState('default');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs) { setEnabled(prefs.enabled); setTime(prefs.time || '08:00'); }
    setPermission(Notification?.permission ?? 'default');
    // Re-schedule if already enabled
    if (prefs?.enabled && Notification?.permission === 'granted') {
      scheduleBrowserNotif(prefs.time || '08:00');
    }
  }, []);

  const scheduleBrowserNotif = (targetTime) => {
    if (window.__dailyVerseTimer) clearTimeout(window.__dailyVerseTimer);

    const scheduleNext = () => {
      const [h, m] = targetTime.split(':').map(Number);
      const now = new Date();
      const next = new Date(now);
      next.setHours(h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      const ms = next - now;

      window.__dailyVerseTimer = setTimeout(() => {
        const verse = getTodayVerse();
        const n = new Notification('📖 Daily Verse — FaithLight', {
          body: `${verse.ref}: "${verse.text}"`,
          icon: '/icon-192.png',
          tag: 'daily-verse',
          data: { url: `/BibleReader?book=${verse.book}&chapter=${verse.chapter}` },
        });
        n.onclick = () => {
          window.focus();
          window.location.href = `/BibleReader?book=${verse.book}&chapter=${verse.chapter}`;
          n.close();
        };
        scheduleNext(); // reschedule for tomorrow
      }, ms);
    };

    scheduleNext();
  };

  const savePrefs = async (nextEnabled, nextTime) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: nextEnabled, time: nextTime }));

    if (window.__dailyVerseTimer) clearTimeout(window.__dailyVerseTimer);
    if (nextEnabled && Notification?.permission === 'granted') {
      scheduleBrowserNotif(nextTime);
    }

    // Persist to backend so server-side email can also fire at correct time
    setSaving(true);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        // Store preference on user record
        await base44.auth.updateMe({
          daily_verse_notif_enabled: nextEnabled,
          daily_verse_notif_time: nextTime,
        });
      }
    } catch (e) {
      // Silent — localStorage is the primary store
    } finally {
      setSaving(false);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) { toast.error('Notifications not supported in this browser'); return; }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      toast.success('Notifications allowed!');
      if (enabled) scheduleBrowserNotif(time);
    } else {
      toast.error('Permission denied. Enable in browser settings to receive notifications.');
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
    await savePrefs(val, time);
    toast.success(val ? `Daily verse reminder set for ${time} ✨` : 'Daily verse reminder disabled');
  };

  const handleTimeChange = async (e) => {
    setTime(e.target.value);
    await savePrefs(enabled, e.target.value);
    if (enabled) toast.success(`Reminder updated to ${e.target.value}`);
  };

  const verse = getTodayVerse();

  return (
    <div className="rounded-xl border bg-white p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-50">
          <BookOpen className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Daily Verse Notification</h3>
          <p className="text-xs text-gray-500">Get a verse each day linking directly to the Bible Reader</p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>

      {/* Today's preview */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs font-bold text-amber-700 mb-1">Today's verse preview</p>
        <p className="text-sm font-semibold text-gray-900">{verse.ref}</p>
        <p className="text-xs text-gray-500 mt-0.5 italic">"{verse.text}"</p>
      </div>

      {/* Permission status */}
      {permission === 'denied' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700">Notifications are blocked. Enable them in your browser settings, then return here.</p>
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
          <Clock className="w-3.5 h-3.5 text-gray-500" /> Delivery Time
        </Label>
        <input
          type="time"
          value={time}
          onChange={handleTimeChange}
          disabled={!enabled}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-400">
          Notification fires daily at this time. Tapping it opens the Bible Reader to that verse.
          {' '}You'll also receive a daily verse email if signed in.
        </p>
      </div>
    </div>
  );
}