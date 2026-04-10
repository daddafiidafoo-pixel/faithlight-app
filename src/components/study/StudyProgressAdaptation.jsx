import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StudyProgressAdaptation({ plan, user }) {
  const [showAdaptation, setShowAdaptation] = useState(false);
  const [adaptation, setAdaptation] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const analyzeProgressMutation = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      try {
        const userProgress = await base44.entities.UserProgress.filter({
          user_id: user.id
        });

        const completedLessons = userProgress.filter(p => p.completed).length;
        const averageScore = userProgress.length > 0
          ? (userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length).toFixed(1)
          : 0;

        const prompt = `Analyze this study plan progress and suggest adaptations:

PLAN: ${plan.title}
PROGRESS: ${plan.progress_percentage}% complete
DURATION: ${plan.duration_days} days
TOPICS: ${plan.topics?.join(', ')}

USER PROGRESS:
- Completed lessons: ${completedLessons}
- Average score: ${averageScore}%
- Topics covered: ${plan.topics?.slice(0, 3).join(', ')}

Based on this progress, suggest:
1. Pace adjustments (speed up, slow down, or maintain)
2. Content recommendations (what to focus on next)
3. Areas of strength to build on
4. Challenging areas that need more support
5. Suggested practical activities or projects

Format as JSON with keys: pace_recommendation, next_focus, strengths, challenges, activities`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              pace_recommendation: { type: 'string' },
              next_focus: { type: 'string' },
              strengths: { type: 'array', items: { type: 'string' } },
              challenges: { type: 'array', items: { type: 'string' } },
              activities: { type: 'array', items: { type: 'string' } }
            }
          }
        });

        setAdaptation(response);
        
        // Save adaptation to plan
        const currentAdaptations = plan.adaptations || [];
        await base44.entities.StudyPlan.update(plan.id, {
          adaptations: [
            ...currentAdaptations,
            {
              timestamp: new Date().toISOString(),
              ...response
            }
          ]
        });

        toast.success('Study plan adapted based on your progress!');
        queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      } finally {
        setAnalyzing(false);
      }
    }
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => {
          analyzeProgressMutation.mutate();
          setShowAdaptation(true);
        }}
      >
        <TrendingUp className="w-4 h-4" />
        Adapt Plan
      </Button>

      <Dialog open={showAdaptation} onOpenChange={setShowAdaptation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your Study Plan Adapted</DialogTitle>
          </DialogHeader>

          {analyzing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="ml-2">Analyzing your progress...</span>
            </div>
          ) : adaptation ? (
            <div className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Pace Recommendation</h4>
                      <p className="text-blue-800 text-sm mt-1">{adaptation.pace_recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Next Focus Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{adaptation.next_focus}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Your Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {adaptation.strengths?.map((strength, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-green-600">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Areas to Focus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {adaptation.challenges?.map((challenge, idx) => (
                        <li key={idx} className="flex gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {adaptation.activities?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recommended Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {adaptation.activities.map((activity, idx) => (
                        <li key={idx} className="list-disc list-inside">{activity}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={() => setShowAdaptation(false)}
                className="w-full"
              >
                Got it, Let's Continue
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}