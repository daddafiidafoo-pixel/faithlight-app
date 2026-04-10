import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, ChevronRight, BookOpen, GraduationCap, Loader2 } from 'lucide-react';

const ALL_COURSES = [
  { number: 1, title: 'Foundations of Biblical Theology', tier: 'free', track: 'foundations' },
  { number: 2, title: 'Christian Character & Spiritual Growth', tier: 'free', track: 'foundations' },
  { number: 3, title: 'Introduction to Leadership', tier: 'free', track: 'foundations' },
  { number: 4, title: 'Hermeneutics (Bible Interpretation)', tier: 'paid', track: 'advanced' },
  { number: 5, title: 'Systematic Theology', tier: 'paid', track: 'advanced' },
  { number: 6, title: 'Preaching & Teaching', tier: 'paid', track: 'advanced' },
  { number: 7, title: 'Church Leadership & Administration', tier: 'paid', track: 'advanced' },
  { number: 8, title: 'Biblical Counseling & Discipleship', tier: 'paid', track: 'advanced' },
];

export default function LearningPathRecommendations({ user }) {
  const [progress, setProgress] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const prog = await base44.entities.UserTrainingProgress.filter({ user_id: user.id });
      setProgress(prog || []);
      computeRecommendation(prog || []);
    } catch {
      setProgress([]);
      computeRecommendation([]);
    } finally {
      setLoading(false);
    }
  };

  const computeRecommendation = (prog) => {
    const completedNumbers = prog
      .filter(p => p.status === 'completed')
      .map(p => p.course_number)
      .filter(Boolean);

    const inProgressNumbers = prog
      .filter(p => p.status === 'in_progress')
      .map(p => p.course_number)
      .filter(Boolean);

    // Find next logical course
    const nextCourse = ALL_COURSES.find(c =>
      !completedNumbers.includes(c.number) &&
      !inProgressNumbers.includes(c.number)
    );

    const completedCount = completedNumbers.length;

    let trackSuggestion = null;
    if (completedCount === 0) {
      trackSuggestion = { label: 'Start Here', desc: 'Begin with the free Foundations Certificate track — no payment required.', color: 'bg-green-50 border-green-200', badgeColor: 'bg-green-100 text-green-800' };
    } else if (completedCount >= 1 && completedCount < 3) {
      trackSuggestion = { label: 'Keep Going!', desc: 'You\'re building a strong foundation. Complete all 3 free courses to earn your Foundations Certificate.', color: 'bg-blue-50 border-blue-200', badgeColor: 'bg-blue-100 text-blue-800' };
    } else if (completedCount === 3) {
      trackSuggestion = { label: 'Certificate Ready!', desc: 'You\'ve completed the free track! Consider the Advanced Diploma — unlock Hermeneutics, Systematic Theology, and more.', color: 'bg-amber-50 border-amber-200', badgeColor: 'bg-amber-100 text-amber-800' };
    } else if (completedCount > 3) {
      trackSuggestion = { label: 'Advanced Track', desc: `Impressive! ${completedCount} courses completed. Keep pushing toward your Advanced Diploma in Biblical Leadership.`, color: 'bg-purple-50 border-purple-200', badgeColor: 'bg-purple-100 text-purple-800' };
    }

    setRecommendation({ nextCourse, completedCount, inProgress: inProgressNumbers, trackSuggestion });
  };

  const getAIRecommendation = async () => {
    setAiLoading(true);
    const completedTitles = progress
      .filter(p => p.status === 'completed')
      .map(p => ALL_COURSES.find(c => c.number === p.course_number)?.title)
      .filter(Boolean);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical leadership education advisor for the Global Biblical Leadership Institute (GBLI).

A student has completed these courses: ${completedTitles.length ? completedTitles.join(', ') : 'None yet'}.

Based on this progress:
1. Suggest the single best next course or focus area for them from this list: ${ALL_COURSES.map(c => c.title).join(', ')}
2. Give a short, encouraging 2-sentence reason why this is the right next step spiritually and academically.
3. Suggest one Bible verse that relates to this stage of their learning journey.

Keep the tone warm, pastoral, and encouraging.`,
        response_json_schema: {
          type: 'object',
          properties: {
            next_course: { type: 'string' },
            reason: { type: 'string' },
            verse: { type: 'string' },
            verse_reference: { type: 'string' },
          }
        }
      });
      setAiSuggestion(result);
    } catch {
      setAiSuggestion({ next_course: 'Continue your current track', reason: 'Keep building on your foundation in biblical knowledge and leadership.', verse: 'Study to show yourself approved to God...', verse_reference: '2 Timothy 2:15' });
    } finally {
      setAiLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <Badge className="bg-indigo-100 text-indigo-700 border-0 mb-3">Personalized for You</Badge>
        <h2 className="text-3xl font-bold text-gray-900">Your Learning Path</h2>
        <p className="text-gray-500 mt-2">Tailored recommendations based on your progress</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Progress Summary */}
          <Card className="border-2 border-indigo-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Your Progress</p>
                  <p className="text-xs text-gray-500">{recommendation?.completedCount || 0} of {ALL_COURSES.length} courses completed</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${((recommendation?.completedCount || 0) / ALL_COURSES.length) * 100}%` }}
                />
              </div>

              <div className="space-y-2">
                {ALL_COURSES.slice(0, 5).map(course => {
                  const isCompleted = progress.some(p => p.course_number === course.number && p.status === 'completed');
                  const isInProgress = progress.some(p => p.course_number === course.number && p.status === 'in_progress');
                  return (
                    <div key={course.number} className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${isCompleted ? 'bg-green-500' : isInProgress ? 'bg-amber-400' : 'bg-gray-200'}`} />
                      <span className={isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}>{course.title}</span>
                      {isInProgress && <Badge className="bg-amber-100 text-amber-700 text-[10px] py-0 ml-auto">In Progress</Badge>}
                    </div>
                  );
                })}
                {ALL_COURSES.length > 5 && (
                  <p className="text-xs text-gray-400 ml-6">+{ALL_COURSES.length - 5} more courses...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommendation panel */}
          <div className="flex flex-col gap-4">
            {recommendation?.trackSuggestion && (
              <div className={`rounded-xl border-2 p-5 ${recommendation.trackSuggestion.color}`}>
                <Badge className={`${recommendation.trackSuggestion.badgeColor} border-0 mb-2`}>{recommendation.trackSuggestion.label}</Badge>
                <p className="text-sm text-gray-700 leading-relaxed">{recommendation.trackSuggestion.desc}</p>
              </div>
            )}

            {recommendation?.nextCourse && (
              <Card className="border-2 border-[#1E1B4B]">
                <CardContent className="pt-5">
                  <p className="text-xs font-bold text-[#1E1B4B] uppercase tracking-widest mb-1">Recommended Next</p>
                  <p className="font-bold text-gray-900 mb-1">{recommendation.nextCourse.title}</p>
                  <p className="text-xs text-gray-500 mb-4">Course {recommendation.nextCourse.number} · {recommendation.nextCourse.tier === 'free' ? 'Free' : 'Paid'}</p>
                  <Link to={createPageUrl('TrainingHome')}>
                    <Button size="sm" className="bg-[#1E1B4B] hover:bg-indigo-900 text-white gap-2 w-full">
                      <BookOpen className="w-4 h-4" /> Continue Learning <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* AI Advisor */}
            {!aiSuggestion ? (
              <Button
                variant="outline"
                className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={getAIRecommendation}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Get AI-Personalized Advice
              </Button>
            ) : (
              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-indigo-50 border border-amber-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">AI Advisor</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{aiSuggestion.next_course}</p>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{aiSuggestion.reason}</p>
                {aiSuggestion.verse && (
                  <div className="border-l-2 border-amber-400 pl-3">
                    <p className="text-xs italic text-gray-600">"{aiSuggestion.verse}"</p>
                    <p className="text-xs text-amber-600 font-semibold mt-0.5">{aiSuggestion.verse_reference}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}