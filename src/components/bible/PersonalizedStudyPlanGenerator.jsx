import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudyPlanWizard from './StudyPlanWizard';

export default function PersonalizedStudyPlanGenerator({ currentUser, isDarkMode }) {
  const queryClient = useQueryClient();

  // Fetch existing study plans
  const { data: studyPlans = [] } = useQuery({
    queryKey: ['studyPlans', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      return base44.entities.StudyPlan.filter({ user_id: currentUser.id }, '-created_date', 5);
    },
    enabled: !!currentUser
  });

  if (!currentUser) {
    return (
      <p className="text-xs text-gray-500">Login to generate personalized study plans</p>
    );
  }

  return (
    <div className="space-y-3">
      <StudyPlanWizard currentUser={currentUser} isDarkMode={isDarkMode} />

      {studyPlans.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Your Study Plans</h4>
          {studyPlans.map(plan => (
            <Card key={plan.id} style={{
              backgroundColor: isDarkMode ? '#1A1F1C' : '#F9FAFB',
              borderColor: isDarkMode ? '#2A2F2C' : '#E5E7EB'
            }}>
              <CardContent className="pt-4">
                <p className="text-sm font-semibold">{plan.title}</p>
                <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {plan.duration_days} days • {plan.progress_percentage || 0}% complete
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.location.href = `/StudyPlans?planId=${plan.id}`;
                    }}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}