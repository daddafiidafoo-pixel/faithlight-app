import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, BookOpen, CheckCircle2, Circle, ChevronDown, ChevronUp, Bell, Plus, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GOAL_PRESETS = [
  { label: '😟 Overcoming anxiety', value: 'overcoming anxiety and finding peace in God' },
  { label: '💪 Building faith', value: 'strengthening and growing in faith' },
  { label: '❤️ Learning to love', value: 'understanding God\'s love and loving others' },
  { label: '🙏 Deepening prayer', value: 'developing a richer, more consistent prayer life' },
  { label: '📖 New Testament', value: 'reading through the key books of the New Testament' },
  { label: '🌿 God\'s promises', value: 'discovering and claiming God\'s promises in scripture' },
  { label: '🔥 Spiritual growth', value: 'overall spiritual growth and discipleship' },
];

export default function CustomReadingPlanGenerator() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [goal, setGoal] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const [activeTab, setActiveTab] = useState('my-plans');

  const { data: plans = [], isLoading, refetch } = useQuery({
    queryKey: ['customReadingPlans', user?.email],
    queryFn: () => base44.entities.CustomReadingPlan.filter({ userEmail: user.email }),
    enabled: isAuthenticated && !!user?.email
  });

  const [activePlan, setActivePlan] = useState(null);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setGenerating(true);
    try {
      const resp = await base44.functions.invoke('generateCustomReadingPlan', { goal, durationDays });
      if (resp.data?.success) {
        refetch();
        setActiveTab('my-plans');
        setActivePlan(resp.data.plan);
      }
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleDay = async (plan, dayIndex) => {
    const updatedDays = plan.days.map((d, i) => {
      if (i === dayIndex) {
        return { ...d, completed: !d.completed, completedAt: !d.completed ? new Date().toISOString() : null };
      }
      return d;
    });
    const completedCount = updatedDays.filter(d => d.completed).length;
    await base44.entities.CustomReadingPlan.update(plan.id, {
      days: updatedDays,
      currentDay: Math.min(completedCount + 1, plan.durationDays)
    });
    refetch();
  };

  const progress = (plan) => {
    if (!plan?.days?.length) return 0;
    return Math.round((plan.days.filter(d => d.completed).length / plan.days.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-20">
        <h1 className="text-2xl font-bold text-slate-900">Reading Plans</h1>
        <p className="text-sm text-slate-500">AI-generated plans tailored to your goals</p>

        <div className="flex gap-4 mt-4 border-b border-slate-200">
          {['my-plans', 'create'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-semibold text-sm transition-colors capitalize ${activeTab === tab ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {tab === 'my-plans' ? `My Plans (${plans.length})` : '✨ Generate New'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="font-bold text-slate-900 text-lg">AI Reading Plan Generator</h2>
              </div>
              <p className="text-sm text-slate-600">Tell us your spiritual goal and we'll create a personalized daily reading plan just for you.</p>
            </div>

            {/* Goal presets */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-3">Choose a goal or type your own</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {GOAL_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => setGoal(preset.value)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${goal === preset.value ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-purple-300 text-slate-700'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="Or describe your own goal..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-3">Plan Duration</label>
              <div className="flex gap-3">
                {[7, 14, 30, 60].map(d => (
                  <button
                    key={d}
                    onClick={() => setDurationDays(d)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${durationDays === d ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 text-slate-700 hover:border-purple-300'}`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!goal.trim() || generating || !isAuthenticated}
              className="w-full py-3 text-base"
            >
              {generating ? (
                <><Loader className="w-5 h-5 mr-2 animate-spin" /> Generating your plan...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Generate Plan</>
              )}
            </Button>

            {!isAuthenticated && (
              <p className="text-xs text-slate-500 text-center">Please sign in to generate and save reading plans</p>
            )}
          </div>
        )}

        {/* My Plans Tab */}
        {activeTab === 'my-plans' && (
          <div className="space-y-4">
            {isLoading && <p className="text-center text-slate-500 py-12">Loading plans...</p>}

            {!isLoading && plans.length === 0 && (
              <div className="text-center py-16 bg-slate-50 rounded-2xl">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-600">No reading plans yet</p>
                <p className="text-sm text-slate-400 mt-1">Generate your first AI-powered plan</p>
                <Button onClick={() => setActiveTab('create')} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" /> Create Plan
                </Button>
              </div>
            )}

            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                progress={progress(plan)}
                expandedDay={expandedDay}
                setExpandedDay={setExpandedDay}
                onToggleDay={(dayIdx) => handleToggleDay(plan, dayIdx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan, progress, expandedDay, setExpandedDay, onToggleDay }) {
  const [showDays, setShowDays] = useState(false);
  const completedDays = plan.days?.filter(d => d.completed).length || 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Plan header */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-slate-900">{plan.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{plan.goal}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-purple-600">{progress}%</span>
            <p className="text-xs text-slate-400">{completedDays}/{plan.durationDays} days</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={() => setShowDays(!showDays)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-sm font-semibold text-slate-700"
        >
          <span>View Daily Readings</span>
          {showDays ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Days list */}
      {showDays && (
        <div className="border-t border-slate-100 divide-y divide-slate-50 max-h-96 overflow-y-auto">
          {(plan.days || []).map((day, idx) => (
            <div key={idx} className="px-5 py-3">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleDay(idx)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {day.completed
                    ? <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    : <Circle className="w-5 h-5 text-slate-300 hover:text-purple-400" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`font-semibold text-sm ${day.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      Day {day.dayNumber}: {day.title}
                    </p>
                    <button
                      onClick={() => setExpandedDay(expandedDay === `${idx}` ? null : `${idx}`)}
                      className="text-xs text-purple-600 ml-2 flex-shrink-0"
                    >
                      {expandedDay === `${idx}` ? 'Less' : 'More'}
                    </button>
                  </div>
                  <p className="text-xs text-purple-600 font-medium mt-0.5">
                    {day.readings?.join(' • ')}
                  </p>
                  {expandedDay === `${idx}` && day.devotionalNote && (
                    <p className="text-xs text-slate-600 mt-2 italic leading-relaxed border-l-2 border-purple-200 pl-2">
                      {day.devotionalNote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}