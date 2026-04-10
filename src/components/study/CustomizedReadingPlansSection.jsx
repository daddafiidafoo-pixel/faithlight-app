import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Zap, BookOpen, Heart, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PLAN_GOALS = [
  { id: 'suffering', label: 'Understanding Suffering', icon: Heart, color: '#EC4899' },
  { id: 'strength', label: 'Daily Strength', icon: Zap, color: '#F4B400' },
  { id: 'foundations', label: 'Gospel Foundations', icon: BookOpen, color: '#10B981' },
  { id: 'peace', label: 'Finding Peace', icon: Heart, color: '#0284C7' },
  { id: 'faith', label: 'Growing Faith', icon: Zap, color: '#8B5CF6' },
];

export default function CustomizedReadingPlansSection({ userId }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [selectedGoal, setSelectedGoal] = useState('strength');
  const [creatingPlan, setCreatingPlan] = useState(false);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['reading_plans', userId],
    queryFn: () => base44.entities.PersonalizedStudyPlan?.filter?.({ userId }) || [],
  });

  const createPlanMutation = useMutation({
    mutationFn: async (goal) => {
      const planData = {
        userId,
        goal,
        startDate: new Date().toISOString(),
        completedDays: 0,
        totalDays: 21,
        isActive: true,
      };
      return base44.entities.PersonalizedStudyPlan?.create?.(planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading_plans', userId] });
      setSelectedGoal('strength');
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ planId, completedDays }) => {
      return base44.entities.PersonalizedStudyPlan?.update?.(planId, { completedDays });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading_plans', userId] });
    },
  });

  const handleCreatePlan = () => {
    setCreatingPlan(true);
    createPlanMutation.mutate(selectedGoal);
    setTimeout(() => setCreatingPlan(false), 1000);
  };

  const handleCompleteDay = (plan) => {
    if (plan.completedDays < plan.totalDays) {
      updateProgressMutation.mutate({
        planId: plan.id,
        completedDays: plan.completedDays + 1,
      });
    }
  };

  const completionPercentage = (completed, total) => Math.round((completed / total) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('study.customPlans', 'Customized Reading Plans')}</CardTitle>
          <CardDescription>{t('study.plansDesc', 'Create personalized Bible reading plans based on your spiritual goals')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('study.selectGoal', 'Select a Goal')}</label>
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_GOALS.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>{goal.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreatePlan}
              disabled={creatingPlan || createPlanMutation.isPending}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              {creatingPlan ? t('common.creating', 'Creating...') : t('study.createPlan', 'Create Plan')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Plans */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            {t('common.loading', 'Loading plans...')}
          </div>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              {t('study.noPlanYet', 'No reading plans yet. Create one to get started!')}
            </CardContent>
          </Card>
        ) : (
          plans.map(plan => {
            const goalConfig = PLAN_GOALS.find(g => g.id === plan.goal);
            const percentage = completionPercentage(plan.completedDays, plan.totalDays);
            const isCompleted = plan.completedDays >= plan.totalDays;

            return (
              <Card key={plan.id} className="border-gray-200">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {goalConfig && (
                        <div style={{ color: goalConfig.color }}>
                          <goalConfig.icon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{goalConfig?.label}</h3>
                        <p className="text-sm text-gray-600">{plan.completedDays} of {plan.totalDays} days</p>
                      </div>
                    </div>
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{percentage}%</span>
                      <span className="text-gray-500">{t('common.progress', 'Progress')}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>

                  {!isCompleted && (
                    <Button
                      onClick={() => handleCompleteDay(plan)}
                      disabled={updateProgressMutation.isPending}
                      className="w-full mt-3 gap-2"
                      variant="outline"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t('study.completeToday', 'Complete Today')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}