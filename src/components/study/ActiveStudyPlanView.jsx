import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

export default function ActiveStudyPlanView({ enrollment, onBack, onUpdate }) {
  const [plan, setPlan] = useState(null);
  const [currentDay, setCurrentDay] = useState(enrollment.current_day);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.StudyPlan.filter({ id: enrollment.study_plan_id })
      .then(plans => setPlan(plans[0]));
  }, [enrollment]);

  const dailyReading = plan?.daily_readings?.find(r => r.day === currentDay);

  const handleCompleteDay = async () => {
    setSaving(true);
    try {
      const updated = {
        ...enrollment,
        completed_days: [...new Set([...enrollment.completed_days, currentDay])],
        current_day: currentDay === plan.duration_days ? currentDay : currentDay + 1,
        last_accessed: new Date().toISOString(),
        is_completed: currentDay === plan.duration_days
      };
      await base44.entities.UserStudyPlanEnrollment.update(enrollment.id, updated);
      setCurrentDay(updated.current_day);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const isDayCompleted = enrollment.completed_days?.includes(currentDay);
  const progressPercent = (enrollment.completed_days?.length / plan?.duration_days) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Button onClick={onBack} variant="outline" className="mb-6">← Back</Button>

        <Card className="p-8 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h1 className="text-3xl font-bold mb-2">{plan?.title}</h1>
          <p className="opacity-90">Day {currentDay} of {plan?.duration_days}</p>
          <div className="mt-4 bg-white/20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </Card>

        {dailyReading && (
          <Card className="p-8 space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Today's Reading</h2>
              <p className="text-lg text-blue-600 font-semibold">{dailyReading.reference}</p>
              {dailyReading.reflection_prompt && (
                <p className="text-slate-600 mt-4 italic">{dailyReading.reflection_prompt}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">Progress</h3>
              <div className="space-y-2">
                {plan?.daily_readings?.map(reading => (
                  <div key={reading.day} className="flex items-center gap-3">
                    {enrollment.completed_days?.includes(reading.day) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className="text-slate-700">Day {reading.day}: {reading.reference}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleCompleteDay}
              disabled={saving || isDayCompleted}
              className="w-full py-3 gap-2 bg-green-600 hover:bg-green-700"
            >
              {isDayCompleted ? 'Completed ✓' : 'Mark as Complete'}
              {!isDayCompleted && <ChevronRight className="w-4 h-4" />}
            </Button>
          </Card>
        )}

        {!plan && <div className="text-center py-12">Loading plan...</div>}
      </div>
    </div>
  );
}