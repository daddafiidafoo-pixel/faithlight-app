import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Bell, CheckCircle2, Calendar, FileText, MessageSquare, Users, Trash2 } from 'lucide-react';

export default function GroupNotificationCenter({ userId, groupId, isOpen, onClose }) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['group-notifications', userId, groupId],
    queryFn: async () => {
      return await base44.entities.GroupNotification.filter(
        { user_id: userId, group_id: groupId },
        '-created_date',
        50
      );
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      return base44.entities.GroupNotification.update(notificationId, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-notifications', userId, groupId]);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      return base44.entities.GroupNotification.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-notifications', userId, groupId]);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      return Promise.all(
        unreadNotifications.map(n => 
          base44.entities.GroupNotification.update(n.id, { is_read: true })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-notifications', userId, groupId]);
    },
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'meeting_scheduled':
      case 'meeting_reminder':
        return <Calendar className="w-4 h-4" />;
      case 'file_shared':
        return <FileText className="w-4 h-4" />;
      case 'thread_created':
      case 'thread_reply':
        return <MessageSquare className="w-4 h-4" />;
      case 'member_joined':
        return <Users className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'meeting_scheduled':
      case 'meeting_reminder':
        return 'bg-blue-50 border-blue-200';
      case 'file_shared':
        return 'bg-green-50 border-green-200';
      case 'thread_created':
      case 'thread_reply':
        return 'bg-purple-50 border-purple-200';
      case 'member_joined':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleNotificationClick = (notification) => {
    markAsReadMutation.mutate(notification.id);
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle>Group Notifications</DialogTitle>
              {unreadCount > 0 && <Badge className="bg-red-500">{unreadCount}</Badge>}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  getNotificationColor(notification.notification_type)
                } ${!notification.is_read ? 'border-l-4' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1 flex-shrink-0 text-gray-600">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(new Date(notification.created_date))}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotificationMutation.mutate(notification.id);
                    }}
                    className="h-7 w-7 flex-shrink-0 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}