import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, BookOpen, Flame, Trophy, Target, ChevronRight, Loader2, Award, TrendingUp, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const BADGE_DEFS = [
  { id: 'first_read', label: 'First Steps', icon: '📖', desc: 'Read your first chapter', threshold: 1, field: 'chapters_read' },
  { id: 'seeker', label: 'Seeker', icon: '🔍', desc: 'Read 10 chapters', threshold: 10, field: 'chapters_read' },
  { id: 'devoted', label: 'Devoted', icon: '🙏', desc: '7-day reading streak', threshold: 7, field: 'streak_days' },
  { id: 'scholar', label: 'Scholar', icon: '🎓', desc: 'Complete 3 study plans', threshold: 3, field: 'plans_completed' },
  { id: 'community', label: 'Community Pillar', icon: '👥', desc: 'Post 5 forum replies', threshold: 5, field: 'forum_replies' },
];

function BadgeCard({ badge, earned }) {
  return (
    <div className={`rounded-xl p-3 border text-center transition-all ${earned ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
      <div className="text-2xl mb-1">{badge.icon}</div>
      <p className="text-xs font-bold text-gray-700">{badge.label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{badge.desc}</p>
      {earned && <CheckCircle className="w-3 h-3 text-amber-500 mx-auto mt-1" />}
    </div>
  );
}

function SuggestedPlan({ plan, onStart }) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-900">{plan.title}</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">{plan.description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{plan.duration_days} days</span>
            {plan.topics?.slice(0, 2).map(t => (
              <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
            ))}
          </div>
        </div>
        <Button size="sm" onClick={onStart} className="bg-indigo-600 text-white text-xs gap-1 flex-shrink-0">
          Start <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export default function PersonalizedLearningDashboard({ user }) {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [aiPlans, setAiPlans] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // Fetch user's study plans
  const { data: plans = [] } = useQuery({
    queryKey: ['userStudyPlans', user?.id],
    queryFn: async () => {
      try { return await base44.entities.StudyPlan.filter({ user_id: user.id }, '-updated_date', 10); }
      catch { return []; }
    },
    enabled: !!user,
    retry: false,
  });

  // Fetch user streak
  const { data: streak = null } = useQuery({
    queryKey: ['userStreak', user?.id],
    queryFn: async () => {
      try { const r = await base44.entities.UserStreak.filter({ user_id: user.id }, '-updated_date', 1); return r[0] ?? null; }
      catch { return null; }
    },
    enabled: !!user,
    retry: false,
  });

  // Fetch user points
  const { data: points = null } = useQuery({
    queryKey: ['userPoints', user?.id],
    queryFn: async () => {
      try { const r = await base44.entities.UserPoints.filter({ user_id: user.id }, '-updated_date', 1); return r[0] ?? null; }
      catch { return null; }
    },
    enabled: !!user,
    retry: false,
  });

  // Fetch reading history for metrics
  const { data: readHistory = [] } = useQuery({
    queryKey: ['readHistory', user?.id],
    queryFn: async () => {
      try {
        return await base44.entities.ReadingHistory.filter({ user_id: user.id }, '-updated_date', 50);
      } catch { return []; }
    },
    enabled: !!user,
    retry: false,
  });

  const chaptersRead = readHistory.length;
  const streakDays = streak?.current_streak || 0;
  const totalPoints = points?.total_points || 0;
  const activePlans = plans.filter(p => p.status === 'active');
  const completedPlans = plans.filter(p => p.status === 'completed').length;

  const earnedBadges = BADGE_DEFS.filter(b => {
    if (b.field === 'chapters_read') return chaptersRead >= b.threshold;
    if (b.field === 'streak_days') return streakDays >= b.threshold;
    if (b.field === 'plans_completed') return completedPlans >= b.threshold;
    return false;
  }).map(b => b.id);

  const generatePersonalizedPlan = async () => {
    if (!user) return;
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create 3 personalized Bible reading plans for a user with these characteristics:
- Chapters read: ${chaptersRead}
- Current streak: ${streakDays} days
- Plans completed: ${completedPlans}
- Total points: ${totalPoints}

Consider their level: ${chaptersRead < 10 ? 'beginner' : chaptersRead < 50 ? 'intermediate' : 'advanced'}.
Create diverse plans covering different topics (e.g., faith, prophecy, gospels, psalms).
Each plan should be achievable and motivating.`,
      response_json_schema: {
        type: 'object',
        properties: {
          plans: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                duration_days: { type: 'number' },
                topics: { type: 'array', items: { type: 'string' } },
                why_recommended: { type: 'string' },
              }
            }
          }
        }
      }
    });
    setAiPlans(result.plans || []);
    setGenerating(false);
  };

  const startPlan = async (plan) => {
    await base44.entities.StudyPlan.create({
      user_id: user.id,
      title: plan.title,
      description: plan.description,
      duration_days: plan.duration_days,
      topics: plan.topics,
      status: 'active',
      progress_percentage: 0,
    });
    qc.invalidateQueries(['userStudyPlans', user?.id]);
  };

  const level = chaptersRead < 10 ? 'Seeker' : chaptersRead < 50 ? 'Explorer' : chaptersRead < 150 ? 'Disciple' : 'Scholar';
  const levelColor = chaptersRead < 10 ? 'text-green-600' : chaptersRead < 50 ? 'text-blue-600' : chaptersRead < 150 ? 'text-purple-600' : 'text-amber-600';

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Chapters Read', value: chaptersRead, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Day Streak', value: streakDays, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Total Points', value: totalPoints, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Active Plans', value: activePlans.length, icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.bg} border border-transparent`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Spiritual Level */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className={`w-5 h-5 ${levelColor}`} />
            <span className="font-semibold text-gray-900">Your Level: <span className={levelColor}>{level}</span></span>
          </div>
          <Badge variant="outline" className={`${levelColor} border-current text-xs`}>{chaptersRead} chapters</Badge>
        </div>
        <Progress value={Math.min((chaptersRead / 150) * 100, 100)} className="h-2 mb-2" />
        <p className="text-xs text-gray-400">
          {chaptersRead < 150 ? `${150 - chaptersRead} more chapters to reach Scholar level` : '🎉 You\'ve reached Scholar level!'}
        </p>
      </div>

      {/* Active Plans */}
      {activePlans.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" /> Active Study Plans
          </h3>
          <div className="space-y-3">
            {activePlans.slice(0, 3).map(plan => (
              <div key={plan.id} className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-900">{plan.title}</span>
                  <span className="text-xs text-indigo-600 font-semibold">{plan.progress_percentage || 0}%</span>
                </div>
                <Progress value={plan.progress_percentage || 0} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" /> Personalized Recommendations
          </h3>
          <Button size="sm" variant="outline" onClick={generatePersonalizedPlan} disabled={generating} className="text-xs gap-1">
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {generating ? 'Generating...' : 'Generate Plans'}
          </Button>
        </div>
        {aiPlans.length > 0 ? (
          <div className="space-y-3">
            {aiPlans.map((plan, i) => (
              <SuggestedPlan key={i} plan={plan} onStart={() => startPlan(plan)} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-indigo-100 p-6 text-center">
            <Sparkles className="w-8 h-8 text-purple-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click "Generate Plans" to get AI-curated reading plans based on your progress</p>
          </div>
        )}
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" /> Achievement Badges
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {BADGE_DEFS.map(b => (
            <BadgeCard key={b.id} badge={b} earned={earnedBadges.includes(b.id)} />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link to={createPageUrl('BibleStudyPlans')}>
          <div className="rounded-xl bg-indigo-600 text-white p-4 hover:bg-indigo-700 transition-colors cursor-pointer">
            <BookOpen className="w-5 h-5 mb-2" />
            <p className="font-semibold text-sm">Study Plans</p>
            <p className="text-xs opacity-75 mt-0.5">Browse & create plans</p>
          </div>
        </Link>
        <Link to={createPageUrl('ReadingGoals')}>
          <div className="rounded-xl bg-amber-500 text-white p-4 hover:bg-amber-600 transition-colors cursor-pointer">
            <Target className="w-5 h-5 mb-2" />
            <p className="font-semibold text-sm">Reading Goals</p>
            <p className="text-xs opacity-75 mt-0.5">Track daily progress</p>
          </div>
        </Link>
      </div>
    </div>
  );
}