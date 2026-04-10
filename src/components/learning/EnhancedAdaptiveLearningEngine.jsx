import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, AlertCircle, Clock, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedAdaptiveLearningEngine({ userId, currentPathId, onPathAdjusted }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [adaptiveScore, setAdaptiveScore] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [struggles, setStruggles] = useState([]);
  const [studyPatterns, setStudyPatterns] = useState(null);

  // Calculate comprehensive adaptive score
  const calculateAdaptiveScore = async () => {
    if (!userId) return null;

    setAnalyzing(true);
    try {
      // Fetch all data with error handling
      const [quizResults, progress, metrics] = await Promise.all([
        base44.entities.UserQuizResult.filter({ user_id: userId }, '-created_date', 20).catch(() => []),
        base44.entities.UserProgress.filter({ user_id: userId }, '-updated_date', 30).catch(() => []),
        base44.entities.UserLearningMetrics.filter({ user_id: userId }, '-recorded_at', 50).catch(() => [])
      ]);

      // Calculate Quiz Weight (avg score)
      const avgQuizScore = quizResults.length > 0
        ? quizResults.reduce((sum, r) => sum + (r.score || 0), 0) / quizResults.length
        : 50;

      // Calculate Completion Rate
      const completionRate = progress.length > 0
        ? (progress.filter(p => p.is_completed).length / progress.length) * 100
        : 0;

      // Calculate Time Efficiency (flag if too fast or too slow)
      const timeMetrics = metrics.filter(m => m.metric_type === 'time_spent');
      const avgTimePerLesson = timeMetrics.length > 0
        ? timeMetrics.reduce((sum, m) => sum + m.metric_value, 0) / timeMetrics.length
        : 20;
      
      const timeEfficiencyPenalty = avgTimePerLesson < 5 ? -10 : (avgTimePerLesson > 60 ? -5 : 0);

      // Detect Struggle Areas (repeated failures)
      const struggleMetrics = metrics.filter(m => m.metric_type === 'struggle_area');
      const uniqueStruggles = [...new Set(struggleMetrics.map(m => m.metadata?.topic).filter(Boolean))];
      const strugglePenalty = uniqueStruggles.length * -3;

      setStruggles(uniqueStruggles);

      // Detect Study Patterns (consistency bonus)
      const engagementMetrics = metrics.filter(m => m.metric_type === 'engagement_score');
      const avgEngagement = engagementMetrics.length > 0
        ? engagementMetrics.reduce((sum, m) => sum + m.metric_value, 0) / engagementMetrics.length
        : 50;
      
      const consistencyBonus = avgEngagement > 70 ? 10 : 0;

      // Final Adaptive Score Formula
      const quizWeight = 0.4;
      const completionWeight = 0.3;
      const engagementWeight = 0.2;
      const timeWeight = 0.1;

      const finalScore = 
        (quizWeight * avgQuizScore) +
        (completionWeight * completionRate) +
        (engagementWeight * avgEngagement) +
        (timeWeight * Math.min(avgTimePerLesson, 100)) +
        timeEfficiencyPenalty +
        strugglePenalty +
        consistencyBonus;

      const scoreData = {
        finalScore: Math.max(0, Math.min(100, finalScore)),
        quizAvg: avgQuizScore,
        completionRate,
        avgTimePerLesson,
        avgEngagement,
        strugglesCount: uniqueStruggles.length,
        breakdown: {
          quizContribution: quizWeight * avgQuizScore,
          completionContribution: completionWeight * completionRate,
          engagementContribution: engagementWeight * avgEngagement,
          penalties: timeEfficiencyPenalty + strugglePenalty,
          bonuses: consistencyBonus
        }
      };

      setAdaptiveScore(scoreData);

      // Analyze study patterns
      const patternData = analyzeStudyPatterns(metrics);
      setStudyPatterns(patternData);

      // Generate AI recommendation
      await generateRecommendation(scoreData, patternData, uniqueStruggles);

      return scoreData;
    } catch (error) {
      console.error('Error calculating adaptive score:', error);
      toast.error('Failed to calculate adaptive score');
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  // Analyze study patterns
  const analyzeStudyPatterns = (metrics) => {
    const timeOfDayData = {};
    const sessionDurations = [];
    const topicRevisits = {};

    metrics.forEach(m => {
      if (m.metadata?.time_of_day) {
        timeOfDayData[m.metadata.time_of_day] = (timeOfDayData[m.metadata.time_of_day] || 0) + 1;
      }
      if (m.metadata?.session_duration_minutes) {
        sessionDurations.push(m.metadata.session_duration_minutes);
      }
      if (m.metadata?.topic && m.metadata?.revisit_count) {
        topicRevisits[m.metadata.topic] = m.metadata.revisit_count;
      }
    });

    const preferredTime = Object.keys(timeOfDayData).reduce((a, b) => 
      timeOfDayData[a] > timeOfDayData[b] ? a : b, 'morning'
    );

    const avgSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length
      : 0;

    return {
      preferredTime,
      avgSessionDuration,
      topicRevisits,
      sessionCount: sessionDurations.length
    };
  };

  // Generate AI-powered recommendation
  const generateRecommendation = async (scoreData, patternData, struggles) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an adaptive learning AI. Analyze this learner's comprehensive data and provide personalized path adjustments.

ADAPTIVE SCORE: ${scoreData.finalScore.toFixed(1)}/100

PERFORMANCE BREAKDOWN:
- Quiz Average: ${scoreData.quizAvg.toFixed(1)}%
- Completion Rate: ${scoreData.completionRate.toFixed(1)}%
- Avg Time/Lesson: ${scoreData.avgTimePerLesson.toFixed(1)} min
- Engagement Score: ${scoreData.avgEngagement.toFixed(1)}%
- Struggle Areas: ${struggles.length} topics

STUDY PATTERNS:
- Preferred Study Time: ${patternData.preferredTime}
- Avg Session Duration: ${patternData.avgSessionDuration.toFixed(1)} min
- Total Sessions: ${patternData.sessionCount}
- Topic Revisits: ${Object.keys(patternData.topicRevisits).length} topics

STRUGGLING TOPICS:
${struggles.map(s => `- ${s}`).join('\n') || 'None'}

Provide a JSON response with adaptive recommendations:
{
  "nextDifficulty": "beginner|intermediate|advanced",
  "paceAdjustment": "slow_down|maintain|speed_up",
  "focusAreas": ["area1", "area2"],
  "interventionStrategy": "detailed strategy",
  "estimatedMasteryTime": "X weeks/months",
  "confidenceLevel": 1-10,
  "personalizedMessage": "encouraging message"
}`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            nextDifficulty: { type: 'string' },
            paceAdjustment: { type: 'string' },
            focusAreas: { type: 'array', items: { type: 'string' } },
            interventionStrategy: { type: 'string' },
            estimatedMasteryTime: { type: 'string' },
            confidenceLevel: { type: 'number' },
            personalizedMessage: { type: 'string' }
          }
        }
      });

      setRecommendation(response);
      
      if (onPathAdjusted) {
        onPathAdjusted(response);
      }

      toast.success('Learning path personalized!');
    } catch (error) {
      console.error('Error generating recommendation:', error);
    }
  };

  return (
    <Card className="border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          AI Adaptive Learning Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Analyzes quiz scores, time patterns, completion rates, and struggle areas to personalize your path.
        </p>

        <Button
          onClick={calculateAdaptiveScore}
          disabled={analyzing}
          className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Your Learning...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Personalize My Path
            </>
          )}
        </Button>

        {/* Adaptive Score Display */}
        {adaptiveScore && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Your Adaptive Score</span>
                <Badge className="bg-indigo-600">
                  {adaptiveScore.finalScore.toFixed(0)}/100
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${adaptiveScore.finalScore}%` }}
                />
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-600">Quiz Avg</span>
                </div>
                <p className="font-bold text-blue-900">{adaptiveScore.quizAvg.toFixed(0)}%</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">Completion</span>
                </div>
                <p className="font-bold text-green-900">{adaptiveScore.completionRate.toFixed(0)}%</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-gray-600">Avg Time</span>
                </div>
                <p className="font-bold text-orange-900">{adaptiveScore.avgTimePerLesson.toFixed(0)}m</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-gray-600">Struggles</span>
                </div>
                <p className="font-bold text-purple-900">{adaptiveScore.strugglesCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Struggle Areas */}
        {struggles.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-900">Areas Needing Focus</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {struggles.map(topic => (
                <Badge key={topic} variant="outline" className="bg-white border-amber-300 text-amber-800">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Study Patterns */}
        {studyPatterns && (
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
            <p className="font-semibold text-indigo-900 mb-2">📊 Your Study Patterns</p>
            <div className="space-y-1 text-sm text-indigo-800">
              <p>• Best Study Time: <strong>{studyPatterns.preferredTime}</strong></p>
              <p>• Avg Session: <strong>{studyPatterns.avgSessionDuration.toFixed(0)} minutes</strong></p>
              <p>• Total Sessions: <strong>{studyPatterns.sessionCount}</strong></p>
            </div>
          </div>
        )}

        {/* AI Recommendation */}
        {recommendation && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-lg">
              <p className="font-bold mb-2">🎯 Personalized Recommendation</p>
              <p className="text-sm mb-3">{recommendation.personalizedMessage}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="opacity-80">Difficulty:</span>
                  <p className="font-bold capitalize">{recommendation.nextDifficulty}</p>
                </div>
                <div>
                  <span className="opacity-80">Pace:</span>
                  <p className="font-bold capitalize">{recommendation.paceAdjustment.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">Strategy</p>
              <p className="text-sm text-gray-700">{recommendation.interventionStrategy}</p>
            </div>

            {recommendation.focusAreas?.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">Focus On</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  {recommendation.focusAreas.map(area => (
                    <li key={area}>• {area}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
              <span>Estimated Mastery: {recommendation.estimatedMasteryTime}</span>
              <span>Confidence: {recommendation.confidenceLevel}/10</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}