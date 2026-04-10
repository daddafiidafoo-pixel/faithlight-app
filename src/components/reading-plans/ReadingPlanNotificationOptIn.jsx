import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';

export default function ReadingPlanNotificationOptIn({ planTitle }) {
  const [status, setStatus] = useState('idle'); // idle | requesting | granted | denied | unsupported
  const [time, setTime] = useState('07:00');

  useEffect(() => {
    if (!('Notification' in window)) { setStatus('unsupported'); return; }
    if (Notification.permission === 'granted') setStatus('granted');
    else if (Notification.permission === 'denied') setStatus('denied');
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    setStatus('requesting');
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setStatus('granted');
      // Schedule a demo notification
      setTimeout(() => {
        new Notification('📖 Daily Bible Reading', {
          body: `Time for today's reading in "${planTitle}"!`,
          icon: '/favicon.ico',
        });
      }, 2000);
    } else {
      setStatus('denied');
    }
  };

  if (status === 'unsupported') return null;

  if (status === 'granted') {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
        <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">Notifications on</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-green-600">Daily reminder at</span>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="text-xs border border-green-300 rounded-lg px-2 py-0.5 bg-white text-green-700 focus:outline-none"
            />
          </div>
        </div>
        <button onClick={() => setStatus('idle')} className="text-green-400 hover:text-green-600 p-1">
          <BellOff className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
        <BellOff className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <p className="text-xs text-slate-500">Notifications blocked. Enable them in your browser settings to get daily reminders.</p>
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      disabled={status === 'requesting'}
      className="w-full min-h-[44px] flex items-center gap-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl px-4 py-3 transition-colors text-left"
    >
      <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <Bell className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-indigo-800">
          {status === 'requesting' ? 'Requesting…' : 'Enable daily reminders'}
        </p>
        <p className="text-xs text-indigo-500">Get notified each day to stay on schedule</p>
      </div>
    </button>
  );
}