import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '../../utils';

const TYPE_META = {
  forum_reply:             { emoji: '💬', color: 'bg-indigo-100' },
  thread_reply:            { emoji: '💬', color: 'bg-indigo-100' },
  reaction:                { emoji: '❤️', color: 'bg-pink-100' },
  prayer_request_new:      { emoji: '🙏', color: 'bg-blue-100' },
  prayer_request_answered: { emoji: '🎉', color: 'bg-green-100' },
  friend_request:          { emoji: '👋', color: 'bg-yellow-100' },
  friend_accepted:         { emoji: '🤝', color: 'bg-green-100' },
  message:                 { emoji: '💌', color: 'bg-purple-100' },
  group_invite:            { emoji: '👥', color: 'bg-blue-100' },
  system:                  { emoji: '📢', color: 'bg-gray-100' },
};

export default function NotificationCenter({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifs = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const notifs = await base44.entities.Notification.filter(
        { user_id: userId }, '-updated_date', 50
      );
      setNotifications(notifs || []);
    } catch (_) {}
    setLoading(false);
  };

  // Initial fetch + real-time subscription
  useEffect(() => {
    if (!userId) return;
    fetchNotifs();

    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.user_id !== userId) return;
      if (event.type === 'create') {
        setNotifications(prev => [event.data, ...prev]);
      } else if (event.type === 'update') {
        setNotifications(prev => prev.map(n => n.id === event.id ? event.data : n));
      } else if (event.type === 'delete') {
        setNotifications(prev => prev.filter(n => n.id !== event.id));
      }
    });

    return unsub;
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await base44.entities.Notification.update(id, { is_read: true }).catch(() => {});
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true }).catch(() => {})));
  };

  const dismiss = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await base44.entities.Notification.delete(id).catch(() => {});
  };

  const handleClick = async (notif) => {
    if (!notif.is_read) await markRead(notif.id);
    if (notif.action_url) window.location.href = notif.action_url;
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell */}
      <button
        onClick={() => { setIsOpen(p => !p); if (!isOpen) fetchNotifs(); }}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-indigo-600' : 'text-gray-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-96 max-w-[95vw] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          style={{ animation: 'notifPanelIn 150ms ease-out both' }}
        >
          <style>{`
            @keyframes notifPanelIn {
              from { opacity: 0; transform: scale(0.97) translateY(-4px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-gray-500 text-sm">You're all caught up!</p>
                <p className="text-gray-400 text-xs mt-1">Notifications about replies, reactions, and prayers will appear here.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const meta = TYPE_META[notif.type] || TYPE_META.system;
                const timeAgo = (() => {
                  try { return format(new Date(notif.created_date), 'MMM d, h:mm a'); } catch { return ''; }
                })();
                return (
                  <div
                    key={notif.id}
                    className={`group flex gap-3 px-4 py-3 transition-colors cursor-pointer ${!notif.is_read ? 'bg-indigo-50 hover:bg-indigo-100/70' : 'hover:bg-gray-50'}`}
                    onClick={() => handleClick(notif)}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-full ${meta.color} flex items-center justify-center text-lg flex-shrink-0 mt-0.5`}>
                      {meta.emoji}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                        {notif.title}
                      </p>
                      {notif.content && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.content}</p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1">{timeAgo}</p>
                    </div>

                    {/* Unread dot + dismiss */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {!notif.is_read && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1" />}
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-md"
                        onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                        title="Dismiss"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50 text-center">
              <button
                onClick={() => { setNotifications(prev => prev.filter(n => n.is_read)); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear read notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}