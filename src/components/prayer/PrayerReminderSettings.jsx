import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function PrayerReminderSettings() {
  const { user } = useAuth();
  const [reminderSettings, setReminderSettings] = useState({
    frequency: 'daily',
    time: '08:00',
    reminderType: 'both', // 'push', 'email', 'both'
    pushEnabled: true,
    emailEnabled: true,
    includeActivePrayers: true,
    activePrayerCount: 3,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadSettings();
    }
  }, [user?.email]);

  const loadSettings = async () => {
    try {
      const response = await base44.functions.invoke('getPrayerReminderSettings', {
        userEmail: user.email,
      });
      if (response.data?.settings) {
        setReminderSettings(response.data.settings);
      }
    } catch (err) {
      console.log('Using default settings');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('setPrayerReminderSettings', {
        userEmail: user.email,
        settings: reminderSettings,
      });
      toast.success('Reminder settings saved!');
    } catch (err) {
      toast.error('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Prayer Reminder Schedule
        </h3>

        <div className="space-y-4">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Frequency
            </label>
            <Select value={reminderSettings.frequency} onValueChange={(val) =>
              setReminderSettings({ ...reminderSettings, frequency: val })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly (Sundays)</SelectItem>
                <SelectItem value="none">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time */}
          {reminderSettings.frequency !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Time
              </label>
              <Input
                type="time"
                value={reminderSettings.time}
                onChange={(e) =>
                  setReminderSettings({ ...reminderSettings, time: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">Sends at {reminderSettings.time} in your timezone</p>
            </div>
          )}

          {/* Reminder Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How to Remind Me
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Push Notification</span>
                </div>
                <Switch
                  checked={reminderSettings.pushEnabled}
                  onCheckedChange={(checked) =>
                    setReminderSettings({ ...reminderSettings, pushEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium">Email Reminder</span>
                </div>
                <Switch
                  checked={reminderSettings.emailEnabled}
                  onCheckedChange={(checked) =>
                    setReminderSettings({ ...reminderSettings, emailEnabled: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Prayer Summary Options */}
          {(reminderSettings.pushEnabled || reminderSettings.emailEnabled) && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Include Active Prayers
                </label>
                <Switch
                  checked={reminderSettings.includeActivePrayers}
                  onCheckedChange={(checked) =>
                    setReminderSettings({
                      ...reminderSettings,
                      includeActivePrayers: checked,
                    })
                  }
                />
              </div>
              {reminderSettings.includeActivePrayers && (
                <div>
                  <label className="block text-xs text-gray-600 mb-2">
                    Number of prayers to include
                  </label>
                  <Select
                    value={String(reminderSettings.activePrayerCount)}
                    onValueChange={(val) =>
                      setReminderSettings({
                        ...reminderSettings,
                        activePrayerCount: parseInt(val),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 prayer</SelectItem>
                      <SelectItem value="3">3 prayers</SelectItem>
                      <SelectItem value="5">5 prayers</SelectItem>
                      <SelectItem value="10">All prayers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Reminder Settings'}
      </Button>
    </div>
  );
}