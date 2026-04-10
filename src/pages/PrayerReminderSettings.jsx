import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Volume2, VolumeX, CheckCircle, ChevronLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'fl_prayer_reminder';

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}
function saveSettings(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

function scheduleNotification(time, sound) {
  // Store intent; a ServiceWorker or setInterval will fire it
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const ms = target - now;

  // Clear previous timer
  if (window._flPrayerTimer) clearTimeout(window._flPrayerTimer);

  window._flPrayerTimer = setTimeout(() => {
    if (Notification.permission === 'granted') {
      const n = new Notification('🙏 Prayer Time - FaithLight', {
        body: 'Your daily prayer reminder is here. Take a moment to connect with God.',
        icon: '/favicon.ico',
        tag: 'fl-prayer-reminder',
        silent: !sound,
      });
      n.onclick = () => window.focus();
    }
    // Re-schedule for tomorrow
    scheduleNotification(time, sound);
  }, ms);
}

const PRESET_TIMES = [
  { label: 'Morning', time: '07:00', icon: '🌅' },
  { label: 'Noon', time: '12:00', icon: '☀️' },
  { label: 'Evening', time: '18:00', icon: '🌇' },
  { label: 'Night', time: '21:00', icon: '🌙' },
];

export default function PrayerReminderSettings() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('07:00');
  const [sound, setSound] = useState(true);
  const [permission, setPermission] = useState(Notification.permission);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    if (s) {
      setEnabled(s.enabled ?? false);
      setTime(s.time ?? '07:00');
      setSound(s.sound ?? true);
      if (s.enabled && Notification.permission === 'granted') {
        scheduleNotification(s.time, s.sound);
      }
    }
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const handleToggle = async () => {
    if (!enabled) {
      // Enabling — request permission first
      let perm = permission;
      if (perm !== 'granted') {
        perm = await requestPermission();
      }
      if (perm !== 'granted') {
        toast.error('Please allow notifications in your browser to enable reminders.');
        return;
      }
      setEnabled(true);
      const s = { enabled: true, time, sound };
      saveSettings(s);
      scheduleNotification(time, sound);
      toast.success(`Daily prayer reminder set for ${time} ✅`);
    } else {
      setEnabled(false);
      if (window._flPrayerTimer) clearTimeout(window._flPrayerTimer);
      saveSettings({ enabled: false, time, sound });
      toast('Prayer reminder turned off.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    if (enabled) {
      scheduleNotification(time, sound);
    }
    saveSettings({ enabled, time, sound });
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    toast.success('Settings saved!');
  };

  const sendTest = async () => {
    let perm = permission;
    if (perm !== 'granted') perm = await requestPermission();
    if (perm !== 'granted') { toast.error('Notifications not allowed.'); return; }
    new Notification('🙏 Test - FaithLight Prayer Reminder', {
      body: 'This is a test of your daily prayer reminder.',
      icon: '/favicon.ico',
      silent: !sound,
    });
    toast.success('Test notification sent!');
  };

  const [h, m] = time.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const timeDisplay = `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10 flex items-center gap-3">
        <Link to="/NotificationSettings" className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Prayer Reminders
          </h1>
          <p className="text-xs text-gray-400">Schedule daily prayer time notifications</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Permission banner */}
        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
            <Info size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Notifications Blocked</p>
              <p className="text-xs text-red-500 mt-0.5">To receive reminders, please allow notifications in your browser settings for this site.</p>
            </div>
          </div>
        )}

        {/* Toggle card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${enabled ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                {enabled ? <Bell size={22} className="text-indigo-600" /> : <BellOff size={22} className="text-gray-400" />}
              </div>
              <div>
                <p className="font-semibold text-gray-900">Daily Prayer Reminder</p>
                <p className="text-xs text-gray-400">{enabled ? `Active · ${timeDisplay}` : 'Disabled'}</p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
              aria-label="Toggle reminder"
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Time picker */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-indigo-500" />
            <p className="font-semibold text-gray-900">Reminder Time</p>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_TIMES.map(p => (
              <button
                key={p.time}
                onClick={() => setTime(p.time)}
                className={`flex flex-col items-center py-2.5 px-1 rounded-xl border transition-all text-xs font-medium ${
                  time === p.time ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                <span className="text-lg mb-0.5">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom time */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1.5 block">Custom time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* Sound toggle */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sound ? 'bg-green-100' : 'bg-gray-100'}`}>
                {sound ? <Volume2 size={18} className="text-green-600" /> : <VolumeX size={18} className="text-gray-400" />}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Notification Sound</p>
                <p className="text-xs text-gray-400">{sound ? 'Sound enabled' : 'Silent mode'}</p>
              </div>
            </div>
            <button
              onClick={() => setSound(s => !s)}
              className={`relative w-12 h-6 rounded-full transition-colors ${sound ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${sound ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? 'Saving...' : <><CheckCircle size={18} /> Save Settings</>}
          </button>
          <button
            onClick={sendTest}
            className="w-full py-3 border border-gray-200 text-gray-600 rounded-2xl font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Send Test Notification
          </button>
        </div>

        <p className="text-xs text-gray-300 text-center px-4">
          Reminders use your browser's built-in notification system. Keep this tab open or install the app for best results.
        </p>
      </div>
    </div>
  );
}