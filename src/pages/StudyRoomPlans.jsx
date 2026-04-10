import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, BookOpen, Check, ArrowLeft, Bell, Flame, ChevronRight, Loader2, Sparkles, RefreshCw, Calendar, Target } from 'lucide-react';

const THEMES = [
  { id: 'faith', label: 'Faith & Trust', emoji: '🙏' },
  { id: 'anxiety', label: 'Overcoming Anxiety', emoji: '🕊️' },
  { id: 'hope', label: 'Hope & Renewal', emoji: '🌅' },
  { id: 'love', label: 'God\'s Love', emoji: '❤️' },
  { id: 'wisdom', label: 'Wisdom', emoji: '📖' },
  { id: 'healing', label: 'Healing', emoji: '🌿' },
  { id: 'strength', label: 'Strength', emoji: '💪' },
  { id: 'peace', label: 'Peace', emoji: '☮️' },
  { id: 'gratitude', label: 'Gratitude', emoji: '🌟' },
  { id: 'forgiveness', label: 'Forgiveness', emoji: '🤍' },
];

const DURATIONS = [7, 14, 21, 30];

function PlanCard({ plan, progress, onView }) {
  const completedDays = progress?.completed_days?.length || 0;
  const totalDays = plan.duration_days || 7;
  const pct = Math.round((completedDays / totalDays) * 100);
  const streak = calcStreak(progress?.completed_days || []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: '#EDE9FE' }}>
            {plan.emoji || '📖'}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{plan.title}</p>
            <p className="text-xs text-gray-500">{totalDays} days • {plan.topic}</p>
          </div>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-600">{streak}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{completedDays}/{totalDays} days</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <button onClick={() => onView(plan, progress)}
        className="w-full py-2.5 rounded-xl bg-purple-50 text-purple-700 text-sm font-semibold flex items-center justify-center gap-2">
        Continue Reading <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function calcStreak(completedDays) {
  if (!completedDays?.length) return 0;
  const sorted = [...completedDays].sort((a, b) => b - a);
  let streak = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 || sorted[i - 1] - sorted[i] === 1) streak++;
    else break;
  }
  return streak;
}

