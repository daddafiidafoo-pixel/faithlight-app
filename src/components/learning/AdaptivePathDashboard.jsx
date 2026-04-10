import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2,
  Sparkles, Loader2, ChevronRight, BarChart2, BookOpen, Zap, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const DIFF_CONFIG = {
  beginner:     { label: 'Beginner',     color: 'bg-green-100 text-green-800 border-green-300',  bar: 'bg-green-500',  pct: 33 },
  intermediate: { label: 'Intermediate', color: 'bg-blue-100 text-blue-800 border-blue-300',    bar: 'bg-blue-500',   pct: 66 },
  advanced:     { label: 'Advanced',     color: 'bg-purple-100 text-purple-800 border-purple-300', bar: 'bg-purple-500', pct: 100 },
};

const PACE_CONFIG = {
  slow_down:  { label: 'Slowing Down', icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  maintain:   { label: 'On Track',     icon: Minus,        color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  speed_up:   { label: 'Accelerating', icon: TrendingUp,   color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
};

export default function AdaptivePathDashboard({ userId }) {
  const [adaptation, setAdaptation] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch raw performance data
  const { data: quizResults = [] } = useQuery({
    queryKey: ['quizResults', userId],
    queryFn: () => base44.entities.UserQuizResult.filter({ user_id: userId }, '-created_date', 20).catch(() => []),
    enabled: !!userId,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => base44.entities.UserProgress.filter({ user_id: userId }, '-updated_date', 30).catch(() => []),
    enabled: !!userId,
  });

  // Auto-analyze when data is ready
  useEffect(() => {
    if (userId && (quizResults.length > 0 || progress.length > 0)) {
      analyzeAndAdapt();
    }
  }, [userId, quizResults.length, progress.length]);

  const analyzeAndAdapt = async () => {
    if (!userId || analyzing) return;
    setAnalyzing(true);
    try {
      // Local metrics
      const avgScore = quizResults.length > 0
        ? quizResults.reduce((s, r) => s + (r.score_percentage || r.score || 0), 0) / quizResults.length
        : null;

      const completionRate = progress.length > 0
        ? (progress.filter(p => p.completed || p.is_completed).length / progress.length) * 100
        : null;

      const recentScores = quizResults.slice(0, 5).map(r => r.score_percentage || r.score || 0);
      const trend = recentScores.length >= 2
        ? recentScores[0] - recentScores[recentScores.length - 1]
        : 0;

      // Topic-level struggle detection
      const scoresByTopic = {};
      quizResults.forEach(q => {
        const topic = q.topic_or_lesson || q.topic || 'General';
        if (!scoresByTopic[topic]) scoresByTopic[topic] = [];
        scoresByTopic[topic].push(q.score_percentage || q.score || 0);
      });
      const strugglingTopics = Object.entries(scoresByTopic)
        .map(([t, scores]) => ({ topic: t, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
        .filter(t => t.avg < 70)
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 3);

      const strongTopics = Object.entries(scoresByTopic)
        .map(([t, scores]) => ({ topic: t, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
        .filter(t => t.avg >= 85)
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3);

      // Ask AI for full adaptation recommendation
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an adaptive learning AI for a Bible study platform. Based on the learner's data, decide how to adjust their learning path.

LEARNER DATA:
- Average Quiz Score: ${avgScore !== null ? avgScore.toFixed(1) + '%' : 'No quizzes yet'}
- Lesson Completion Rate: ${completionRate !== null ? completionRate.toFixed(1) + '%' : 'No lessons yet'}
- Score Trend (recent vs older): ${trend > 5 ? 'Improving' : trend < -5 ? 'Declining' : 'Stable'}
- Struggling Topics: ${strugglingTopics.map(t => `${t.topic} (${t.avg.toFixed(0)}%)`).join(', ') || 'None'}
- Strong Topics: ${strongTopics.map(t => t.topic).join(', ') || 'None yet'}
- Total Quizzes Taken: ${quizResults.length}
- Total Lessons Attempted: ${progress.length}

Respond with a JSON adaptation plan:
{
  "nextDifficulty": "beginner" | "intermediate" | "advanced",
  "paceAdjustment": "slow_down" | "maintain" | "speed_up",
  "adaptationReason": "1-2 sentence explanation of WHY the path is adapting",
  "personalizedMessage": "short encouraging message to the user (max 20 words)",
  "nextAction": "the single most important next step for this learner",
  "supplementaryNeeded": true | false,
  "supplementaryTopics": ["topic1", "topic2"] (only if supplementaryNeeded is true, max 3)
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            nextDifficulty: { type: 'string' },
            paceAdjustment: { type: 'string' },
            adaptationReason: { type: 'string' },
            personalizedMessage: { type: 'string' },
            nextAction: { type: 'string' },
            supplementaryNeeded: { type: 'boolean' },
            supplementaryTopics: { type: 'array', items: { type: 'string' } },
          }
        }
      });

      setAdaptation({
        ...aiResult,
        metrics: { avgScore, completionRate, trend, quizCount: quizResults.length },
        strugglingTopics,
        strongTopics,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Adaptation analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (analyzing && !adaptation) {
    return (
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="py-10 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p className="text-indigo-800 font-medium">Analyzing your learning patterns...</p>
          <p className="text-indigo-600 text-sm mt-1">This takes just a moment</p>
        </CardContent>
      </Card>
    );
  }

  if (!adaptation) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-8 text-center">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">Complete some lessons or quizzes to activate adaptive learning.</p>
        </CardContent>
      </Card>
    );
  }

  const diff = DIFF_CONFIG[adaptation.nextDifficulty] || DIFF_CONFIG.beginner;
  const pace = PACE_CONFIG[adaptation.paceAdjustment] || PACE_CONFIG.maintain;
  const PaceIcon = pace.icon;

  return (
    <div className="space-y-4">
      {/* ── ADAPTATION BANNER ── */}
      <Card className="border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Your Path is Adapting
            </CardTitle>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-indigo-500">
                  Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <Button
                variant="ghost" size="sm"
                onClick={analyzeAndAdapt}
                disabled={analyzing}
                className="text-indigo-600 hover:bg-indigo-100 h-7 px-2"
              >
                {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Personalized message */}
          <p className="text-indigo-800 font-medium text-sm bg-white/60 rounded-lg px-3 py-2 border border-indigo-100">
            💬 {adaptation.personalizedMessage}
          </p>

          {/* Why it's adapting */}
          <div className="bg-white/70 rounded-lg px-3 py-2 border border-indigo-100">
            <p className="text-xs text-indigo-500 uppercase tracking-wide mb-1">Why your path changed</p>
            <p className="text-sm text-gray-700">{adaptation.adaptationReason}</p>
          </div>

          {/* Difficulty + Pace row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Difficulty */}
            <div className="bg-white rounded-lg p-3 border border-indigo-100">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Current Difficulty</p>
              <Badge className={`${diff.color} border text-xs mb-2`}>{diff.label}</Badge>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`${diff.bar} h-2 rounded-full transition-all duration-700`} style={{ width: `${diff.pct}%` }} />
              </div>
            </div>
            {/* Pace */}
            <div className={`rounded-lg p-3 border ${pace.bg}`}>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Pace Adjustment</p>
              <div className={`flex items-center gap-1 font-semibold text-sm ${pace.color}`}>
                <PaceIcon className="w-4 h-4" />
                {pace.label}
              </div>
            </div>
          </div>

          {/* Metrics row */}
          {adaptation.metrics.avgScore !== null && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg py-2 px-1 border border-indigo-100">
                <p className="text-lg font-bold text-indigo-700">{adaptation.metrics.avgScore.toFixed(0)}%</p>
                <p className="text-xs text-gray-500">Quiz Avg</p>
              </div>
              <div className="bg-white rounded-lg py-2 px-1 border border-indigo-100">
                <p className="text-lg font-bold text-indigo-700">{adaptation.metrics.completionRate?.toFixed(0) ?? '—'}%</p>
                <p className="text-xs text-gray-500">Completion</p>
              </div>
              <div className="bg-white rounded-lg py-2 px-1 border border-indigo-100">
                <p className={`text-lg font-bold ${adaptation.metrics.trend > 5 ? 'text-green-600' : adaptation.metrics.trend < -5 ? 'text-red-500' : 'text-gray-600'}`}>
                  {adaptation.metrics.trend > 5 ? '↑' : adaptation.metrics.trend < -5 ? '↓' : '→'}
                </p>
                <p className="text-xs text-gray-500">Trend</p>
              </div>
            </div>
          )}

          {/* Next action */}
          <div className="flex items-start gap-2 bg-indigo-600 text-white rounded-lg px-3 py-2">
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{adaptation.nextAction}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── STRENGTHS & STRUGGLES ── */}
      {(adaptation.strugglingTopics.length > 0 || adaptation.strongTopics.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Struggling */}
          {adaptation.strugglingTopics.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-4 h-4" /> Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {adaptation.strugglingTopics.map(t => (
                    <div key={t.topic} className="flex items-center justify-between bg-white rounded px-3 py-1.5 border border-amber-100">
                      <span className="text-sm text-gray-800">{t.topic}</span>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 border text-xs">
                        {t.avg.toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strong */}
          {adaptation.strongTopics.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="w-4 h-4" /> Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {adaptation.strongTopics.map(t => (
                    <div key={t.topic} className="flex items-center justify-between bg-white rounded px-3 py-1.5 border border-green-100">
                      <span className="text-sm text-gray-800">{t.topic}</span>
                      <Badge className="bg-green-100 text-green-800 border-green-300 border text-xs">
                        {t.avg.toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── SUPPLEMENTARY MATERIALS NEEDED ── */}
      {adaptation.supplementaryNeeded && adaptation.supplementaryTopics?.length > 0 && (
        <SupplementaryAlert topics={adaptation.supplementaryTopics} />
      )}
    </div>
  );
}

function SupplementaryAlert({ topics }) {
  return (
    <Card className="border-2 border-rose-200 bg-rose-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-rose-800">
          <BookOpen className="w-4 h-4" />
          Supplementary Materials Recommended
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-rose-700">
          Based on your quiz results, the AI recommends reviewing these topics before moving on:
        </p>
        <div className="space-y-2">
          {topics.map((topic) => (
            <div key={topic} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-rose-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-medium text-gray-800">{topic}</span>
              </div>
              <Link to={createPageUrl(`BibleTutor?topic=${encodeURIComponent(topic)}`)}>
                <Button size="sm" variant="outline" className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-50">
                  Study Now <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-rose-600">
          💡 Your path difficulty has been adjusted. Complete these reviews to build a stronger foundation.
        </p>
      </CardContent>
    </Card>
  );
}