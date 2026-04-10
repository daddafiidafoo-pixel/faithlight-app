import React, { useState, useEffect } from 'react';
import { Bell, Globe, Clock, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'om', label: 'Afaan Oromoo' },
  { code: 'am', label: 'አማርኛ (Amharic)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'fr', label: 'Français' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'ti', label: 'ትግርኛ (Tigrinya)' },
];

const PREF_KEY = 'fl_daily_verse_notif';

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
  } catch { return {}; }
}

export default function DailyVerseLanguageSettings() {
  const [enabled, setEnabled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [time, setTime] = useState('08:00');
  const [saved, setSaved] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs.enabled !== undefined) setEnabled(prefs.enabled);
    if (prefs.language) setLanguage(prefs.language);
    if (prefs.time) setTime(prefs.time);
    setPermissionStatus(Notification?.permission || 'default');
  }, []);

  const handleSave = async () => {
    if (enabled && Notification?.permission !== 'granted') {
      const result = await Notification.requestPermission();
      setPermissionStatus(result);
      if (result !== 'granted') return;
    }
    const prefs = { enabled, language, time };
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);

    // Schedule via service worker if available
    if (enabled && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_DAILY_VERSE',
        payload: prefs,
      });
    }
  };

  const handleTest = () => {
    if (Notification?.permission === 'granted') {
      new Notification('FaithLight Daily Verse 📖', {
        body: `Your ${LANGUAGES.find(l => l.code === language)?.label} verse will arrive at ${time} each day.`,
        icon: '/favicon.ico',
      });
    } else {
      alert('Please enable notifications first and save your preferences.');
    }
  };

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-gray-900">Daily Bible Verse Notification</h3>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">Enable daily verse</p>
          <p className="text-xs text-gray-500">Receive a verse in your language every day</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label="Toggle daily verse notifications"
        />
      </div>

      {enabled && (
        <>
          {/* Language */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 text-indigo-500" /> Language
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 text-indigo-500" /> Preferred time
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {permissionStatus === 'denied' && (
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
              Notifications are blocked in your browser. Please enable them in browser settings.
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Settings'}
            </button>
            <button
              onClick={handleTest}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Test
            </button>
          </div>
        </>
      )}
    </Card>
  );
}