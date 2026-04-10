import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, CheckCircle, Lightbulb, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AIProgressAdapter({ userId, pathId }) {
  const [adaptation, setAdaptation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const { data: metrics = [] } = useQuery({
    queryKey: ['learning-metrics-adapt', userId],
    queryFn: () => base44.entities.UserLearningMetrics.filter({ user_id: userId }, '-recorded_at', 100),
    enabled: !!userId
  });

  const { data: currentPath } = useQuery({
    queryKey: ['current-path', pathId],
    queryFn: async () => {
      if (!pathId) return null;
      const results = await base44.entities.StudyPlan.filter({ id: pathId });
      return results[0] || null;
    },
    enabled: !!pathId
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['user-progress-adapt', userId],
    queryFn: () => base44.entities.UserProgress.filter({ user_id: userId }),
    enabled: !!userId
  });

  const analyzeAndAdapt = async () => {
    setIsAnalyzing(true);
    try {
      const strugglingTopics = metrics
        .filter(m => m.metric_type === 'struggle_area')
        .map(m => m.metadata?.topic)
        .filter(Boolean);

      const timeMetrics = metrics
        .filter(m => m.metric_type === 'time_spent')
        .reduce((avg, m) => avg + m.metric_value, 0) / metrics.filter(m => m.metric_type === 'time_spent').length || 0;

      const quizPerformance = metrics
        .filter(m => m.metric_type === 'quiz_performance')
        .reduce((avg, m) => avg + m.metric_value, 0) / metrics.filter(m => m.metric_type === 'quiz_performance').length || 0;

      const completionPattern = metrics
        .filter(m => m.metric_type === 'completion_pattern')
        .map(m => m.metadata?.time_of_day)
        .filter(Boolean);

      const prompt = `Analyze this user's learning data and recommend adaptations to their study path:

CURRENT PATH:
- Title: ${currentPath?.title || 'Study plan'}
- Progress: ${currentPath?.progress_percentage || 0}%
- Duration: ${currentPath?.duration_days || 0} days

LEARNING METRICS:
- Struggling with: ${strugglingTopics.join(', ') || 'No major struggles'}
- Average time per session: ${Math.round(timeMetrics)} minutes
- Average quiz performance: ${Math.round(quizPerformance)}%
- Most active time: ${completionPattern[0] || 'Various times'}
- Completed lessons: ${progress.filter(p => p.completed).length}

USER PROFILE:
- Goals: ${currentPath?.topics?.join(', ') || 'General'}

Generate specific adaptations:
1. Pace adjustment (speed up/slow down/maintain)
2. Content difficulty adjustment
3. Additional resources for struggle areas
4. Study schedule optimization
5. Motivational insights

Return JSON:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            pace_recommendation: { type: 'string' },
            difficulty_adjustment: { type: 'string' },
            struggle_area_support: {
              type: 'array',
              items: { type: 'string' }
            },
            schedule_suggestion: { type: 'string' },
            motivational_insight: { type: 'string' },
            recommended_actions: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setAdaptation(response);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze progress');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAdaptation = async () => {
    if (!adaptation || !currentPath || !currentPath.id) return;

    try {
      const updates = {};
      
      if (adaptation.pace_recommendation?.includes('slow down')) {
        updates.duration_days = Math.round((currentPath.duration_days || 21) * 1.3);
      } else if (adaptation.pace_recommendation?.includes('speed up')) {
        updates.duration_days = Math.round((currentPath.duration_days || 21) * 0.8);
      }

      if (Object.keys(updates).length > 0) {
        await base44.entities.StudyPlan.update(currentPath.id, updates);
        queryClient.invalidateQueries(['current-path']);
        toast.success('Path adapted to your progress!');
      } else {
        toast.info('No pace adjustments needed');
      }
    } catch (error) {
      console.error('Adaptation error:', error);
      toast.error('Failed to apply adaptations');
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          AI Progress Adaptation
        </CardTitle>
        <p className="text-sm text-gray-600">
          Get personalized adjustments based on your learning patterns
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!adaptation ? (
          <Button
            onClick={analyzeAndAdapt}
            disabled={isAnalyzing}
            className="w-full gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze My Progress
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Pace Recommendation</h4>
              </div>
              <p className="text-sm text-gray-700">{adaptation.pace_recommendation}</p>
            </div>

            {adaptation.struggle_area_support?.length > 0 && (
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <h4 className="font-semibold text-sm">Support Resources</h4>
                </div>
                <ul className="space-y-1">
                  {adaptation.struggle_area_support.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <h4 className="font-semibold text-sm">Study Schedule</h4>
              </div>
              <p className="text-sm text-gray-700">{adaptation.schedule_suggestion}</p>
            </div>

            {adaptation.motivational_insight && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-900 italic">
                  💡 {adaptation.motivational_insight}
                </p>
              </div>
            )}

            {adaptation.recommended_actions?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Recommended Actions:</h4>
                {adaptation.recommended_actions.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {action}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={applyAdaptation} size="sm" className="flex-1">
                Apply Adjustments
              </Button>
              <Button onClick={analyzeAndAdapt} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}