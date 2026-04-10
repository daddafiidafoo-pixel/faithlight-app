import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Flame, Plus } from 'lucide-react';
import { toast } from 'sonner';

const GOALS = [
  { id: 'encouragement', label: 'Encouragement & Hope', icon: '💪' },
  { id: 'prayer', label: 'Prayer & Faith', icon: '🙏' },
  { id: 'anxiety_peace', label: 'Peace & Anxiety Relief', icon: '🕊️' },
  { id: 'faith_growth', label: 'Growing Your Faith', icon: '✨' },
  { id: 'family', label: 'Family Relationships', icon: '👨‍👩‍👧‍👦' },
  { id: 'healing', label: 'Healing & Restoration', icon: '💚' },
];

export default function PersonalizedReadingPlanDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('encouragement');
  const [selectedDuration, setSelectedDuration] = useState(7);
  const queryClient = useQueryClient();

  // Fetch user's reading plans
  const { data: readingPlans = [] } = useQuery({
    queryKey: ['readingPlans'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        return await base44.entities.UserReadingPlan.filter(
          { user_email: user.email, is_active: true },
          '-created_at'
        );
      } catch {
        return [];
      }
    },
  });

  // Fetch progress for all plans
  const { data: progressData = [] } = useQuery({
    queryKey: ['planProgress'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        return await base44.entities.UserReadingPlanProgress.filter(
          { user_email: user.email, is_completed: false },
          '-last_opened_at'
        );
      } catch {
        return [];
      }
    },
  });

  // Generate new plan
  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      return base44.functions.invoke('generatePersonalizedReadingPlan', {
        goal: selectedGoal,
        durationDays: selectedDuration,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingPlans'] });
      queryClient.invalidateQueries({ queryKey: ['planProgress'] });
      setShowCreateModal(false);
      toast.success('Reading plan created!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create plan');
    },
  });

  // Mark day as complete
  const completeDayMutation = useMutation({
    mutationFn: async ({ progressId, completedDays, currentDay }) => {
      const newCompleted = [...completedDays, currentDay];
      return base44.entities.UserReadingPlanProgress.update(progressId, {
        completed_days: newCompleted,
        current_day: currentDay + 1,
        last_opened_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planProgress'] });
      toast.success('Great job! Keep going! 🎉');
    },
  });

  if (readingPlans.length === 0 && progressData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Create Your Reading Plan
            </h1>
            <p className="text-lg text-gray-600">
              Get a personalized Bible reading plan tailored to your spiritual goals
            </p>
          </div>

          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Choose Your Focus
            </h2>

            <div className="space-y-3 mb-8">
              {GOALS.map((goal) => (
                <label
                  key={goal.id}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                  style={{
                    borderColor: selectedGoal === goal.id ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: selectedGoal === goal.id ? '#f0f9ff' : 'white',
                  }}
                >
                  <input
                    type="radio"
                    name="goal"
                    value={goal.id}
                    checked={selectedGoal === goal.id}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="mr-4"
                  />
                  <span className="text-2xl mr-3">{goal.icon}</span>
                  <span className="text-lg font-medium text-gray-900">
                    {goal.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Plan Duration
              </h3>
              <div className="flex gap-4">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setSelectedDuration(days)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                      selectedDuration === days
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => generatePlanMutation.mutate()}
              disabled={generatePlanMutation.isPending}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
            >
              {generatePlanMutation.isPending ? 'Creating...' : 'Create Plan'}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reading Plans</h1>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Plan
          </Button>
        </div>

        <div className="space-y-6">
          {readingPlans.map((plan) => {
            const progress = progressData.find(
              (p) => p.reading_plan_id === plan.id
            );
            if (!progress) return null;

            const completionPercent = (progress.completed_days.length / plan.duration_days) * 100;
            const todayReading = plan.plan_days[progress.current_day - 1];
            const isCompleted = progress.completed_days.includes(progress.current_day);

            return (
              <Card key={plan.id} className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {plan.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Day {progress.current_day} of {plan.duration_days}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Progress
                    </span>
                    <span className="text-sm text-gray-600">
                      {progress.completed_days.length} completed
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Today's reading */}
                {todayReading && (
                  <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Today's Reading
                    </h3>
                    <p className="text-lg text-gray-800 font-medium">
                      {todayReading.reference}
                    </p>
                    <p className="text-sm text-gray-600 mt-3 italic">
                      {todayReading.reflection_prompt}
                    </p>
                  </Card>
                )}

                {/* Complete button */}
                {!isCompleted && todayReading && (
                  <Button
                    onClick={() =>
                      completeDayMutation.mutate({
                        progressId: progress.id,
                        completedDays: progress.completed_days,
                        currentDay: progress.current_day,
                      })
                    }
                    disabled={completeDayMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Mark Today as Complete
                  </Button>
                )}

                {isCompleted && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-700">
                      ✓ Today's reading completed! Come back tomorrow.
                    </p>
                  </div>
                )}

                {/* Streak indicator */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {progress.completed_days.length} day streak
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Plan
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  What's your focus?
                </label>
                {GOALS.map((goal) => (
                  <label
                    key={goal.id}
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 mb-2"
                  >
                    <input
                      type="radio"
                      name="modal-goal"
                      value={goal.id}
                      checked={selectedGoal === goal.id}
                      onChange={(e) => setSelectedGoal(e.target.value)}
                      className="mr-3"
                    />
                    <span>{goal.icon}</span>
                    <span className="ml-2 text-sm">{goal.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Duration
                </label>
                <div className="flex gap-2">
                  {[7, 14, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setSelectedDuration(days)}
                      className={`px-4 py-2 rounded font-medium transition ${
                        selectedDuration === days
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  generatePlanMutation.mutate();
                  setShowCreateModal(false);
                }}
                disabled={generatePlanMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {generatePlanMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}