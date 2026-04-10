import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Circle, Clock, BookOpen, Loader2, ChevronLeft, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function StudyPlanDetails() {
  const params = new URLSearchParams(window.location.search);
  const planId = params.get('id');
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const [dayNote, setDayNote] = useState('');
  const [noteDay, setNoteDay] = useState(null);

  useEffect(() => {
    if (!planId) return;
    const init = async () => {
      setLoading(true);
      const [fetchedPlan, u] = await Promise.all([
        base44.entities.StudyPlanCurated.filter({ id: planId }, null, 1).then(r => r[0]).catch(() => null),
        base44.auth.me().catch(() => null),
      ]);
      setPlan(fetchedPlan);
      setUser(u);
      if (u && fetchedPlan) {
        const prog = await base44.entities.UserStudyPlanProgress.filter({ user_id: u.id, plan_id: planId }, null, 1).then(r => r[0]).catch(() => null);
        setProgress(prog);
        if (prog) setExpandedDay(prog.current_day);
      }
      setLoading(false);
    };
    init();
  }, [planId]);

  const handleStart = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setSaving(true);
    const newProg = await base44.entities.UserStudyPlanProgress.create({
      user_id: user.id,
      plan_id: planId,
      plan_title: plan.title,
      started_at: new Date().toISOString(),
      current_day: 1,
      status: 'active',
      completed_days: [],
      last_opened_at: new Date().toISOString(),
    });
    setProgress(newProg);
    setExpandedDay(1);
    setSaving(false);
    toast.success('Study plan started! 🎉');
  };

  const handleMarkDay = async (dayNumber) => {
    if (!user || !progress) return;
    setSaving(true);
    const newCompleted = [...(progress.completed_days || [])];
    const isCompleted = newCompleted.includes(dayNumber);
    let updated;
    if (isCompleted) {
      updated = newCompleted.filter(d => d !== dayNumber);
    } else {
      updated = [...newCompleted, dayNumber];
    }
    const nextDay = !isCompleted ? Math.max(...updated) + 1 : progress.current_day;
    const allDone = updated.length >= (plan?.duration_days || 0);
    const updatedProgress = await base44.entities.UserStudyPlanProgress.update(progress.id, {
      completed_days: updated,
      current_day: Math.min(nextDay, plan?.duration_days || nextDay),
      status: allDone ? 'completed' : 'active',
      last_opened_at: new Date().toISOString(),
    });
    setProgress(updatedProgress);
    if (!isCompleted) toast.success(`Day ${dayNumber} completed! ✅`);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;
  if (!plan) return <div className="text-center py-20 text-gray-500">Plan not found.</div>;

  const completedCount = progress?.completed_days?.length || 0;
  const progressPct = plan.duration_days ? (completedCount / plan.duration_days) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(createPageUrl('DiscoverStudyPlans'))} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Plans
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {plan.cover_image ? (
            <img src={plan.cover_image} alt={plan.title} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-14 h-14 text-white/60" />
            </div>
          )}
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-indigo-100 text-indigo-700">{plan.difficulty}</Badge>
              <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> {plan.duration_days} days</Badge>
              {plan.tags?.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h1>
            {plan.description && <p className="text-gray-500 text-sm mb-4">{plan.description}</p>}

            {/* Progress bar */}
            {progress && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{completedCount} / {plan.duration_days} days completed</span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <Progress value={progressPct} className="h-2" />
              </div>
            )}

            {/* CTA */}
            {!progress ? (
              <Button onClick={handleStart} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Start This Plan
              </Button>
            ) : progress.status === 'completed' ? (
              <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle className="w-5 h-5" /> Plan Completed!</span>
            ) : (
              <Button onClick={() => setExpandedDay(progress.current_day)} className="bg-indigo-600 hover:bg-indigo-700">
                Continue Day {progress.current_day}
              </Button>
            )}
          </div>
        </div>

        {/* Days */}
        {plan.days?.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">📅 Daily Schedule</h2>
            {plan.days.map(day => {
              const isDone = progress?.completed_days?.includes(day.day_number);
              const isLocked = progress && day.day_number > (progress.current_day);
              const isOpen = expandedDay === day.day_number;
              return (
                <div key={day.day_number} className={`bg-white rounded-xl border transition-all ${isDone ? 'border-green-200' : isOpen ? 'border-indigo-300 shadow-sm' : 'border-gray-100'}`}>
                  <button
                    onClick={() => setExpandedDay(isOpen ? null : day.day_number)}
                    disabled={!progress && day.day_number > 1}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className={`w-5 h-5 flex-shrink-0 ${isLocked ? 'text-gray-300' : 'text-indigo-400'}`} />
                      )}
                      <span className={`font-medium text-sm ${isDone ? 'text-green-700' : isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                        Day {day.day_number}: {day.title}
                      </span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-4">
                      {day.passages?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">📖 Passages</p>
                          <ul className="space-y-1">
                            {day.passages.map((p, i) => (
                              <li key={i} className="text-sm text-indigo-700 bg-indigo-50 rounded-lg px-3 py-1.5">{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {day.tasks?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">✅ Tasks</p>
                          <ul className="space-y-1">
                            {day.tasks.map((t, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-indigo-400">•</span>{t}</li>)}
                          </ul>
                        </div>
                      )}
                      {day.reflection_questions?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">💭 Reflection</p>
                          <ul className="space-y-1">
                            {day.reflection_questions.map((q, i) => <li key={i} className="text-sm text-gray-600 italic">{q}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Note */}
                      {noteDay === day.day_number ? (
                        <div className="space-y-2">
                          <Textarea placeholder="Add your reflection note…" value={dayNote} onChange={e => setDayNote(e.target.value)} className="text-sm" rows={3} />
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setNoteDay(null)}>Cancel</Button>
                            <Button size="sm" className="gap-1"><Save className="w-3 h-3" /> Save Note</Button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setNoteDay(day.day_number)} className="text-xs text-gray-400 hover:text-indigo-600">+ Add note</button>
                      )}

                      {progress && (
                        <Button
                          onClick={() => handleMarkDay(day.day_number)}
                          disabled={saving}
                          variant={isDone ? 'outline' : 'default'}
                          size="sm"
                          className={isDone ? 'border-green-300 text-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}
                        >
                          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                          {isDone ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}