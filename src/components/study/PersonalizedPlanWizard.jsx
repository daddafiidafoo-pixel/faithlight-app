import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalizedPlanWizard({ open, onOpenChange, onPlanGenerated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal: '',
    topics: '',
    pace: 'moderate',
    duration_weeks: 4,
    focus_areas: ''
  });

  const paceOptions = [
    { value: 'light', label: 'Light (30 min/day)', description: 'Perfect for busy schedules' },
    { value: 'moderate', label: 'Moderate (1 hour/day)', description: 'Balanced learning' },
    { value: 'intensive', label: 'Intensive (2+ hours/day)', description: 'Deep diving into topics' }
  ];

  const generatePlan = async () => {
    if (!formData.goal || !formData.topics) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Create a detailed, personalized Bible study plan with the following criteria:

Learning Goal: ${formData.goal}
Topics/Books: ${formData.topics}
Duration: ${formData.duration_weeks} weeks
Daily Time Commitment: ${paceOptions.find(p => p.value === formData.pace)?.label || formData.pace}
Focus Areas: ${formData.focus_areas || 'General comprehension and spiritual growth'}

Generate a structured study plan with:
1. Weekly breakdown (${formData.duration_weeks} weeks)
2. Daily modules (Monday-Sunday, with rest days)
3. Specific scripture passages to study each day
4. Daily learning objectives
5. Key concepts to explore
6. Reflection questions
7. Daily time allocation breakdown

Format as JSON with weeks array, each week containing daily modules.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            plan_title: { type: 'string' },
            plan_description: { type: 'string' },
            weeks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  week_number: { type: 'number' },
                  week_theme: { type: 'string' },
                  days: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        day: { type: 'string' },
                        scripture_focus: { type: 'string' },
                        topic: { type: 'string' },
                        learning_objectives: { type: 'array', items: { type: 'string' } },
                        key_concepts: { type: 'array', items: { type: 'string' } },
                        reflection_questions: { type: 'array', items: { type: 'string' } },
                        time_minutes: { type: 'number' }
                      }
                    }
                  }
                }
              }
            },
            total_hours: { type: 'number' },
            difficulty_level: { type: 'string' }
          },
          required: ['plan_title', 'plan_description', 'weeks']
        }
      });

      // Create study plan in database
      const studyPlan = await base44.entities.StudyPlan.create({
        title: result.plan_title,
        description: result.plan_description,
        goal: formData.goal,
        topics: formData.topics,
        pace: formData.pace,
        duration_weeks: formData.duration_weeks,
        focus_areas: formData.focus_areas,
        modules: result.weeks,
        status: 'active',
        progress_percentage: 0,
        total_estimated_hours: result.total_hours,
        difficulty_level: result.difficulty_level
      });

      toast.success('Study plan created successfully!');
      onPlanGenerated?.(studyPlan);
      onOpenChange(false);
      setStep(1);
      setFormData({
        goal: '',
        topics: '',
        pace: 'moderate',
        duration_weeks: 4,
        focus_areas: ''
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Create Personalized Study Plan
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Learning Goal */}
        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What's Your Learning Goal?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">Describe what you want to achieve through this study plan</p>
                <Textarea
                  placeholder="e.g., Understand the Gospel of John deeply, Learn biblical theology, Prepare for teaching..."
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="h-24"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Topics */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What Topics Interest You?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">Specific books, themes, or topics to focus on</p>
                <Textarea
                  placeholder="e.g., Gospel of John, Romans, Discipleship, Redemption, Old Testament narratives..."
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  className="h-24"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Pace & Duration */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Choose Your Learning Pace</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, pace: option.value })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      formData.pace === option.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <p className="font-semibold text-sm">{option.label}</p>
                    <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plan Duration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    max="52"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600">weeks</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Focus Areas */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Any Specific Focus Areas? (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">Add any additional focus areas or preferences</p>
                <Textarea
                  placeholder="e.g., Emphasis on practical application, historical context, theological deep-dives..."
                  value={formData.focus_areas}
                  onChange={(e) => setFormData({ ...formData, focus_areas: e.target.value })}
                  className="h-20"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={generatePlan}
              disabled={loading}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Plan
                </>
              )}
            </Button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 justify-center text-xs text-gray-500">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                s <= step ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}