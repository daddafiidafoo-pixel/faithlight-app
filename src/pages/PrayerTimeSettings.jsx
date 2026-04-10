import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bell, BellOff, Clock, Heart, Check, Loader2, Plus, Trash2,
  ChevronRight, ArrowLeft, Sparkles, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FREQUENCIES = [
  { value: 'daily', label: 'Every Day' },
  { value: 'weekdays', label: 'Weekdays Only' },
  { value: 'weekends', label: 'Weekends Only' },
  { value: 'custom', label: 'Custom Days' },
];

const DEFAULT_TIMES = ['06:00', '07:00', '08:00', '09:00', '12:00', '18:00', '20:00', '21:00', '22:00'];

function requestPushPermission() {
  if (!('Notification' in window)) return Promise.resolve('denied');
  if (Notification.permission === 'granted') return Promise.resolve('granted');
  if (Notification.permission === 'denied') return Promise.resolve('denied');
  return Notification.requestPermission();
}

function scheduleBrowserNotification(title, body, delayMs) {
  setTimeout(() => {
    if (Notification.permission === 'granted') {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'faithlight-prayer',
        requireInteraction: true,
      });
      n.onclick = () => { window.focus(); window.location.href = '/PersonalPrayerJournal'; n.close(); };
    }
  }, delayMs);
}

function getMsUntilNextAlarm(timeStr, daysOfWeek) {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  for (let d = 0; d < 8; d++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + d);
    candidate.setHours(h, m, 0, 0);
    if (candidate > now && (daysOfWeek.length === 0 || daysOfWeek.includes(candidate.getDay()))) {
      return candidate.getTime() - now.getTime();
    }
  }
  return null;
}

