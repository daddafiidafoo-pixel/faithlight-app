import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, CheckCircle2, TrendingUp } from 'lucide-react';
import { useRatingPrompt } from '../rating/RatingPromptManager';

export default function StudyPlanProgress({ planId, userId }) {
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [streak, setStreak] = useState(0);
  const { triggerRatingPrompt } = useRatingPrompt();

  useEffect(() => {
    const load = async () => {
      if (!planId || !userId) return;
      try {
        const p = await base44.entities.StudyPlan.list().then((plans) =>
          plans.find((pl) => pl.id === planId && pl.user_id === userId)
        );
        if (p) {
          setPlan(p);
          const completed = p.current_day || 0;
          const pct = Math.round((completed / p.duration_days) * 100);
          setProgress({
            completed,
            total: p.duration_days,
            percentage: pct,
          });

          // Trigger rating prompt on plan completion
          if (pct === 100) {
            triggerRatingPrompt();
          }

          // Calculate streak (simplified: count consecutive days from start)
          setStreak(Math.max(0, completed));
        }
      } catch (error) {
        console.error('Failed to load plan:', error);
      }
    };
    load();
  }, [planId, userId]);

  if (!plan || !progress) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Streak Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{streak} days</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">of {plan.duration_days}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">
                {progress.completed} / {progress.total} days complete
              </span>
              <span className="font-bold text-indigo-600">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-2.5" />
          </div>

          {progress.percentage === 100 ? (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              🎉 Plan completed! Congratulations!
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              {progress.total - progress.completed} days remaining
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}