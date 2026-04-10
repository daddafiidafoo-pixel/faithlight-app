import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Bell, Check } from 'lucide-react';

export default function ReminderSettings({ eventId, onReminderSet }) {
  const [user, setUser] = useState(null);
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    reminder_type: 'both',
    minutes_before: 30,
    is_enabled: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const reminders = await base44.entities.LiveEventReminder.filter({
          event_id: eventId,
          user_id: currentUser.id
        });

        if (reminders && reminders.length > 0) {
          setReminder(reminders[0]);
          setFormData({
            reminder_type: reminders[0].reminder_type || 'both',
            minutes_before: reminders[0].minutes_before || 30,
            is_enabled: reminders[0].is_enabled !== false
          });
        }
      } catch (err) {
        console.error('Error fetching reminder:', err);
        setError('Failed to load reminder settings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError('');

      if (reminder) {
        // Update existing
        await base44.entities.LiveEventReminder.update(reminder.id, formData);
      } else {
        // Create new
        await base44.entities.LiveEventReminder.create({
          event_id: eventId,
          user_id: user.id,
          ...formData
        });
      }

      setSuccess(true);
      onReminderSet?.();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save reminder settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="font-semibold flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Event Reminder
      </h3>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          <Check className="w-4 h-4" />
          Reminder settings saved
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-semibold">Enable Reminders</Label>
          <Switch
            checked={formData.is_enabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
          />
        </div>
      </div>

      {formData.is_enabled && (
        <>
          <div>
            <Label className="text-sm font-semibold">Notify Me</Label>
            <Select value={formData.reminder_type} onValueChange={(value) => setFormData(prev => ({ ...prev, reminder_type: value }))}>
              <SelectTrigger className="mt-1 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">📧 Email</SelectItem>
                <SelectItem value="in_app">🔔 In-App</SelectItem>
                <SelectItem value="both">📧 Email + 🔔 In-App</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Time Before Event</Label>
            <Select value={formData.minutes_before.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, minutes_before: parseInt(value) }))}>
              <SelectTrigger className="mt-1 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="120">2 hours before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}