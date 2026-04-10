import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Loader, BookOpen } from 'lucide-react';
import ReadingPlanProgressCard from '@/components/readingplan/ReadingPlanProgressCard';
import { toast } from 'sonner';

export default function BibleReadingPlanTracker() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['readingPlans'],
    queryFn: () => user ? base44.entities.ReadingPlan.list() : [],
    enabled: !!user
  });

  const { data: userProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => user ? base44.entities.ReadingPlanProgress.filter({ userEmail: user.email }) : [],
    enabled: !!user
  });

  const startPlanMutation = useMutation({
    mutationFn: (planId) => base44.entities.ReadingPlanProgress.create({
      userEmail: user.email,
      planId,
      currentDay: 1,
      completedDaysCount: 0,
      startedAt: new Date().toISOString(),
      isActive: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      toast.success('Plan started! Check back daily for your reading prompt.');
    }
  });

  const markDayCompleteMutation = useMutation({
    mutationFn: (planId) => {
      const progress = userProgress.find(p => p.planId === planId && p.isActive);
      if (!progress) return Promise.reject('Progress not found');
      
      return base44.entities.ReadingPlanDayCompletion.create({
        userEmail: user.email,
        planId,
        dayNumber: progress.currentDay,
        completedAt: new Date().toISOString(),
        completionSource: 'app'
      }).then(() => {
        // Update progress
        const newCompleted = progress.completedDaysCount + 1;
        const newDay = progress.currentDay + 1;
        return base44.entities.ReadingPlanProgress.update(progress.id, {
          currentDay: newDay,
          completedDaysCount: newCompleted,
          lastActivityAt: new Date().toISOString()
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      toast.success('Day marked as complete! 🎉');
    }
  });

  const isLoading = plansLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  const activePlans = userProgress.filter(p => p.isActive);
  const availablePlans = plans.filter(p => !activePlans.some(ap => ap.planId === p.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bible Reading Plans</h1>
          <p className="text-gray-600">Track your daily Bible reading progress</p>
        </div>

        {/* Active Plans */}
        {activePlans.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Active Plans</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {activePlans.map(progress => {
                const plan = plans.find(p => p.id === progress.planId);
                return plan ? (
                  <ReadingPlanProgressCard
                    key={progress.id}
                    plan={plan}
                    progress={progress}
                    onContinue={() => markDayCompleteMutation.mutate(plan.id)}
                    onViewDetails={(planId) => {
                      // Navigate to plan detail
                      window.location.href = `/BibleReadingPlan?id=${planId}`;
                    }}
                  />
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Available Plans */}
        {availablePlans.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Plans</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {availablePlans.map(plan => (
                <div key={plan.id} className="bg-white rounded-lg shadow p-5 border-l-4 border-l-indigo-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{plan.dayCount || 90} days</p>
                  <Button
                    onClick={() => startPlanMutation.mutate(plan.id)}
                    disabled={startPlanMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {startPlanMutation.isPending ? (
                      <Loader className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Plus className="w-4 h-4 mr-1" />
                    )}
                    Start This Plan
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePlans.length === 0 && availablePlans.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reading plans available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}