export default function PrayerTimeSettings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(Notification?.permission || 'default');
  const [reminders, setReminders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState('07:00');
  const [newFreq, setNewFreq] = useState('daily');
  const [newCustomDays, setNewCustomDays] = useState([1, 2, 3, 4, 5]);
  const [newLabel, setNewLabel] = useState('Morning Prayer');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Load saved reminders from user data
      const saved = u.prayer_reminders || [];
      setReminders(saved);
    }).catch(() => {});
  }, []);

  const getEffectiveDays = (freq, custom) => {
    if (freq === 'daily') return [0, 1, 2, 3, 4, 5, 6];
    if (freq === 'weekdays') return [1, 2, 3, 4, 5];
    if (freq === 'weekends') return [0, 6];
    return custom;
  };

  const requestPermission = async () => {
    const result = await requestPushPermission();
    setPermissionStatus(result);
    if (result === 'granted') toast.success('Notifications enabled!');
    else toast.error('Notifications blocked. Please enable them in browser settings.');
  };

  const handleAddReminder = async () => {
    if (!user) return;
    setSaving(true);
    const days = getEffectiveDays(newFreq, newCustomDays);
    const reminder = {
      id: Date.now().toString(),
      time: newTime,
      label: newLabel || 'Prayer Time',
      frequency: newFreq,
      days,
      enabled: true,
    };
    const updated = [...reminders, reminder];
    setReminders(updated);
    try {
      await base44.auth.updateMe({ prayer_reminders: updated });
      // Schedule browser notification for next occurrence
      if (permissionStatus === 'granted') {
        const ms = getMsUntilNextAlarm(newTime, days);
        if (ms !== null) {
          scheduleBrowserNotification(
            `🙏 ${reminder.label}`,
            'Time to pray. Your prayer journal is waiting.',
            ms
          );
        }
      }
      toast.success('Reminder added!');
      setShowAdd(false);
      setNewLabel('Morning Prayer');
      setNewTime('07:00');
      setNewFreq('daily');
    } catch {
      toast.error('Failed to save reminder');
    }
    setSaving(false);
  };

  const handleToggle = async (id) => {
    const updated = reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setReminders(updated);
    await base44.auth.updateMe({ prayer_reminders: updated }).catch(() => {});
  };

  const handleDelete = async (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    await base44.auth.updateMe({ prayer_reminders: updated }).catch(() => {});
    toast.success('Reminder removed');
  };

  // Fetch active prayer requests for preview
  const { data: prayers = [] } = useQuery({
    queryKey: ['prayer-requests-settings', user?.email],
    queryFn: () => base44.entities.PrayerRequest.filter({ userEmail: user.email, status: 'active' }, '-created_date', 5).catch(() => []),
    enabled: !!user?.email,
  });

  const testNotification = () => {
    if (permissionStatus !== 'granted') { toast.error('Enable notifications first'); return; }
    new Notification('🙏 Prayer Time!', {
      body: `You have ${prayers.length} active prayer requests. Take a moment to pray.`,
      icon: '/favicon.ico',
      tag: 'faithlight-test',
      requireInteraction: false,
    });
    toast.success('Test notification sent!');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 py-10 px-4 text-white">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/PersonalPrayerJournal" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Bell className="w-5 h-5" /> Prayer Time Settings
              </h1>
              <p className="text-violet-200 text-xs mt-0.5">Schedule daily prayer reminders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Permission Banner */}
        {permissionStatus !== 'granted' && (
          <Card className={`border-2 ${permissionStatus === 'denied' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${permissionStatus === 'denied' ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {permissionStatus === 'denied' ? 'Notifications Blocked' : 'Enable Notifications'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {permissionStatus === 'denied'
                      ? 'Please enable notifications in your browser settings to receive prayer reminders.'
                      : 'Allow FaithLight to send you prayer reminders directly to your device.'}
                  </p>
                  {permissionStatus !== 'denied' && (
                    <Button onClick={requestPermission} className="mt-3 bg-amber-600 hover:bg-amber-700 gap-2 text-sm h-8">
                      <Bell className="w-3.5 h-3.5" /> Enable Notifications
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {permissionStatus === 'granted' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-3 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Notifications enabled</span>
              </div>
              <button onClick={testNotification} className="text-xs text-green-700 underline">Send test</button>
            </CardContent>
          </Card>
        )}

        {/* Add Reminder */}
        {!showAdd ? (
          <Button onClick={() => setShowAdd(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> Add Prayer Reminder
          </Button>
        ) : (
          <Card className="border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> New Prayer Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Label</Label>
                <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Morning Prayer" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Time</Label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {DEFAULT_TIMES.map(t => (
                    <button key={t} onClick={() => setNewTime(t)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${newTime === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                      {t}
                    </button>
                  ))}
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Frequency</Label>
                <Select value={newFreq} onValueChange={setNewFreq}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {newFreq === 'custom' && (
                <div>
                  <Label className="text-xs text-gray-600">Select Days</Label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {DAYS.map((d, i) => (
                      <button key={i} onClick={() => setNewCustomDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${newCustomDays.includes(i) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button onClick={handleAddReminder} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 flex-1 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Reminder
                </Button>
                <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reminders List */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Reminders ({reminders.length})</p>
          {reminders.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No reminders set yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reminders.map(r => (
                <Card key={r.id} className={`transition-all ${!r.enabled ? 'opacity-50' : ''}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-700 mt-0.5">{r.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{r.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {r.days?.length === 7 ? 'Every day' :
                            r.days?.length === 5 && !r.days.includes(0) ? 'Weekdays' :
                            r.days?.map(d => DAYS[d]).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(r.id)}
                          className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${r.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white transition-transform ${r.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Deep Link Preview */}
        {prayers.length > 0 && (
          <Card className="bg-violet-50 border-violet-100">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> When You Receive a Reminder
              </p>
              <p className="text-xs text-gray-600 mb-3">Tapping the notification will open your Prayer Journal showing these active prayers:</p>
              <div className="space-y-2">
                {prayers.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-violet-100">
                    <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700 truncate">{p.title}</span>
                  </div>
                ))}
              </div>
              <Link to="/PersonalPrayerJournal">
                <Button variant="outline" className="w-full mt-3 text-xs gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50">
                  <Heart className="w-3.5 h-3.5" /> Open Prayer Journal
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}