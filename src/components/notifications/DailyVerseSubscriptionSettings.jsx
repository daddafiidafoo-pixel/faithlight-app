import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, CheckCircle2, Loader2, Sun, Moon, Sunset } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const TIME_OPTIONS = [
  { label: 'Early Morning', time: '06:00', icon: '🌅', desc: '6:00 AM — Start your day with Scripture' },
  { label: 'Morning', time: '08:00', icon: '☀️', desc: '8:00 AM — Morning devotion time' },
  { label: 'Midday', time: '12:00', icon: '🌤️', desc: '12:00 PM — Midday reflection' },
  { label: 'Afternoon', time: '15:00', icon: '🌇', desc: '3:00 PM — Afternoon encouragement' },
  { label: 'Evening', time: '19:00', icon: '🌆', desc: '7:00 PM — Evening meditation' },
  { label: 'Night', time: '21:00', icon: '🌙', desc: '9:00 PM — Before you sleep' },
];

const PREF_KEY = 'fl_daily_verse_notif';

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) || 'null'); } catch { return null; }
}

export default function DailyVerseSubscriptionSettings({ userEmail }) {
  const [enabled, setEnabled] = useState(false);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs) {
      setEnabled(prefs.enabled ?? false);
      setSelectedTime(prefs.time ?? '08:00');
    }
  }, []);

  const save = async (newEnabled, newTime) => {
    setSaving(true);
    setSaved(false);
    const prefs = { enabled: newEnabled, time: newTime, userEmail };
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    try {
      // Persist to UserSession entity via auth.updateMe
      await base44.auth.updateMe({
        dailyDevotionEnabled: newEnabled,
        dailyDevotionTime: newTime,
      });
      setSaved(true);
      toast.success(newEnabled
        ? `Daily verse scheduled at ${TIME_OPTIONS.find(t => t.time === newTime)?.label || newTime}!`
        : 'Daily verse notifications turned off.'
      );
    } catch {
      toast.error('Could not save preferences. They are saved locally.');
      setSaved(true);
    }
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleToggle = (val) => {
    setEnabled(val);
    save(val, selectedTime);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    if (enabled) save(enabled, time);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-purple-100' : 'bg-gray-100'}`}>
            {enabled ? <Bell className="w-5 h-5 text-purple-600" /> : <BellOff className="w-5 h-5 text-gray-400" />}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Daily Bible Verse</p>
            <p className="text-xs text-gray-500">{enabled ? `Delivers at ${TIME_OPTIONS.find(t => t.time === selectedTime)?.label || selectedTime}` : 'Notifications off'}</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>

      {/* Time picker */}
      {enabled && (
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Delivery Time
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.time}
                onClick={() => handleTimeSelect(opt.time)}
                className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                  selectedTime === opt.time
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'
                }`}
              >
                <span className="text-lg leading-none mt-0.5">{opt.icon}</span>
                <div>
                  <p className={`text-xs font-bold ${selectedTime === opt.time ? 'text-purple-700' : 'text-gray-700'}`}>{opt.label}</p>
                  <p className={`text-xs ${selectedTime === opt.time ? 'text-purple-500' : 'text-gray-400'}`}>{opt.desc.split(' — ')[0]}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Save status */}
          <div className="mt-3 flex items-center justify-end gap-2">
            {saving && <span className="text-xs text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span>}
            {saved && !saving && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Saved!</span>}
          </div>
        </div>
      )}

      {!enabled && (
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400">Enable to receive a fresh Bible verse delivered at your preferred time each day.</p>
        </div>
      )}
    </div>
  );
}