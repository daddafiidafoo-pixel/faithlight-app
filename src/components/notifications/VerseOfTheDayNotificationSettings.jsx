import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/components/I18nProvider';
import { toast } from 'sonner';

export default function VerseOfTheDayNotificationSettings({ userId }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [requestPermission, setRequestPermission] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['notificationSettings', userId],
    queryFn: async () => {
      const existing = await base44.entities.NotificationSettings.filter({
        user_id: userId,
      });
      return existing[0] || { user_id: userId, verse_of_day_enabled: false, verse_of_day_time: '08:00' };
    },
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      if (settings?.id) {
        return base44.entities.NotificationSettings.update(settings.id, data);
      } else {
        return base44.entities.NotificationSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings', userId] });
      toast.success(t('notifications.saved', 'Settings saved'));
    },
  });

  const handleEnableToggle = async (enabled) => {
    if (enabled && requestPermission) {
      // Request browser notification permission
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          updateMutation.mutate({
            ...settings,
            verse_of_day_enabled: true,
            push_permission_status: 'granted',
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              updateMutation.mutate({
                ...settings,
                verse_of_day_enabled: true,
                push_permission_status: 'granted',
              });
            } else {
              toast.error(t('notifications.permissionDenied', 'Notification permission denied'));
            }
          });
        }
      }
    } else {
      updateMutation.mutate({
        ...settings,
        verse_of_day_enabled: enabled,
      });
    }
  };

  const handleTimeChange = (time) => {
    updateMutation.mutate({
      ...settings,
      verse_of_day_time: time,
    });
  };

  if (isLoading) return <div>{t('common.loading', 'Loading...')}</div>;

  return (
    <div className="space-y-6 bg-white rounded-lg p-6">
      <div>
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-indigo-600" />
          {t('notifications.verseOfDay', 'Verse of the Day')}
        </h3>

        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="font-medium text-gray-900">
                {t('notifications.enable', 'Enable notifications')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {t('notifications.verseDaily', 'Receive a verse daily')}
              </p>
            </div>
            <Switch
              checked={settings?.verse_of_day_enabled || false}
              onCheckedChange={(checked) => {
                setRequestPermission(checked);
                handleEnableToggle(checked);
              }}
            />
          </div>

          {/* Time Picker */}
          {settings?.verse_of_day_enabled && (
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                {t('notifications.deliveryTime', 'Delivery Time')}
              </label>
              <input
                type="time"
                value={settings?.verse_of_day_time || '08:00'}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-indigo-700 mt-2">
                {t('notifications.timezoneNote', 'Notifications will be sent in your timezone')}
              </p>
            </div>
          )}

          {/* Status Info */}
          {settings?.verse_of_day_enabled && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ {t('notifications.active', 'Notifications are active')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
        <p>{t('notifications.info', 'You can change these settings anytime')}</p>
      </div>
    </div>
  );
}