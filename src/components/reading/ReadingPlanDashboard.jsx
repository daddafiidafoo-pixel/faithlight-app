import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';

export default function ReadingPlanDashboard() {
  const [plans, setPlans] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const allPlans = await base44.entities.ReadingPlan.filter(
          { is_active: true },
          '-created_date',
          10
        );
        setPlans(allPlans);

        if (currentUser) {
          const progress = await base44.entities.ReadingPlanProgress.filter(
            { user_email: currentUser.email, is_completed: false },
            '-created_date',
            1
          );
          if (progress && progress.length > 0) {
            setUserProgress(progress[0]);
            setSelectedPlan(progress[0].plan_id);
          }
        }
      } catch (error) {
        console.error('Failed to load reading plans:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const startPlan = async (planId) => {
    if (!user) {
      alert('Please sign in to start a reading plan');
      return;
    }

    try {
      const plan = plans.find((p) => p.id === planId);
      const progress = await base44.entities.ReadingPlanProgress.create({
        user_email: user.email,
        plan_id: planId,
        plan_title: plan.title,
        completed_days: [],
        started_at: new Date().toISOString(),
      });
      setUserProgress(progress);
      setSelectedPlan(planId);
    } catch (error) {
      console.error('Failed to start plan:', error);
    }
  };

  const toggleDay = async (dayNumber) => {
    if (!userProgress) return;

    const completed = userProgress.completed_days.includes(dayNumber)
      ? userProgress.completed_days.filter((d) => d !== dayNumber)
      : [...userProgress.completed_days, dayNumber];

    try {
      const updated = await base44.entities.ReadingPlanProgress.update(userProgress.id, {
        completed_days: completed,
      });
      setUserProgress(updated);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reading plans...</div>;
  }

  const currentPlan = plans.find((p) => p.id === selectedPlan);
  const completionPercent = currentPlan
    ? Math.round((userProgress?.completed_days?.length || 0) / currentPlan.duration_days * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bible Reading Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.length === 0 ? (
            <p className="text-gray-600">No reading plans available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition ${
                    selectedPlan === plan.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{plan.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <div className="text-xs text-gray-500 mb-4">
                      {plan.duration_days} days • {plan.daily_chapters?.length || 0} chapters
                    </div>
                    {selectedPlan !== plan.id && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          startPlan(plan.id);
                        }}
                        size="sm"
                        className="w-full"
                      >
                        Start Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {userProgress && currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle>{currentPlan.title} - Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completion</span>
                <span className="font-semibold">{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} className="h-2" />
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: currentPlan.duration_days }).map((_, i) => {
                const day = i + 1;
                const isCompleted = userProgress.completed_days?.includes(day);
                const dayChapter = currentPlan.daily_chapters?.[i];

                return (
                  <div key={day} className="text-center">
                    <button
                      onClick={() => toggleDay(day)}
                      className="w-full aspect-square flex flex-col items-center justify-center rounded-lg border transition"
                      title={dayChapter ? `${dayChapter.book} ${dayChapter.chapter}` : `Day ${day}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                      <span className="text-xs mt-1">{day}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}