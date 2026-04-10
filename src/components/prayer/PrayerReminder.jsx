import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, X, Clock } from 'lucide-react';
import { toast } from 'sonner';

const REMINDERS_KEY = 'fl_prayer_reminders';

function loadReminders() {
  return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]');
}
function saveReminders(r) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(r));
}

// ─── Global reminder checker (mount once in the main page) ───
export function PrayerReminderChecker() {
  const shownRef = useRef(new Set());

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const reminders = loadReminders();
      const updated = reminders.map(r => {
        if (r.fired || shownRef.current.has(r.id)) return r;
        if (now >= new Date(r.remindAt).getTime()) {
          shownRef.current.add(r.id);
          // Try browser notification first, fallback to toast
          if (Notification.permission === 'granted') {
            new Notification('🙏 Prayer Reminder', {
              body: r.title,
              icon: '/favicon.ico',
            });
          } else {
            toast(`🙏 Time to pray: ${r.title}`, { duration: 8000 });
          }
          return { ...r, fired: true };
        }
        return r;
      });
      // Only write if something changed
      if (updated.some(r => r.fired && !reminders.find(o => o.id === r.id)?.fired)) {
        saveReminders(updated);
      }
    };

    check();
    const interval = setInterval(check, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  return null;
}

// ─── Per-post reminder button + modal ───
export default function PrayerReminder({ postId, postTitle }) {
  const [reminders, setReminders] = useState(loadReminders);
  const [showModal, setShowModal] = useState(false);
  const [time, setTime] = useState('');

  const existing = reminders.find(r => r.postId === postId && !r.fired);

  const requestNotifPermission = async () => {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      return result;
    }
    return 'denied';
  };

  const setReminder = async () => {
    if (!time) { toast.error('Please select a time'); return; }

    const remindAt = new Date(time).toISOString();
    if (new Date(time) <= new Date()) { toast.error('Please pick a future time'); return; }

    await requestNotifPermission();

    const reminder = {
      id: `reminder_${Date.now()}`,
      postId,
      title: postTitle,
      remindAt,
      fired: false,
      createdAt: new Date().toISOString(),
    };

    // Remove any old reminder for this post first
    const updated = [...reminders.filter(r => r.postId !== postId || r.fired), reminder];
    saveReminders(updated);
    setReminders(updated);
    toast.success('Reminder set! 🔔');
    setShowModal(false);
    setTime('');
  };

  const clearReminder = () => {
    const updated = reminders.filter(r => r.postId !== postId || r.fired);
    saveReminders(updated);
    setReminders(updated);
    toast('Reminder cleared');
  };

  // Min datetime = now + 1 minute
  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <>
      <button
        onClick={() => existing ? clearReminder() : setShowModal(true)}
        aria-label={existing ? 'Clear prayer reminder' : 'Set prayer reminder'}
        title={existing ? `Reminder set for ${new Date(existing.remindAt).toLocaleString()}` : 'Set prayer reminder'}
        className={`h-11 w-11 p-2 rounded-lg flex items-center justify-center transition-colors ${
          existing
            ? 'text-indigo-600 bg-indigo-50 hover:bg-red-50 hover:text-red-500'
            : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'
        }`}
      >
        {existing ? <Bell size={15} fill="currentColor" /> : <Bell size={15} />}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" /> Set Prayer Reminder
              </h2>
              <button onClick={() => setShowModal(false)} aria-label="Close" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 line-clamp-2">"{postTitle}"</p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Remind me at</label>
              <input
                type="datetime-local"
                value={time}
                min={minDateTime}
                onChange={e => setTime(e.target.value)}
                className="w-full min-h-[44px] border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            {Notification.permission === 'denied' && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                Browser notifications are blocked. You'll get a toast alert instead.
              </p>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 min-h-[44px] rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm">Cancel</button>
              <button
                onClick={setReminder}
                className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Bell size={13} /> Set Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}