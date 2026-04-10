import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, X, Check, Trash2, Loader2, MessageCircle, AtSign, Megaphone, Shield } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_CONFIG = {
  REPLY:               { icon: MessageCircle, color: 'text-indigo-500', label: 'Reply' },
  MENTION:             { icon: AtSign,        color: 'text-purple-500', label: 'Mention' },
  ADMIN_ANNOUNCEMENT:  { icon: Megaphone,     color: 'text-amber-500',  label: 'Announcement' },
  MODERATION:          { icon: Shield,        color: 'text-red-500',    label: 'Moderation' },
};

const TABS = [
  { id: 'ALL',   label: 'All' },
  { id: 'REPLY', label: 'Replies' },
  { id: 'MENTION', label: 'Mentions' },
  { id: 'ADMIN_ANNOUNCEMENT', label: 'Announcements' },
];

export default function NotificationCenter({ userId }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('ALL');

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const result = await base44.entities.AppNotification.filter({ user_id: userId }, '-created_date', 50).catch(() => []);
    setNotifications(result || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!open || !userId) return;
    fetchNotifications();

    const unsubscribe = base44.entities.AppNotification.subscribe((event) => {
      if (event.data?.user_id !== userId) return;
      if (event.type === 'create') {
        setNotifications(prev => [event.data, ...prev]);
      } else if (event.type === 'update') {
        setNotifications(prev => prev.map(n => n.id === event.id ? event.data : n));
      } else if (event.type === 'delete') {
        setNotifications(prev => prev.filter(n => n.id !== event.id));
      }
    });
    return unsubscribe;
  }, [open, userId, fetchNotifications]);

  const markAsRead = async (id) => {
    await base44.entities.AppNotification.update(id, { is_read: true, read_at: new Date().toISOString() }).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.AppNotification.update(n.id, { is_read: true }).catch(() => {})));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (id) => {
    await base44.entities.AppNotification.delete(id).catch(() => {});
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClick = async (n) => {
    if (!n.is_read) await markAsRead(n.id);
    if (n.action_url) window.location.href = n.action_url;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const displayed = tab === 'ALL'
    ? notifications
    : notifications.filter(n => n.notification_type === tab || n.type === tab);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between bg-white rounded-t-xl">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{unreadCount} new</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline px-2 py-1">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b overflow-x-auto">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === t.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t.label}
                  {t.id !== 'ALL' && notifications.filter(n => (n.notification_type === t.id || n.type === t.id) && !n.is_read).length > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-[9px] rounded-full px-1">
                      {notifications.filter(n => (n.notification_type === t.id || n.type === t.id) && !n.is_read).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
              )}
              {!loading && displayed.length === 0 && (
                <div className="py-12 text-center">
                  <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No notifications</p>
                </div>
              )}
              {!loading && displayed.map(n => {
                const cfg = TYPE_CONFIG[n.notification_type || n.type] || TYPE_CONFIG.ADMIN_ANNOUNCEMENT;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${!n.is_read ? 'bg-indigo-50/40' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {format(new Date(n.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={e => { e.stopPropagation(); markAsRead(n.id); }}
                          className="p-1 text-gray-300 hover:text-green-500 rounded transition-colors"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                        className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}