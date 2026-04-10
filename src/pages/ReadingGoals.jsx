import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Target, Plus, Trash2, Bell, BellOff, CheckCircle2, TrendingUp,
  Calendar, BookOpen, Flame, ChevronRight, Edit2, Loader2, X, RefreshCw
} from 'lucide-react';
import ReadingStreakCalendar from '../components/goals/ReadingStreakCalendar';
import MilestoneTracker from '../components/goals/MilestoneTracker';

const GOAL_TYPES = [
  { value: 'daily_chapters', label: 'Chapters per day', unit: 'chapters/day' },
  { value: 'weekly_chapters', label: 'Chapters per week', unit: 'chapters/week' },
  { value: 'daily_verses', label: 'Verses per day', unit: 'verses/day' },
  { value: 'weekly_verses', label: 'Verses per week', unit: 'verses/week' },
];

const REMINDER_TIMES = ['06:00', '07:00', '08:00', '09:00', '12:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

const today = () => new Date().toISOString().split('T')[0];

function getGoalKey(goal) {
  return `reading_goal_${goal.id}`;
}

function loadTodayProgress(goalId) {
  try {
    const raw = localStorage.getItem(`goal_progress_${goalId}_${today()}`);
    return raw ? JSON.parse(raw) : { count: 0 };
  } catch { return { count: 0 }; }
}

function saveTodayProgress(goalId, count) {
  localStorage.setItem(`goal_progress_${goalId}_${today()}`, JSON.stringify({ count }));
}

function loadWeekProgress(goalId) {
  const weekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  })();
  try {
    const raw = localStorage.getItem(`goal_week_${goalId}_${weekStart}`);
    return raw ? JSON.parse(raw) : { count: 0 };
  } catch { return { count: 0 }; }
}

function saveWeekProgress(goalId, count) {
  const weekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  })();
  localStorage.setItem(`goal_week_${goalId}_${weekStart}`, JSON.stringify({ count }));
}

function ProgressRing({ pct, size = 56 }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  const color = pct >= 100 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#6366f1';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="-rotate-90">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  );
}