function GeneratePlanModal({ onClose, onGenerated, currentUser }) {
  const [theme, setTheme] = useState(THEMES[0]);
  const [duration, setDuration] = useState(7);
  const [generating, setGenerating] = useState(false);
  const [reminders, setReminders] = useState(true);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a ${duration}-day Bible reading plan focused on the theme: "${theme.label}".
Return a JSON object with:
- title: string (catchy plan title)
- description: string (1-2 sentences)  
- readings: array of ${duration} objects, each with { day: number, book_id: string (3-letter Bible book code like JHN, PSA, ROM), book_name: string, chapter: number, reference: string }

Use a variety of Old and New Testament books that genuinely address this theme.
Only use valid Bible books and realistic chapter numbers.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            readings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  book_id: { type: 'string' },
                  book_name: { type: 'string' },
                  chapter: { type: 'number' },
                  reference: { type: 'string' },
                }
              }
            }
          }
        }
      });

      const plan = await base44.entities.TopicalReadingPlan.create({
        title: result.title || `${theme.label} — ${duration} Days`,
        topic: theme.id,
        description: result.description || '',
        emoji: theme.emoji,
        duration_days: duration,
        readings: result.readings || [],
        is_active: true,
      });

      if (currentUser?.email) {
        await base44.entities.UserReadingPlanProgress.create({
          user_email: currentUser.email,
          plan_id: plan.id,
          plan_title: plan.title,
          plan_topic: plan.topic,
          plan_emoji: plan.emoji,
          plan_duration_days: duration,
          completed_days: [],
          started_at: new Date().toISOString(),
          is_completed: false,
        });
      }

      onGenerated(plan);
    } catch (e) {
      console.error('Plan generation failed', e);
    }
    setGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mt-3 mb-5" />
        <div className="px-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Generate Reading Plan</h2>
          <p className="text-sm text-gray-500 mb-5">AI creates a personalized plan just for you</p>

          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Choose a Theme</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${theme.id === t.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Duration</p>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {DURATIONS.map(d => (
              <button key={d} onClick={() => setDuration(d)}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${duration === d ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                {d}d
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-5 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Daily reminders</span>
            </div>
            <button onClick={() => setReminders(v => !v)}
              className={`w-11 h-6 rounded-full transition-all ${reminders ? 'bg-purple-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${reminders ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <button onClick={handleGenerate} disabled={generating}
            className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60">
            {generating ? <><RefreshCw className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate Plan</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanDetailView({ plan, progress, onBack, onDayComplete }) {
  const completedDays = progress?.completed_days || [];
  const readings = plan.readings || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900 truncate">{plan.title}</h1>
          <p className="text-xs text-gray-500">{completedDays.length}/{plan.duration_days} days complete</p>
        </div>
        <div className="text-2xl">{plan.emoji || '📖'}</div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Progress</span>
            <span>{Math.round((completedDays.length / plan.duration_days) * 100)}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100">
            <div className="h-3 rounded-full bg-purple-500 transition-all"
              style={{ width: `${(completedDays.length / plan.duration_days) * 100}%` }} />
          </div>
          {plan.description && <p className="text-sm text-gray-500 mt-3">{plan.description}</p>}
        </div>

        {/* Daily readings */}
        <div className="space-y-2">
          {readings.map((reading, idx) => {
            const dayNum = reading.day || idx + 1;
            const done = completedDays.includes(dayNum);
            return (
              <div key={dayNum} className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${done ? 'border-green-200 bg-green-50' : 'border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {done ? <Check className="w-4 h-4" /> : dayNum}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{reading.reference || `${reading.book_name} ${reading.chapter}`}</p>
                    <p className="text-xs text-gray-500">Day {dayNum}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/BibleReaderPage?book_id=${reading.book_id}&chapter=${reading.chapter}`}
                      className="px-3 py-2 rounded-xl bg-purple-100 text-purple-700 text-xs font-semibold">
                      Read
                    </a>
                    {!done && (
                      <button onClick={() => onDayComplete(dayNum, progress)}
                        className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold">
                        Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function StudyRoomPlans() {
  const [currentUser, setCurrentUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [viewingPlan, setViewingPlan] = useState(null);
  const [viewingProgress, setViewingProgress] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const loadPlans = async (user) => {
    setLoading(true);
    try {
      if (user?.email) {
        const progresses = await base44.entities.UserReadingPlanProgress.filter(
          { user_email: user.email, is_completed: false }, '-started_at', 20
        );
        const planIds = [...new Set(progresses.map(p => p.plan_id))];
        const fetchedPlans = await Promise.all(
          planIds.map(id => base44.entities.TopicalReadingPlan.filter({ id }, null, 1).then(r => r[0]).catch(() => null))
        );
        const validPlans = fetchedPlans.filter(Boolean);
        setPlans(validPlans);
        const pm = {};
        progresses.forEach(p => { pm[p.plan_id] = p; });
        setProgressMap(pm);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { if (currentUser !== null) loadPlans(currentUser); }, [currentUser]);

  const handleDayComplete = async (dayNum, prog) => {
    if (!prog?.id) return;
    const current = prog.completed_days || [];
    if (current.includes(dayNum)) return;
    const updated = [...current, dayNum];
    const isComplete = updated.length >= (prog.plan_duration_days || 7);
    await base44.entities.UserReadingPlanProgress.update(prog.id, {
      completed_days: updated,
      last_read_at: new Date().toISOString(),
      is_completed: isComplete,
    });
    setProgressMap(prev => ({
      ...prev,
      [prog.plan_id]: { ...prog, completed_days: updated, is_completed: isComplete }
    }));
    if (viewingProgress?.id === prog.id) {
      setViewingProgress(prev => ({ ...prev, completed_days: updated }));
    }
  };

  const handleGenerated = (plan) => {
    setShowGenerate(false);
    loadPlans(currentUser);
  };

  if (viewingPlan) {
    return (
      <PlanDetailView
        plan={viewingPlan}
        progress={viewingProgress}
        onBack={() => { setViewingPlan(null); setViewingProgress(null); }}
        onDayComplete={(dayNum) => handleDayComplete(dayNum, viewingProgress)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Study Room</h1>
          <p className="text-xs text-gray-500">AI-powered reading plans with progress tracking</p>
        </div>
        <button onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { IconComp: BookOpen, label: 'Active Plans', value: plans.length, color: '#8B5CF6', bg: '#EDE9FE' },
            { IconComp: Check, label: 'Days Done', value: Object.values(progressMap).reduce((s, p) => s + (p.completed_days?.length || 0), 0), color: '#16A34A', bg: '#DCFCE7' },
            { IconComp: Flame, label: 'Best Streak', value: Math.max(0, ...Object.values(progressMap).map(p => calcStreak(p.completed_days || []))), color: '#EA580C', bg: '#FEF3C7' },
          ].map(({ IconComp, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1" style={{ backgroundColor: bg }}>
                <IconComp className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}

        {!loading && plans.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No reading plans yet</h2>
            <p className="text-sm text-gray-500 mb-5">Generate a personalized AI reading plan based on any theme or topic</p>
            <button onClick={() => setShowGenerate(true)}
              className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-semibold flex items-center gap-2 mx-auto">
              <Sparkles className="w-4 h-4" /> Generate My First Plan
            </button>
          </div>
        )}

        {!loading && plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            progress={progressMap[plan.id]}
            onView={(p, prog) => { setViewingPlan(p); setViewingProgress(prog); }}
          />
        ))}
      </div>

      {showGenerate && (
        <GeneratePlanModal
          onClose={() => setShowGenerate(false)}
          onGenerated={handleGenerated}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}