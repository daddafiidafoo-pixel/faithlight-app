import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, Loader2, BookOpen, ChevronDown, ChevronRight,
  Plus, Trash2, CheckCircle2, ExternalLink, Target, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOAL_PRESETS = [
  { label: 'Understand the New Testament', emoji: '✝️' },
  { label: 'Deep dive into Psalms', emoji: '🎵' },
  { label: 'Prepare a sermon on Exodus', emoji: '📜' },
  { label: 'Study the life of Jesus', emoji: '🕊️' },
  { label: 'Explore end-times prophecy', emoji: '🔥' },
  { label: 'Learn about prayer', emoji: '🙏' },
  { label: 'Understand grace and salvation', emoji: '💛' },
  { label: 'Study the early Church in Acts', emoji: '⛪' },
];

const DURATION_OPTIONS = [7, 14, 21, 30, 60, 90];

function WeekBlock({ weekNum, days, isOpen, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-sm text-indigo-800">Week {weekNum}</span>
          <Badge className="bg-indigo-100 text-indigo-700 border-none text-xs">{days.length} days</Badge>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-indigo-500" /> : <ChevronRight className="w-4 h-4 text-indigo-500" />}
      </button>
      {isOpen && (
        <div className="divide-y divide-gray-100">
          {days.map((day, i) => (
            <div key={i} className="px-4 py-3 bg-white hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0 mt-0.5">
                  {day.day}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{day.title}</p>
                  {day.scripture && (
                    <p className="text-xs text-indigo-600 font-medium mt-0.5">📖 {day.scripture}</p>
                  )}
                  {day.objective && (
                    <p className="text-xs text-gray-600 mt-1">{day.objective}</p>
                  )}
                  {day.reflection_questions?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-semibold text-gray-500">Reflection:</p>
                      {day.reflection_questions.map((q, qi) => (
                        <p key={qi} className="text-xs text-gray-500 pl-2 border-l-2 border-indigo-200">{q}</p>
                      ))}
                    </div>
                  )}
                  {day.resources?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {day.resources.map((r, ri) => (
                        <Badge key={ri} variant="outline" className="text-xs">{r}</Badge>
                      ))}
                    </div>
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

export default function AIStudyPlanBuilder({ currentUser, isDarkMode }) {
  const queryClient = useQueryClient();
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(14);
  const [openWeeks, setOpenWeeks] = useState({ 1: true });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'result' | 'list'

  // Existing plans
  const { data: studyPlans = [] } = useQuery({
    queryKey: ['studyPlans', currentUser?.id],
    queryFn: () => currentUser
      ? base44.entities.StudyPlan.filter({ user_id: currentUser.id }, '-created_date', 10)
      : [],
    enabled: !!currentUser
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!goal.trim()) throw new Error('Please enter a study goal');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical study expert. Create a detailed ${duration}-day Bible study plan for the following goal:

"${goal}"

Generate a fully structured daily plan with each day having:
- A day number and thematic title
- Scripture reading (specific book, chapter, verse range)
- A learning objective
- 2–3 reflection questions
- 1–2 relevant resources (commentaries, topics, or related passages)

The plan should build progressively — early days lay foundation, later days go deeper. Group the days naturally into weekly themes.

Return JSON with this exact schema:
{
  "title": "string — plan title",
  "description": "string — 1 paragraph overview",
  "themes": ["string"],
  "days": [
    {
      "day": number,
      "title": "string",
      "scripture": "string — e.g. John 1:1-18",
      "objective": "string",
      "reflection_questions": ["string", "string"],
      "resources": ["string"]
    }
  ]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            themes: { type: 'array', items: { type: 'string' } },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  title: { type: 'string' },
                  scripture: { type: 'string' },
                  objective: { type: 'string' },
                  reflection_questions: { type: 'array', items: { type: 'string' } },
                  resources: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedPlan(data);
      setViewMode('result');
      setOpenWeeks({ 1: true });
    },
    onError: (e) => toast.error(e.message || 'Failed to generate plan')
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !generatedPlan) return;
      await base44.entities.StudyPlan.create({
        user_id: currentUser.id,
        title: generatedPlan.title,
        description: generatedPlan.description,
        duration_days: duration,
        topics: generatedPlan.themes || [],
        generated_content: JSON.stringify(generatedPlan),
        daily_plan: (generatedPlan.days || []).map(d => ({
          day: d.day,
          activity: d.title,
          scripture_reading: d.scripture
        })),
        status: 'active',
        progress_percentage: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlans'] });
      toast.success('Study plan saved!');
      setViewMode('list');
    }
  });

  // Group days into weeks
  const weeks = generatedPlan?.days
    ? Object.entries(
        (generatedPlan.days).reduce((acc, day) => {
          const weekNum = Math.ceil(day.day / 7);
          if (!acc[weekNum]) acc[weekNum] = [];
          acc[weekNum].push(day);
          return acc;
        }, {})
      )
    : [];

  if (!currentUser) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Login to generate a personalized AI study plan</p>
      </div>
    );
  }

  // ── Existing Plans List ──
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">My Study Plans</h3>
          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setViewMode('form')}>
            <Plus className="w-3 h-3" /> New Plan
          </Button>
        </div>
        {studyPlans.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No plans yet. Generate your first one!</div>
        ) : (
          <div className="space-y-2">
            {studyPlans.map(plan => {
              const pct = plan.progress_percentage || 0;
              return (
                <div key={plan.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{plan.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{plan.duration_days} days · {pct}% complete</p>
                    </div>
                    <Badge variant={plan.status === 'completed' ? 'default' : 'outline'} className="text-xs flex-shrink-0">
                      {plan.status}
                    </Badge>
                  </div>
                  <Progress value={pct} className="h-1.5 mt-3 [&>div]:bg-indigo-500" />
                  {plan.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plan.topics.slice(0, 3).map(t => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Generated Plan Result ──
  if (viewMode === 'result' && generatedPlan) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{generatedPlan.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{duration} days · AI-generated</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setViewMode('form')}>
              Edit Goal
            </Button>
            <Button
              size="sm"
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Save Plan
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">{generatedPlan.description}</p>

        {generatedPlan.themes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {generatedPlan.themes.map(t => (
              <Badge key={t} className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">{t}</Badge>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {weeks.map(([weekNum, days]) => (
            <WeekBlock
              key={weekNum}
              weekNum={weekNum}
              days={days}
              isOpen={!!openWeeks[weekNum]}
              onToggle={() => setOpenWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }))}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">AI Study Plan Generator</h3>
        </div>
        {studyPlans.length > 0 && (
          <button onClick={() => setViewMode('list')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
            My Plans <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Goal input */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-2 block">What is your study goal?</label>
        <textarea
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="e.g. 'Understand the New Testament', 'Deep dive into Psalms', 'Prepare for a sermon on grace'…"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Preset goals */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Or pick a quick goal:</p>
        <div className="flex flex-wrap gap-1.5">
          {GOAL_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setGoal(p.label)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                goal === p.label
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
              }`}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-2 block">Plan Duration</label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                duration === d
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      <Button
        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        onClick={() => generateMutation.mutate()}
        disabled={!goal.trim() || generateMutation.isPending}
      >
        {generateMutation.isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating your plan…</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Generate Study Plan</>
        )}
      </Button>
    </div>
  );
}