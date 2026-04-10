import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Flame, Bell, BellOff, CheckCircle2, Edit2, Plus, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const GOAL_OPTIONS = [
  { value: 'daily_chapters', label: 'Chapters per Day', period: 'daily', unit: 'chapters' },
  { value: 'weekly_chapters', label: 'Chapters per Week', period: 'weekly', unit: 'chapters' },
  { value: 'daily_verses', label: 'Verses per Day', period: 'daily', unit: 'verses' },
  { value: 'weekly_verses', label: 'Verses per Week', period: 'weekly', unit: 'verses' },
];

function isNewPeriod(goal) {
  if (!goal.period_start) return true;
  const start = new Date(goal.period_start);
  const now = new Date();
  if (goal.period === 'daily') {
    return start.toDateString() !== now.toDateString();
  }
  // Weekly: check if 7 days have passed
  return (now - start) >= 7 * 24 * 60 * 60 * 1000;
}

export default function ReadingGoalWidget({ user, chaptersReadToday = [], versesReadToday = 0 }) {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ goal_type: 'daily_chapters', target: 3, reminder_enabled: true, reminder_time: '08:00' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) loadGoal();
  }, [user?.id]);

  // Auto-update progress when chapters change
  useEffect(() => {
    if (!goal || !user?.id) return;
    updateProgressFromActivity();
  }, [chaptersReadToday.length, versesReadToday]);

  const loadGoal = async () => {
    setLoading(true);
    try {
      const allGoals = await base44.entities.ReadingGoal.filter({ user_id: user.id }, '-created_date', 5).catch(() => []);
      const goals = allGoals.filter(g => g.is_active !== false);
      if (goals.length > 0) {
        let g = goals[0];
        // Reset progress if new period
        if (isNewPeriod(g)) {
          const wasCompleted = g.progress >= g.target;
          g = await base44.entities.ReadingGoal.update(g.id, {
            progress: 0,
            period_start: new Date().toISOString(),
            completed_periods: wasCompleted ? (g.completed_periods || 0) + 1 : g.completed_periods || 0,
            streak: wasCompleted ? (g.streak || 0) + 1 : 0,
          });
        }
        setGoal(g);
        setForm({ goal_type: g.goal_type, target: g.target, reminder_enabled: g.reminder_enabled, reminder_time: g.reminder_time || '08:00' });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateProgressFromActivity = async () => {
    if (!goal) return;
    let progress = 0;
    if (goal.goal_type.includes('chapters')) {
      progress = chaptersReadToday.length;
    } else {
      progress = versesReadToday;
    }
    if (progress !== goal.progress && progress > 0) {
      const updated = await base44.entities.ReadingGoal.update(goal.id, {
        progress,
        last_activity_date: new Date().toISOString(),
      }).catch(() => null);
      if (updated) setGoal(updated);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        user_id: user.id,
        goal_type: form.goal_type,
        target: parseInt(form.target),
        period: form.goal_type.includes('daily') ? 'daily' : 'weekly',
        progress: 0,
        period_start: new Date().toISOString(),
        is_active: true,
        reminder_enabled: form.reminder_enabled,
        reminder_time: form.reminder_time,
        streak: 0,
        completed_periods: 0,
      };
      if (goal) {
        const updated = await base44.entities.ReadingGoal.update(goal.id, data);
        setGoal(updated);
      } else {
        const created = await base44.entities.ReadingGoal.create(data);
        setGoal(created);
      }
      setEditing(false);
      toast.success('Reading goal saved!');
    } catch (e) { toast.error('Failed to save goal'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!goal) return;
    await base44.entities.ReadingGoal.update(goal.id, { is_active: false });
    setGoal(null);
    toast.success('Goal removed');
  };

  const toggleReminder = async () => {
    if (!goal) return;
    const updated = await base44.entities.ReadingGoal.update(goal.id, { reminder_enabled: !goal.reminder_enabled });
    setGoal(updated);
    toast.success(updated.reminder_enabled ? 'Reminders enabled' : 'Reminders paused');
  };

  if (loading) return <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />;

  const optionMeta = GOAL_OPTIONS.find(o => o.value === goal?.goal_type);
  const pct = goal ? Math.min(100, Math.round((goal.progress / goal.target) * 100)) : 0;
  const completed = goal && goal.progress >= goal.target;

  if (!goal || editing) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">{goal ? 'Edit Reading Goal' : 'Set a Reading Goal'}</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Goal Type</label>
            <Select value={form.goal_type} onValueChange={v => setForm(f => ({ ...f, goal_type: v }))}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOAL_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Target ({form.goal_type.includes('chapters') ? 'chapters' : 'verses'})</label>
            <input
              type="number"
              min={1} max={150}
              value={form.target}
              onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Daily Reminder</label>
              <input
                type="time"
                value={form.reminder_time}
                onChange={e => setForm(f => ({ ...f, reminder_time: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Enabled</label>
              <button
                onClick={() => setForm(f => ({ ...f, reminder_enabled: !f.reminder_enabled }))}
                className={`mt-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${form.reminder_enabled ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {form.reminder_enabled ? '🔔 On' : '🔕 Off'}
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm h-9">
              {saving ? 'Saving…' : 'Save Goal'}
            </Button>
            {goal && (
              <Button variant="outline" onClick={() => setEditing(false)} className="text-sm h-9">Cancel</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-5 border shadow-sm ${completed ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {completed ? <Trophy className="w-5 h-5 text-amber-500" /> : <Target className="w-5 h-5 text-indigo-600" />}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{optionMeta?.label}</h3>
            <p className="text-xs text-gray-500">Target: {goal.target} {optionMeta?.unit}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {goal.streak > 0 && (
            <Badge className="bg-orange-100 text-orange-700 border-none text-xs gap-1">
              <Flame className="w-3 h-3" /> {goal.streak}
            </Badge>
          )}
          <button onClick={toggleReminder} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            {goal.reminder_enabled ? <Bell className="w-4 h-4 text-indigo-500" /> : <BellOff className="w-4 h-4 text-gray-400" />}
          </button>
          <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-gray-700">{goal.progress}/{goal.target} {optionMeta?.unit}</span>
        </div>
        <Progress value={pct} className={`h-2.5 ${completed ? '[&>div]:bg-green-500' : '[&>div]:bg-indigo-500'}`} />
      </div>

      {completed ? (
        <div className="flex items-center gap-1.5 mt-2 text-green-700 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" /> Goal completed! Great work 🎉
        </div>
      ) : (
        <p className="text-xs text-gray-500 mt-1">
          {goal.target - goal.progress} more {optionMeta?.unit} to reach your goal
          {goal.reminder_enabled && goal.reminder_time && ` · Reminder at ${goal.reminder_time}`}
        </p>
      )}

      {goal.completed_periods > 0 && (
        <p className="text-xs text-indigo-500 mt-1">✅ Completed {goal.completed_periods} {goal.period} goal{goal.completed_periods > 1 ? 's' : ''}</p>
      )}
    </div>
  );
}