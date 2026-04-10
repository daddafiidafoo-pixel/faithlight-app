import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bell, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const NOTIFICATION_SETTINGS = [
  {
    id: 'forum_new_reply',
    label: 'New Reply to My Topics',
    description: 'Get notified when someone replies to a topic you created',
    category: 'Forum',
  },
  {
    id: 'forum_mention',
    label: 'Mentions in Forum',
    description: 'Get notified when someone mentions you in a forum post',
    category: 'Forum',
  },
  {
    id: 'event_created',
    label: 'New Group Events',
    description: 'Get notified when a new event is created in your groups',
    category: 'Events',
  },
  {
    id: 'event_reminder',
    label: 'Event Reminders',
    description: 'Get reminded 24 hours before events you RSVP to',
    category: 'Events',
  },
  {
    id: 'group_announcement',
    label: 'Group Announcements',
    description: 'Get notified of important announcements in your groups',
    category: 'Groups',
  },
  {
    id: 'friend_request',
    label: 'Friend Requests',
    description: 'Get notified when someone sends you a friend request',
    category: 'Social',
  },
];

export default function NotificationPreferences({ user }) {
  const [settings, setSettings] = useState({
    forum_new_reply: user?.notify_forum_reply !== false,
    forum_mention: user?.notify_forum_mention !== false,
    event_created: user?.notify_event_created !== false,
    event_reminder: user?.notify_event_reminder !== false,
    group_announcement: user?.notify_group_announcement !== false,
    friend_request: user?.notify_friend_request !== false,
  });

  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (newSettings) => {
      await base44.auth.updateMe({
        notify_forum_reply: newSettings.forum_new_reply,
        notify_forum_mention: newSettings.forum_mention,
        notify_event_created: newSettings.event_created,
        notify_event_reminder: newSettings.event_reminder,
        notify_group_announcement: newSettings.group_announcement,
        notify_friend_request: newSettings.friend_request,
      });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const groupedSettings = {
    'Forum': NOTIFICATION_SETTINGS.filter(s => s.category === 'Forum'),
    'Events': NOTIFICATION_SETTINGS.filter(s => s.category === 'Events'),
    'Groups': NOTIFICATION_SETTINGS.filter(s => s.category === 'Groups'),
    'Social': NOTIFICATION_SETTINGS.filter(s => s.category === 'Social'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedSettings).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">{category}</h3>
            <div className="space-y-3">
              {items.map(setting => (
                <div key={setting.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    id={setting.id}
                    checked={settings[setting.id]}
                    onChange={() => handleToggle(setting.id)}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-indigo-600 cursor-pointer"
                  />
                  <label htmlFor={setting.id} className="flex-1 cursor-pointer">
                    <p className="font-medium text-sm text-gray-900">{setting.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{setting.description}</p>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="border-t pt-6 flex items-center justify-between">
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}