function GoalCard({ goal, onDelete, onEdit, onAddProgress }) {
  const isDaily = goal.goal_type?.startsWith('daily');
  // Use DB progress field if available, else local storage fallback
  const localProg = isDaily ? loadTodayProgress(goal.id) : loadWeekProgress(goal.id);
  const prog = goal.progress != null ? { count: goal.progress } : localProg;
  const pct = goal.target > 0 ? Math.round((prog.count / goal.target) * 100) : 0;
  const met = pct >= 100;
  const goalLabel = GOAL_TYPES.find(g => g.value === goal.goal_type)?.label || goal.goal_type;

  return (
    <Card className={`border transition-all shadow-sm ${met ? 'border-green-300 bg-green-50/40' : 'border-gray-200 hover:border-indigo-300'}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <ProgressRing pct={pct} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
              style={{ color: pct >= 100 ? '#16a34a' : pct >= 60 ? '#d97706' : '#4f46e5' }}>
              {pct}%
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{goal.title || goalLabel}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {prog.count} / {goal.target} {GOAL_TYPES.find(g => g.value === goal.goal_type)?.unit || ''}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {met && <Badge className="bg-green-100 text-green-700 text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Done!</Badge>}
                {goal.reminder_enabled && <Bell className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className={`h-2 rounded-full transition-all ${met ? 'bg-green-500' : pct >= 60 ? 'bg-amber-400' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            {goal.streak > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 font-medium">
                <Flame className="w-3.5 h-3.5" /> {goal.streak} day streak
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <Button size="sm" onClick={() => onAddProgress(goal)} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 gap-1">
            <Plus className="w-3 h-3" /> Log Progress
          </Button>
          <div className="flex-1" />
          <button onClick={() => onEdit(goal)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(goal.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalModal({ open, onClose, onSave, initial }) {
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState('daily_chapters');
  const [target, setTarget] = useState(3);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setGoalType(initial.goal_type || 'daily_chapters');
      setTarget(initial.target || 3);
      setReminderEnabled(initial.reminder_enabled || false);
      setReminderTime(initial.reminder_time || '08:00');
    } else {
      setTitle('');
      setGoalType('daily_chapters');
      setTarget(3);
      setReminderEnabled(false);
      setReminderTime('08:00');
    }
  }, [initial, open]);

  const handleSave = async () => {
    if (!title.trim() || target < 1) return;
    setSaving(true);
    await onSave({ title: title.trim(), goal_type: goalType, target: Number(target), reminder_enabled: reminderEnabled, reminder_time: reminderTime });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            {initial ? 'Edit Reading Goal' : 'New Reading Goal'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Goal Name</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Daily Chapter Reading" className="text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Goal Type</label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {GOAL_TYPES.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Target ({GOAL_TYPES.find(g => g.value === goalType)?.unit})
            </label>
            <Input type="number" min={1} max={200} value={target} onChange={e => setTarget(e.target.value)} className="text-sm" />
          </div>
          <div className="rounded-lg border border-gray-200 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">Daily Reminder</span>
              </div>
              <button
                onClick={() => setReminderEnabled(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${reminderEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${reminderEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            {reminderEnabled && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Reminder Time</label>
                <Select value={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REMINDER_TIMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1 text-sm" disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm gap-1">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {initial ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LogProgressModal({ open, onClose, goal }) {
  const [amount, setAmount] = useState(1);
  const [saving, setSaving] = useState(false);

  const isDaily = goal?.goal_type?.startsWith('daily');

  const handleLog = async () => {
    if (!goal || amount < 1) return;
    setSaving(true);
    const add = Number(amount);
    if (isDaily) {
      const prev = loadTodayProgress(goal.id);
      saveTodayProgress(goal.id, prev.count + add);
    } else {
      const prev = loadWeekProgress(goal.id);
      saveWeekProgress(goal.id, prev.count + add);
    }
    // Also persist to DB
    const newProgress = (goal.progress || 0) + add;
    await base44.entities.ReadingGoal.update(goal.id, {
      progress: newProgress,
      last_activity_date: new Date().toISOString(),
    }).catch(() => {});
    setSaving(false);
    onClose(true);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Log Progress</DialogTitle>
        </DialogHeader>
        {goal && (
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-600">
              Logging for: <span className="font-semibold text-gray-900">{goal.title}</span>
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                How many {goal.goal_type?.includes('chapters') ? 'chapters' : 'verses'} did you read?
              </label>
              <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} className="text-sm" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onClose(false)} className="flex-1 text-sm">Cancel</Button>
              <Button onClick={handleLog} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm">
                Log {amount} {goal.goal_type?.includes('chapters') ? 'chapter(s)' : 'verse(s)'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ReadingGoals() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [logGoal, setLogGoal] = useState(null);
  const [tick, setTick] = useState(0); // force re-render to refresh progress

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) {
        return base44.auth.me().then(u => {
          setUser(u);
          loadGoals(u.id);
          // Load reading sessions for calendar
          base44.entities.ReadingSession.filter({ user_id: u.id }, '-created_date', 200)
            .then(setSessions).catch(() => {});
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadGoals = async (uid) => {
    setLoading(true);
    const goalData = await base44.entities.ReadingGoal.filter(
      { user_id: uid, is_active: true },
      '-created_date'
    ).catch(() => []);
    setGoals(goalData);
    setLoading(false);
  };

  const handleCreate = async (data) => {
    if (!user) return;
    await base44.entities.ReadingGoal.create({
      user_id: user.id,
      title: data.title,
      goal_type: data.goal_type,
      target: data.target,
      period: data.goal_type.startsWith('daily') ? 'daily' : 'weekly',
      reminder_enabled: data.reminder_enabled,
      reminder_time: data.reminder_time,
      is_active: true,
      streak: 0,
      progress: 0,
    });
    setShowModal(false);
    loadGoals(user.id);
    if (data.reminder_enabled) scheduleReminder(data);
  };

  const handleEdit = async (data) => {
    if (!editGoal) return;
    await base44.entities.ReadingGoal.update(editGoal.id, {
      title: data.title,
      goal_type: data.goal_type,
      target: data.target,
      period: data.goal_type.startsWith('daily') ? 'daily' : 'weekly',
      reminder_enabled: data.reminder_enabled,
      reminder_time: data.reminder_time,
    });
    setEditGoal(null);
    loadGoals(user.id);
  };

  const handleDelete = async (id) => {
    await base44.entities.ReadingGoal.update(id, { is_active: false });
    loadGoals(user.id);
  };

  const scheduleReminder = (goal) => {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          // Store reminder config in localStorage
          const reminders = JSON.parse(localStorage.getItem('reading_reminders') || '[]');
          reminders.push({ title: goal.title, time: goal.reminder_time });
          localStorage.setItem('reading_reminders', JSON.stringify(reminders));
        }
      });
    }
  };

  const totalDailyGoals = goals.filter(g => g.goal_type?.startsWith('daily')).length;
  const totalWeeklyGoals = goals.filter(g => g.goal_type?.startsWith('weekly')).length;
  const completedToday = goals.filter(g => {
    if (!g.goal_type?.startsWith('daily')) return false;
    const prog = g.progress != null ? g.progress : loadTodayProgress(g.id).count;
    return prog >= g.target;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
                <Target className="w-6 h-6 text-white" />
              </div>
              Reading Goals
            </h1>
            <p className="text-gray-500 mt-1">Set daily and weekly Bible reading targets and track your progress.</p>
          </div>
          <Button onClick={() => { setEditGoal(null); setShowModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> New Goal
          </Button>
        </div>

        {/* Streak Calendar */}
        {user && <ReadingStreakCalendar sessions={sessions} />}

        {/* Milestones */}
        {user && <MilestoneTracker user={user} totalChaptersRead={sessions.length} />}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Goals', value: goals.length, icon: <Target className="w-5 h-5 text-indigo-500" />, color: 'text-indigo-700' },
            { label: 'Daily Goals', value: totalDailyGoals, icon: <Calendar className="w-5 h-5 text-blue-500" />, color: 'text-blue-700' },
            { label: 'Weekly Goals', value: totalWeeklyGoals, icon: <TrendingUp className="w-5 h-5 text-purple-500" />, color: 'text-purple-700' },
            { label: 'Completed Today', value: completedToday, icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, color: 'text-green-700' },
          ].map((s, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                {s.icon}
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`font-bold text-xl ${s.color}`}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reminder info */}
        <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
          <Bell className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-900">Reminder Notifications</p>
            <p className="text-xs text-indigo-700 mt-0.5">
              Enable reminders when creating a goal. Your browser will send a notification at the selected time to remind you to read. Make sure to allow notifications when prompted.
            </p>
          </div>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : goals.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 shadow-none">
            <CardContent className="py-16 text-center">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-semibold text-gray-500 text-lg">No reading goals yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-6">Create a goal to start tracking your Bible reading progress.</p>
              <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Plus className="w-4 h-4" /> Create First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-800">Your Goals</h2>
              <button onClick={() => setTick(t => t + 1)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            {goals.map(goal => (
              <GoalCard
                key={goal.id + tick}
                goal={goal}
                onDelete={handleDelete}
                onEdit={g => { setEditGoal(g); setShowModal(true); }}
                onAddProgress={g => setLogGoal(g)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <GoalModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditGoal(null); }}
        onSave={editGoal ? handleEdit : handleCreate}
        initial={editGoal}
      />

      {/* Log Progress Modal */}
      <LogProgressModal
        open={!!logGoal}
        goal={logGoal}
        onClose={(refresh) => { setLogGoal(null); if (refresh) setTick(t => t + 1); }}
      />
    </div>
  );
}