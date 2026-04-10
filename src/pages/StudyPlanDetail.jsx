import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle2, Circle, ChevronLeft, Sparkles, Flame, Lock } from 'lucide-react';
import { recordChapterRead } from '../components/home/StreakCounter';

const CURATED_PLANS = {
  'psalms-30': { id: 'psalms-30', title: '30 Days in Psalms', cover: '🙏', chapters: ['Psalm 1','Psalm 3','Psalm 5','Psalm 8','Psalm 15','Psalm 19','Psalm 23','Psalm 27','Psalm 31','Psalm 34','Psalm 37','Psalm 42','Psalm 46','Psalm 62','Psalm 73','Psalm 84','Psalm 91','Psalm 100','Psalm 103','Psalm 107','Psalm 119','Psalm 121','Psalm 139','Psalm 142','Psalm 145','Psalm 150','Psalm 23','Psalm 8','Psalm 46','Psalm 1'] },
  'john-overview': { id: 'john-overview', title: 'Gospel of John Overview', cover: '📖', chapters: ['John 1','John 2-3','John 4-5','John 6','John 7-8','John 9-10','John 11-12','John 13-14','John 15-16','John 17-18','John 19-20','John 21'] },
  'genesis-beginning': { id: 'genesis-beginning', title: 'Genesis: Creation to Covenant', cover: '🌍', chapters: ['Genesis 1-2','Genesis 3-5','Genesis 6-9','Genesis 10-11','Genesis 12-14','Genesis 15-16','Genesis 17-18','Genesis 19-20','Genesis 21-23','Genesis 24-25','Genesis 26-27','Genesis 28-29','Genesis 30-31','Genesis 32-33','Genesis 34-35','Genesis 36-37','Genesis 38-39','Genesis 40-41','Genesis 42-43','Genesis 44-45','Genesis 46-47','Genesis 48-50'] },
  'romans-faith': { id: 'romans-faith', title: 'Romans: Faith & Grace', cover: '✨', chapters: ['Romans 1-2','Romans 3-4','Romans 5-6','Romans 7-8','Romans 9-10','Romans 11-12','Romans 13-14','Romans 15-16'] },
};

export default function StudyPlanDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const planId = params.get('plan');

  const [plan, setPlan] = useState(null);
  const [completedDays, setCompletedDays] = useState([]);
  const [user, setUser] = useState(null);
  const [markingDay, setMarkingDay] = useState(null);

  useEffect(() => {
    // Load plan
    let p = CURATED_PLANS[planId];
    if (!p) {
      // Try from localStorage (AI-generated plans)
      try {
        const stored = JSON.parse(localStorage.getItem('ai_study_plans') || '[]');
        p = stored.find(x => x.id === planId);
      } catch { /* ignore */ }
    }
    if (!p) { navigate(createPageUrl('StudyPlans')); return; }
    setPlan({ ...p, totalDays: p.chapters.length });

    // Load progress
    const progressKey = `study_progress_${planId}`;
    const saved = localStorage.getItem(progressKey);
    const days = saved ? JSON.parse(saved) : [];
    setCompletedDays(days);

    // Save as active plan
    const activePlan = {
      id: p.id, title: p.title, cover: p.cover,
      totalDays: p.chapters.length, chapters: p.chapters,
      completedDays: days,
    };
    localStorage.setItem('active_study_plan', JSON.stringify(activePlan));

    // Load user
    base44.auth.me().then(setUser).catch(() => {});
  }, [planId]);

  const markDayComplete = async (dayIndex) => {
    if (completedDays.includes(dayIndex)) return;
    setMarkingDay(dayIndex);
    const updated = [...completedDays, dayIndex];
    setCompletedDays(updated);
    const progressKey = `study_progress_${planId}`;
    localStorage.setItem(progressKey, JSON.stringify(updated));

    // Update active plan cache
    if (plan) {
      localStorage.setItem('active_study_plan', JSON.stringify({
        id: plan.id, title: plan.title, cover: plan.cover,
        totalDays: plan.totalDays, chapters: plan.chapters,
        completedDays: updated,
      }));
    }

    // Update streak
    if (user) await recordChapterRead(user);
    setMarkingDay(null);
  };

  if (!plan) return null;

  const completedCount = completedDays.length;
  const totalDays = plan.chapters.length;
  const pct = Math.round((completedCount / totalDays) * 100);
  const nextDay = completedDays.length; // 0-indexed next day to read

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-indigo-600 font-medium text-sm mb-5 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Plans
        </button>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4 mb-5">
            <span className="text-5xl">{plan.cover}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
              <p className="text-sm text-gray-500">{totalDays} days · {completedCount} completed</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-bold text-indigo-600">{pct}%</span>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">{completedCount} done</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-gray-600">{totalDays - completedCount} remaining</span>
            </div>
            {completedCount === totalDays && (
              <Badge className="bg-amber-100 text-amber-700">🎉 Completed!</Badge>
            )}
          </div>
        </div>

        {/* Continue button (next unread day) */}
        {nextDay < totalDays && (
          <div className="bg-indigo-600 rounded-3xl p-5 mb-6 text-white">
            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Up Next</p>
            <p className="text-lg font-bold mb-1">Day {nextDay + 1}: {plan.chapters[nextDay]}</p>
            <Button
              onClick={() => markDayComplete(nextDay)}
              disabled={markingDay === nextDay}
              className="mt-3 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl w-full"
            >
              {markingDay === nextDay ? 'Marking…' : '✅ Mark as Read'}
            </Button>
          </div>
        )}

        {/* Day list */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">All Days</h2>
          {plan.chapters.map((chapter, i) => {
            const done = completedDays.includes(i);
            const isNext = i === nextDay;
            const locked = i > nextDay;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  done ? 'bg-green-50 border-green-200' :
                  isNext ? 'bg-indigo-50 border-indigo-300 shadow-sm' :
                  locked ? 'bg-gray-50 border-gray-100 opacity-60' :
                  'bg-white border-gray-100'
                }`}
              >
                <div className="flex-shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : locked ? (
                    <Lock className="w-6 h-6 text-gray-300" />
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isNext ? 'border-indigo-500 text-indigo-600' : 'border-gray-300 text-gray-400'}`}>
                      {i + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold uppercase tracking-wide ${done ? 'text-green-600' : isNext ? 'text-indigo-600' : 'text-gray-400'}`}>
                    Day {i + 1}
                  </p>
                  <p className={`text-sm font-medium ${done ? 'text-gray-600 line-through' : 'text-gray-800'}`}>{chapter}</p>
                </div>

                {isNext && !done && (
                  <Button
                    size="sm"
                    onClick={() => markDayComplete(i)}
                    disabled={markingDay === i}
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs flex-shrink-0"
                  >
                    {markingDay === i ? '…' : 'Done'}
                  </Button>
                )}
                {done && <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}