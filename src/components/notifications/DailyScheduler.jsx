import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, BookOpen, Heart, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { getAllMeta } from '@/components/offline/bibleDB';
import { searchVerses } from '@/components/offline/useBibleOffline.jsx';

const SCHEDULE_KEY = 'fl_daily_schedule';

function loadSchedule() {
  try { return JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || {}; } catch { return {}; }
}
function saveSchedule(s) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(s));
}

export default function DailyScheduler() {
  const [schedule, setSchedule] = useState(loadSchedule);
  const [notifPerm, setNotifPerm] = useState('default');
  const [hasOffline, setHasOffline] = useState(false);
  const [testVerse, setTestVerse] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);

  useEffect(() => {
    if ('Notification' in window) setNotifPerm(Notification.permission);
    getAllMeta().then(meta => setHasOffline(meta.some(m => m.verseCount > 0)));
  }, []);

  const requestNotifPermission = async () => {
    if (!('Notification' in window)) { toast.error('Notifications not supported in this browser'); return; }
    const result = await Notification.requestPermission();
    setNotifPerm(result);
    if (result === 'granted') toast.success('Notifications enabled!');
    else toast.error('Notification permission denied');
  };

  const update = (key, value) => {
    const next = { ...schedule, [key]: value };
    setSchedule(next);
    saveSchedule(next);
  };

  const scheduleLocalNotif = (type, time, label) => {
    if (notifPerm !== 'granted') { toast.error('Please enable notifications first'); return; }
    const [h, m] = time.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target - now;

    setTimeout(() => {
      new Notification(`FaithLight — ${label}`, {
        body: type === 'verse'
          ? '🌅 Your daily verse is ready. Open FaithLight to read it.'
          : type === 'prayer'
          ? '🙏 Time for your daily prayer session.'
          : '📖 Time for your Bible study session.',
        icon: '/favicon.ico',
        tag: `fl-${type}`,
      });
    }, delay);

    toast.success(`${label} reminder set for ${time}`);
  };

  const previewDailyVerse = async () => {
    if (!hasOffline) { toast.error('Download a Bible translation first to use offline verses'); return; }
    setLoadingVerse(true);
    try {
      const meta = await getAllMeta();
      const valid = meta.filter(m => m.verseCount > 0);
      if (!valid.length) throw new Error('No offline Bible found');
      const lang = valid[0].languageCode;
      // Pick a random short verse from John
      const results = await searchVerses(lang, 'love');
      if (results.length > 0) {
        const pick = results[Math.floor(Math.random() * Math.min(results.length, 5))];
        setTestVerse(pick);
      } else {
        setTestVerse({ reference: 'John 3:16', text: 'For God so loved the world...' });
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoadingVerse(false);
    }
  };

  const permColor = notifPerm === 'granted' ? 'text-green-600' : notifPerm === 'denied' ? 'text-red-500' : 'text-amber-500';
  const permLabel = notifPerm === 'granted' ? 'Enabled' : notifPerm === 'denied' ? 'Blocked' : 'Not set';

  return (
    <div className="space-y-4">
      {/* Notification Permission */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900 text-sm">Push Notifications</h3>
          </div>
          <span className={`text-xs font-semibold ${permColor}`}>{permLabel}</span>
        </div>
        {notifPerm !== 'granted' && notifPerm !== 'denied' && (
          <button
            onClick={requestNotifPermission}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
          >
            Enable Notifications
          </button>
        )}
        {notifPerm === 'denied' && (
          <p className="text-xs text-red-500 flex items-start gap-1.5 mt-1">
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            Notifications are blocked. Go to your browser/device settings to allow them for this site.
          </p>
        )}
        {notifPerm === 'granted' && (
          <p className="text-xs text-green-600">✓ FaithLight can send you daily reminders</p>
        )}
      </div>

      {/* Daily Verse Notification */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900 text-sm">Daily Verse — Morning Notification</h3>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            type="time"
            value={schedule.verseTime || '07:00'}
            onChange={e => update('verseTime', e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={() => scheduleLocalNotif('verse', schedule.verseTime || '07:00', 'Daily Verse')}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold"
          >
            Set
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={previewDailyVerse}
            disabled={loadingVerse}
            className="text-xs text-indigo-600 underline disabled:opacity-50"
          >
            {loadingVerse ? 'Loading…' : 'Preview verse from offline Bible'}
          </button>
        </div>
        {testVerse && (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-bold text-amber-700 mb-1">{testVerse.reference}</p>
            <p className="text-sm text-gray-700 italic leading-relaxed">"{testVerse.text}"</p>
          </div>
        )}
        {!hasOffline && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Info size={11} /> Download an offline Bible translation to get verses from your device each morning.
          </p>
        )}
      </div>

      {/* Prayer Reminder */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} className="text-rose-500" />
          <h3 className="font-semibold text-gray-900 text-sm">Prayer Session Reminder</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="time"
            value={schedule.prayerTime || '08:00'}
            onChange={e => update('prayerTime', e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={() => scheduleLocalNotif('prayer', schedule.prayerTime || '08:00', 'Prayer Time')}
            className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold"
          >
            Set
          </button>
        </div>
      </div>

      {/* Study Session Reminder */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-indigo-500" />
          <h3 className="font-semibold text-gray-900 text-sm">Study Session Reminder</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="time"
            value={schedule.studyTime || '09:00'}
            onChange={e => update('studyTime', e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={() => scheduleLocalNotif('study', schedule.studyTime || '09:00', 'Study Time')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
          >
            Set
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Reminders trigger once per day in your current browser session. For persistent reminders, use a native app.</p>
      </div>
    </div>
  );
}