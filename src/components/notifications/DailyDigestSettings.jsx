import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function DailyDigestSettings({ user }) {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const results = await base44.entities.NotificationPreferences.filter({
        userEmail: user.email
      });
      if (results.length > 0) {
        setPrefs(results[0]);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prefs) return;
    
    try {
      if (prefs.id) {
        await base44.entities.NotificationPreferences.update(prefs.id, prefs);
      } else {
        await base44.entities.NotificationPreferences.create({
          ...prefs,
          userEmail: user.email
        });
      }
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const currentPrefs = prefs || {
    userEmail: user.email,
    verseReminderEnabled: true,
    reminderTimeLocal: '08:00',
    reminderTimezone: 'America/Toronto',
    reminderLanguage: 'en',
    preferredChannel: 'both'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Daily Verse & Reflection</h3>
      
      <div className="flex items-center justify-between">
        <label className="font-medium text-gray-700">Enable daily digest</label>
        <Switch
          checked={currentPrefs.verseReminderEnabled}
          onCheckedChange={(checked) => 
            setPrefs({...currentPrefs, verseReminderEnabled: checked})
          }
        />
      </div>

      {currentPrefs.verseReminderEnabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery method</label>
            <Select value={currentPrefs.preferredChannel || 'both'} onValueChange={(value) =>
              setPrefs({...currentPrefs, preferredChannel: value})
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push notification</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred time (local)</label>
            <Input
              type="time"
              value={currentPrefs.reminderTimeLocal || '08:00'}
              onChange={(e) => 
                setPrefs({...currentPrefs, reminderTimeLocal: e.target.value})
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <Select value={currentPrefs.reminderLanguage || 'en'} onValueChange={(value) =>
              setPrefs({...currentPrefs, reminderLanguage: value})
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="om">Afaan Oromoo</SelectItem>
                <SelectItem value="sw">Swahili</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="am">Amharic</SelectItem>
                <SelectItem value="ti">Tigrinya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <Button 
        onClick={handleSave} 
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        Save Digest Settings
      </Button>
    </div>
  );
}