import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, Volume2, Clock, Monitor } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationPreferences({ userId }) {
  const [formData, setFormData] = useState({});

  // Fetch preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', userId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('notificationManager', {
        action: 'getPreferences'
      });
      setFormData(data.preferences);
      return data.preferences;
    },
    enabled: !!userId
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: async (prefs) => {
      const { data } = await base44.functions.invoke('notificationManager', {
        action: 'updatePreferences',
        preferences: prefs
      });
      return data.preferences;
    },
    onSuccess: () => {
      toast.success('Notification preferences updated');
    },
    onError: () => {
      toast.error('Failed to update preferences');
    }
  });

  const handleToggle = (key) => {
    const updated = { ...formData, [key]: !formData[key] };
    setFormData(updated);
    updateMutation.mutate(updated);
  };

  if (isLoading) return <div className="text-gray-600">Loading preferences...</div>;

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Types
        </h3>

        <div className="space-y-4">
          {[
            { key: 'friend_requests_enabled', label: 'Friend Requests', icon: '👥' },
            { key: 'messages_enabled', label: 'Direct Messages', icon: '💬' },
            { key: 'group_messages_enabled', label: 'Group Messages', icon: '👨‍👩‍👦' },
            { key: 'calls_enabled', label: 'Incoming Calls', icon: '📞' },
            { key: 'group_invites_enabled', label: 'Group Invites', icon: '🎫' },
            { key: 'system_announcements_enabled', label: 'System Announcements', icon: '📢' }
          ].map(({ key, label, icon }) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData[key] !== false}
                onChange={() => handleToggle(key)}
                className="w-4 h-4 rounded"
              />
              <span className="text-lg">{icon}</span>
              <span className="flex-1 font-medium text-gray-900">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* General Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Notification Settings
        </h3>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sound_enabled !== false}
              onChange={() => handleToggle('sound_enabled')}
              className="w-4 h-4 rounded"
            />
            <Volume2 className="w-5 h-5 text-gray-600" />
            <span className="flex-1 font-medium text-gray-900">Enable Sound</span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.desktop_enabled !== false}
              onChange={() => handleToggle('desktop_enabled')}
              className="w-4 h-4 rounded"
            />
            <Monitor className="w-5 h-5 text-gray-600" />
            <span className="flex-1 font-medium text-gray-900">Desktop Notifications</span>
          </label>

          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer bg-red-50">
              <input
                type="checkbox"
                checked={formData.mute_all === true}
                onChange={() => handleToggle('mute_all')}
                className="w-4 h-4 rounded"
              />
              <Clock className="w-5 h-5 text-red-600" />
              <span className="flex-1 font-medium text-gray-900">Mute All Notifications</span>
            </label>
            {formData.mute_all && (
              <p className="text-xs text-gray-600 mt-2 ml-10">
                All notifications are currently muted
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Info */}
      <p className="text-xs text-gray-600">
        💡 You can customize these settings anytime to control how you receive notifications.
      </p>
    </div>
  );
}