import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { BookOpen, ChevronDown, ChevronUp, Zap, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function GeneratedStudyPlanViewer({ plan, onStartPlan }) {
  const [expandedDays, setExpandedDays] = useState({});
  const [completedDays, setCompletedDays] = useState({});
  const queryClient = useQueryClient();

  const toggleDayExpanded = (day) => {
    setExpandedDays((prev) => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const markDayComplete = (day) => {
    setCompletedDays((prev) => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const updateProgressMutation = useMutation({
    mutationFn: async () => {
      const completedCount = Object.values(completedDays).filter(Boolean).length;
      const progressPercentage = (completedCount / (plan.daily_plan?.length || 1)) * 100;
      
      return base44.entities.StudyPlan.update(plan.id, {
        progress_percentage: Math.round(progressPercentage),
        status: completedCount === plan.daily_plan?.length ? 'completed' : 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlans'] });
    }
  });

  const handleSaveProgress = () => {
    updateProgressMutation.mutate();
  };

  if (!plan || !plan.daily_plan) {
    return <div className="text-center py-8 text-gray-500">No study plan data available</div>;
  }

  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / plan.daily_plan.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{plan.title}</CardTitle>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Your Progress</span>
                  <span className="text-indigo-600 font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                {plan.duration_days} Days
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Daily Breakdown */}
      <div className="space-y-3">
        {plan.daily_plan.map((day) => {
          const isExpanded = expandedDays[day.day];
          const isCompleted = completedDays[day.day];

          return (
            <Card key={day.day} className={`transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
              <button
                onClick={() => toggleDayExpanded(day.day)}
                className="w-full text-left"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {isCompleted ? '✓' : `${day.day}`}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{day.title}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <BookOpen className="w-3 h-3" />
                          {day.scripture_reading}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="border-t border-gray-200 pt-4 space-y-4">
                  {/* Commentary */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Commentary
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-sm">{day.commentary}</p>
                  </div>

                  {/* Reflection Questions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-600" />
                      Reflection Questions
                    </h4>
                    <ul className="space-y-2">
                      {day.reflection_questions?.map((question, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex gap-3">
                          <span className="text-amber-600 font-semibold flex-shrink-0">{idx + 1}.</span>
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actionable Insight */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Actionable Insight
                    </h4>
                    <p className="text-sm text-green-800">{day.actionable_insight}</p>
                  </div>

                  {/* Mark Complete Button */}
                  <Button
                    onClick={() => markDayComplete(day.day)}
                    variant={isCompleted ? 'default' : 'outline'}
                    className={`w-full gap-2 ${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-lg">
        <Button
          onClick={handleSaveProgress}
          disabled={updateProgressMutation.isPending}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          {updateProgressMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Progress'
          )}
        </Button>
        {onStartPlan && (
          <Button onClick={onStartPlan} variant="outline" className="flex-1">
            Add to My Plans
          </Button>
        )}
      </div>

      {/* Completion Message */}
      {progressPercentage === 100 && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-center">
          <p className="text-green-900 font-semibold mb-2">🎉 Congratulations!</p>
          <p className="text-green-800 text-sm">You've completed this entire study plan. Consider starting a new one!</p>
        </div>
      )}
    </div>
  );
}