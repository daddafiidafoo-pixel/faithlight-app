import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Heart, Copy, User } from 'lucide-react';
import { toast } from 'sonner';

export default function SharedStudyPlansList({ groupId, user }) {
  const queryClient = useQueryClient();

  const { data: sharedPlans = [], isLoading } = useQuery({
    queryKey: ['shared-study-plans', groupId],
    queryFn: () => base44.entities.SharedStudyPlan.filter({ group_id: groupId }, '-created_date'),
    enabled: !!groupId
  });

  const copyStudyPlanMutation = useMutation({
    mutationFn: async (sharedPlan) => {
      // Create a new study plan for the user based on the shared one
      const newPlan = await base44.entities.StudyPlan.create({
        user_id: user.id,
        title: `${sharedPlan.title} (from ${groupId})`,
        description: sharedPlan.description,
        duration_days: sharedPlan.plan_data.duration_days,
        topics: sharedPlan.plan_data.topics,
        daily_goals: sharedPlan.plan_data.daily_goals,
        status: 'active'
      });

      // Increment copies count
      await base44.entities.SharedStudyPlan.update(sharedPlan.id, {
        copies_count: (sharedPlan.copies_count || 0) + 1
      });

      return newPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shared-study-plans']);
      queryClient.invalidateQueries(['study-plans']);
      toast.success('Study plan copied to your collection!');
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sharedPlans.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No study plans shared yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Be the first to share a study plan with the group!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sharedPlans.map(plan => (
        <Card key={plan.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  {plan.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  {plan.plan_data?.duration_days || 0} days
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Copy className="w-4 h-4" />
                  {plan.copies_count || 0}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Heart className="w-4 h-4" />
                  {plan.likes_count || 0}
                </div>
              </div>
              <Button
                onClick={() => copyStudyPlanMutation.mutate(plan)}
                disabled={copyStudyPlanMutation.isPending}
                size="sm"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy to My Plans
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
              <User className="w-3 h-3" />
              Shared by member
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}