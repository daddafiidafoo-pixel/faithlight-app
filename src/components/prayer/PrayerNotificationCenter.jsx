import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Heart, Check, X, ChevronDown } from 'lucide-react';

const STORAGE_KEY = 'fl_prayer_notifications';

export function addPrayerNotification(notification) {
  const existing = getPrayerNotifications();
  const updated = [{ ...notification, id: Date.now(), read: false, createdAt: new Date().toISOString() }, ...existing].slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  // Dispatch custom event so the bell can update live
  window.dispatchEvent(new CustomEvent('fl_prayer_notif'));
}

export function getPrayerNotifications() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function markAllRead() {
  const all = getPrayerNotifications().map(n => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export default function PrayerNotificationCenter({ currentEmail }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const refresh = () => setNotifications(getPrayerNotifications().filter(n => n.forEmail === currentEmail));

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('fl_prayer_notif', handler);
    return () => window.removeEventListener('fl_prayer_notif', handler);
  }, [currentEmail]);

  const unread = notifications.filter(n => !n.read).length;

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) {
      // Mark all as read when panel opens
      const all = getPrayerNotifications().map(n =>
        n.forEmail === currentEmail ? { ...n, read: true } : n
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      refresh();
    }
  };

  const clearAll = () => {
    const remaining = getPrayerNotifications().filter(n => n.forEmail !== currentEmail);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    refresh();
    setOpen(false);
  };

  if (!currentEmail) return null;

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        className="relative p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-white border border-gray-200 hover:border-indigo-300 text-gray-500 hover:text-indigo-600 transition-all flex items-center justify-center"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-bold text-gray-900 text-sm">Prayer Notifications</span>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 min-h-[32px]">Clear all</button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Close" className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <BellOff size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(n => (
                  <div key={n.id} className={`flex gap-3 px-4 py-3 ${!n.read ? 'bg-indigo-50/40' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      n.type === 'prayed' ? 'bg-rose-100' : 'bg-green-100'
                    }`}>
                      {n.type === 'prayed' ? (
                        <Heart size={14} className="text-rose-500" fill="currentColor" />
                      ) : (
                        <Check size={14} className="text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}