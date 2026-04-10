import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdaptiveLearningEngine({ userId, currentPathId, isDarkMode }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [struggles, setStruggles] = useState([]);
  const [nextDifficulty, setNextDifficulty] = useState(null);

  const analyzePerformance = async () => {
    if (!userId || !currentPathId) return;
    
    setAnalyzing(true);
    try {
      // Fetch user's recent quiz results
      const quizResults = await base44.entities.UserQuizResult.filter(
        { user_id: userId },
        '-created_date',
        10
      );

      // Fetch user's lesson engagement
      const engagement = await base44.entities.UserProgress.filter(
        { user_id: userId },
        '-created_date',
        20
      );

      // Calculate metrics
      const avgScore = quizResults.length > 0 
        ? quizResults.reduce((sum, r) => sum + (r.score || 0), 0) / quizResults.length
        : 0;

      const completionRate = engagement.length > 0
        ? (engagement.filter(e => e.is_completed).length / engagement.length) * 100
        : 0;

      // Find struggling areas
      const strugglingQuizzes = quizResults.filter(r => r.score < 70);
      const topicStruggles = [...new Set(strugglingQuizzes.map(r => r.topic || 'General'))];

      setStruggles(topicStruggles);

      // Generate AI recommendation for difficulty adjustment
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an adaptive learning system. Analyze this learner's performance and provide recommendations.

LEARNER METRICS:
- Average Quiz Score: ${avgScore.toFixed(1)}%
- Lesson Completion Rate: ${completionRate.toFixed(1)}%
- Struggling Areas: ${topicStruggles.join(', ') || 'None identified'}
- Recent Quiz Count: ${quizResults.length}

Based on these metrics, provide a JSON response with:
{
  "nextDifficulty": "beginner|intermediate|advanced",
  "reasonForChange": "brief explanation",
  "estimatedMasteryTime": "X weeks",
  "focusAreas": ["topic1", "topic2"]
}`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            nextDifficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            reasonForChange: { type: 'string' },
            estimatedMasteryTime: { type: 'string' },
            focusAreas: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setNextDifficulty(response);
      setRecommendation(response);
      toast.success('Learning path analyzed!');
    } catch (error) {
      console.error('Error analyzing performance:', error);
      toast.error('Failed to analyze learning path');
    } finally {
      setAnalyzing(false);
    }
  };

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  return (
    <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
          <TrendingUp className="w-5 h-5" style={{ color: primaryColor }} />
          Adaptive Learning Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p style={{ color: mutedColor }} className="text-sm">
          AI analyzes your quiz performance and engagement to personalize your learning pace.
        </p>

        <Button
          onClick={analyzePerformance}
          disabled={analyzing}
          className="w-full gap-2"
          style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Performance...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze My Progress
            </>
          )}
        </Button>

        {struggles.length > 0 && (
          <div
            className="p-4 rounded-lg flex gap-3"
            style={{ backgroundColor: isDarkMode ? '#1A2820' : '#FEF3C7', borderColor }}
          >
            <AlertCircle
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: '#F59E0B' }}
            />
            <div>
              <p style={{ color: textColor }} className="font-semibold text-sm mb-1">
                Areas to Focus On
              </p>
              <div className="flex flex-wrap gap-2">
                {struggles.map(topic => (
                  <span
                    key={topic}
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {recommendation && (
          <div className="space-y-3">
            <div style={{ backgroundColor: bgColor, borderRadius: '8px', padding: '12px', borderColor, border: `1px solid ${borderColor}` }}>
              <p style={{ color: mutedColor }} className="text-xs mb-1">RECOMMENDED DIFFICULTY</p>
              <p style={{ color: textColor }} className="font-bold capitalize">
                {recommendation.nextDifficulty}
              </p>
            </div>

            <div style={{ backgroundColor: bgColor, borderRadius: '8px', padding: '12px', borderColor, border: `1px solid ${borderColor}` }}>
              <p style={{ color: mutedColor }} className="text-xs mb-1">MASTERY TIMELINE</p>
              <p style={{ color: textColor }} className="font-bold">
                {recommendation.estimatedMasteryTime}
              </p>
            </div>

            <div style={{ backgroundColor: bgColor, borderRadius: '8px', padding: '12px', borderColor, border: `1px solid ${borderColor}` }}>
              <p style={{ color: mutedColor }} className="text-xs mb-2">WHY THIS LEVEL?</p>
              <p style={{ color: textColor }} className="text-sm">
                {recommendation.reasonForChange}
              </p>
            </div>

            {recommendation.focusAreas && recommendation.focusAreas.length > 0 && (
              <div style={{ backgroundColor: bgColor, borderRadius: '8px', padding: '12px', borderColor, border: `1px solid ${borderColor}` }}>
                <p style={{ color: mutedColor }} className="text-xs mb-2">FOCUS ON THESE TOPICS</p>
                <ul style={{ color: textColor }} className="text-sm space-y-1">
                  {recommendation.focusAreas.map(area => (
                    <li key={area}>• {area}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}