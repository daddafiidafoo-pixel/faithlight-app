import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';
import { useI18n } from '../I18nProvider';

/**
 * GeneratedPlanViewer
 * 
 * Displays generated study plan with day-by-day breakdown.
 * - Preview mode (read-only)
 * - Start plan button → creates StudyPlanInstance
 */
export default function GeneratedPlanViewer({
  plan,
  cacheId,
  onStartPlan, // (planInstanceId) => void
  loading = false,
}) {
  const { t } = useI18n();
  const [selectedDay, setSelectedDay] = useState(1);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  if (!plan || !plan.days) {
    return (
      <Card className="border-0 shadow-sm bg-gray-50">
        <CardContent className="p-8 text-center text-gray-500">
          {t('study.noPlan', 'No plan generated yet.')}
        </CardContent>
      </Card>
    );
  }

  const currentDay = plan.days.find((d) => d.day === selectedDay) || plan.days[0];

  const handleStartPlan = async () => {
    setError(null);
    setStarting(true);

    try {
      const user = await base44.auth.me();
      if (!user) {
        setError(t('common.loginRequired', 'Please log in to start a plan.'));
        setStarting(false);
        return;
      }

      const instance = await base44.entities.StudyPlanInstance.create({
        user_id: user.id,
        plan_cache_id: cacheId,
        title: plan.title || 'Study Plan',
        duration_days: plan.total_days || 7,
        current_day: 1,
        started_at: new Date().toISOString(),
        status: 'active',
        plan_json: JSON.stringify(plan),
      });

      onStartPlan(instance.id);
    } catch (err) {
      console.error('Start plan error:', err);
      setError(err.message || t('study.startFailed', 'Failed to start plan.'));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardContent className="p-6 space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">{plan.title || 'Study Plan'}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              {t('study.topic', 'Topic')}: {plan.topic || 'Bible Study'}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-600" />
              {plan.total_days} {t('study.days', 'days')}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-600" />
              {plan.avg_minutes_per_day} {t('study.minPerDay', 'min/day')}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {t('study.difficulty', 'Difficulty')}: <span className="font-semibold capitalize">{plan.difficulty}</span>
          </p>
        </CardContent>
      </Card>

      {/* Day selector + content */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t('study.dayBreakdown', 'Day-by-Day Breakdown')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Day tabs */}
          <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
            <TabsList className="flex flex-wrap gap-1 bg-transparent border-b border-gray-200 p-0">
              {plan.days.slice(0, 7).map((d) => (
                <TabsTrigger
                  key={d.day}
                  value={d.day.toString()}
                  className="rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600"
                >
                  Day {d.day}
                </TabsTrigger>
              ))}
              {plan.days.length > 7 && (
                <div className="text-xs text-gray-500 px-2 py-2">… +{plan.days.length - 7}</div>
              )}
            </TabsList>

            {/* Day content */}
            {plan.days.map((day) => (
              <TabsContent key={day.day} value={day.day.toString()} className="space-y-4 mt-4">
                {/* Reading */}
                {day.reading && day.reading.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-800">📖 {t('study.reading', 'Reading')}</h4>
                    <ul className="space-y-1 text-sm text-gray-700 ml-4">
                      {day.reading.map((r, idx) => (
                        <li key={idx}>
                          <strong>{r.ref}</strong> — {r.focus}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Summary */}
                {day.summary && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-800">📝 {t('study.summary', 'Summary')}</h4>
                    <p className="text-sm text-gray-700">{day.summary}</p>
                  </div>
                )}

                {/* Reflection Questions */}
                {day.reflection_questions && day.reflection_questions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-800">🤔 {t('study.reflect', 'Reflection')}</h4>
                    <ul className="space-y-1 text-sm text-gray-700 ml-4 list-disc">
                      {day.reflection_questions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prayer */}
                {day.prayer && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-800">🙏 {t('study.prayer', 'Prayer')}</h4>
                    <p className="text-sm text-gray-700 italic">{day.prayer}</p>
                  </div>
                )}

                {/* Time estimate */}
                {day.time_estimate_minutes && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-4">
                    <Clock className="w-3 h-3" />
                    {day.time_estimate_minutes} min
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Start button */}
      <Button
        onClick={handleStartPlan}
        disabled={starting || loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        size="lg"
      >
        {starting ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            {t('study.starting', 'Starting...')}
          </>
        ) : (
          t('study.startPlan', 'Start This Plan')
        )}
      </Button>
    </div>
  );
}