import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function NotificationBell({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch unread notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      return base44.entities.Notification.filter(
        { user_id: userId, is_read: false },
        '-created_date',
        50
      );
    },
    enabled: !!userId,
    refetchInterval: 5000
  });

  // Subscribe to new notifications
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.data.user_id === userId && event.type === 'create') {
        queryClient.invalidateQueries(['notifications']);
      }
    });

    return unsubscribe;
  }, [userId, queryClient]);

  // Mark as read
  const markReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.functions.invoke('notificationManager', {
        action: 'markAsRead',
        notificationId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.functions.invoke('notificationManager', {
        action: 'deleteNotification',
        notificationId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('notificationManager', {
        action: 'markAllAsRead'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const getNotificationIcon = (type) => {
    const icons = {
      'friend_request': '👥',
      'friend_accepted': '✅',
      'message': '💬',
      'group_message': '👨‍👩‍👦',
      'call_incoming': '📞',
      'group_invite': '🎫',
      'system': '📢'
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="relative text-gray-600 hover:bg-gray-100"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full" />
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications ({notifications.length})</h3>
            {notifications.length > 0 && (
              <Button
                onClick={() => markAllReadMutation.mutate()}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notif.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(notif.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {notif.action_url && (
                        <Button
                          onClick={() => {
                            window.location.href = notif.action_url;
                            setIsOpen(false);
                          }}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-indigo-600 hover:bg-indigo-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteNotificationMutation.mutate(notif.id)}
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}