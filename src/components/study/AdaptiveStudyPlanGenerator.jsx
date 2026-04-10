import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import EnhancedStudyPlanForm from './EnhancedStudyPlanForm';

export default function AdaptiveStudyPlanGenerator({ user, studyProfile, open, onClose }) {
  const [step, setStep] = useState('form'); // 'form' or 'preview'
  const [formData, setFormData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const generatePlanMutation = useMutation({
    mutationFn: async (planData) => {
      if (!user) {
        throw new Error('User not found');
      }

      setGenerating(true);

      try {
        // Build enhanced AI prompt with detailed user input
        const prompt = `Create a highly personalized and adaptive Bible study plan for someone with the following specific goals and preferences:

LEARNING GOALS (Primary Focus):
${planData.goals.map(g => `- ${g}`).join('\n')}

STUDY DURATION: ${planData.duration} weeks (${planData.durationDays} days)
DAILY TIME COMMITMENT: ${planData.timePerDay} minutes per day (approximately ${planData.totalMinutes} minutes total)
PREFERRED LEARNING STYLE: ${planData.learningStyle} learner

${planData.focusAreas ? `SPECIFIC FOCUS AREAS:\n${planData.focusAreas}\n` : ''}
${planData.specificBooks ? `BOOKS TO PRIORITIZE:\n${planData.specificBooks}\n` : ''}
${planData.challenges ? `LEARNING CHALLENGES TO ADDRESS:\n${planData.challenges}\n` : ''}

Create a detailed, structured, and adaptive study plan in markdown with:

1. **Plan Title & Vision** - A compelling title that captures their goals
2. **Learning Objectives** - 5-7 clear, measurable outcomes
3. **Adaptive Framework** - How the plan adjusts based on progress
4. **Weekly Structure** (for each of the ${planData.duration} weeks):
   - Week theme/focus
   - 3-4 key biblical passages (specific book, chapter, verses)
   - ${planData.learningStyle === 'visual' ? 'Visual guides, maps, or diagrams to create' : 
      planData.learningStyle === 'auditory' ? 'Discussion questions and audio resources' :
      planData.learningStyle === 'kinesthetic' ? 'Hands-on projects and real-world applications' :
      'Deep reading materials and detailed reflection'}
   - ${planData.timePerDay} minutes of daily activities broken down
   - Reflection questions (4-5)
   - Real-world application
   
5. **Progress Checkpoints** - End-of-week assessments
6. **Adaptation Strategies** - How to modify if falling behind or progressing quickly
7. **Struggle-Area Detection** - Signs of difficulty and how to address them
8. **Supplementary Resources** - Optional materials based on their learning style
9. **Prayer & Meditation** - Spiritual practices for each week
10. **Difficulty Progression** - How concepts build week-to-week

Make it highly personalized, engaging, practical, and include built-in flexibility for different learning paces.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true
        });

        // Create study plan with adaptive features
        const planTitle = planData.goals[0] || 'Personalized Bible Study';
        await base44.entities.StudyPlan.create({
          user_id: user.id,
          title: `${planTitle} - ${planData.duration} Week Plan`,
          description: `Highly personalized ${planData.duration}-week study plan with ${planData.timePerDay} min/day commitment`,
          duration_days: planData.durationDays,
          topics: planData.goals,
          learning_style: planData.learningStyle,
          time_commitment: planData.timePerDay,
          focus_areas: planData.focusAreas,
          specific_books: planData.specificBooks,
          challenges: planData.challenges,
          generated_content: response,
          status: 'active',
          progress_percentage: 0,
          adaptations: [],
          is_adaptive: true,
          last_adapted: new Date().toISOString()
        });

        queryClient.invalidateQueries({ queryKey: ['study-plans'] });
        toast.success('Adaptive study plan created! It will adjust as you progress.');
        onClose?.();
      } finally {
        setGenerating(false);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate study plan');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' ? 'Create Adaptive Study Plan' : 'Review & Generate'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <EnhancedStudyPlanForm
            onSubmit={(data) => {
              setFormData(data);
              setStep('preview');
            }}
            isLoading={generating}
          />
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Learning Goals</label>
                    <div className="flex flex-wrap gap-2">
                      {formData?.goals.map(goal => (
                        <span key={goal} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-700">Duration</label>
                      <p className="text-gray-600">{formData?.duration} weeks ({formData?.durationDays} days)</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Daily Commitment</label>
                      <p className="text-gray-600">{formData?.timePerDay} minutes</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Learning Style</label>
                      <p className="text-gray-600 capitalize">{formData?.learningStyle}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Total Time</label>
                      <p className="text-gray-600">{(formData?.totalMinutes / 60).toFixed(1)} hours</p>
                    </div>
                  </div>

                  {formData?.focusAreas && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Focus Areas</label>
                      <p className="text-sm text-gray-600">{formData.focusAreas}</p>
                    </div>
                  )}

                  {formData?.specificBooks && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Books to Study</label>
                      <p className="text-sm text-gray-600">{formData.specificBooks}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              The AI will create an adaptive plan that adjusts based on your progress, automatically detecting struggles and recommending supplementary materials.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('form')} disabled={generating}>
                Back
              </Button>
              <Button
                onClick={() => generatePlanMutation.mutate(formData)}
                disabled={generating}
                className="flex-1 gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Adaptive Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Plan
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}