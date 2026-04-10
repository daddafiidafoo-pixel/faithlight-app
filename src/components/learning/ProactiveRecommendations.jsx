import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Clock, Target, AlertCircle, BookOpen, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function ProactiveRecommendations({ userId, maxRecommendations = 3 }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      generateRecommendations().catch(err => {
        console.error('[ProactiveRecommendations] Error:', err);
        setIsLoading(false);
      });
    }
  }, [userId]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      // Fetch recent activity with error handling
      const [quizResults, progress, metrics] = await Promise.all([
        base44.entities.UserQuizResult.filter({ user_id: userId }, '-created_date', 10).catch(() => []),
        base44.entities.UserProgress.filter({ user_id: userId }, '-updated_date', 20).catch(() => []),
        base44.entities.UserLearningMetrics.filter({ user_id: userId }, '-recorded_at', 30).catch(() => [])
      ]);

      // Analyze data to generate recommendations
      const recs = [];

      // 1. Low quiz scores → recommend review
      const recentLowScores = quizResults.filter(q => q.score < 70);
      if (recentLowScores.length > 0) {
        const topics = [...new Set(recentLowScores.map(q => q.topic).filter(Boolean))];
        recs.push({
          type: 'review',
          priority: 'high',
          title: 'Review Struggling Topics',
          description: `You scored below 70% on ${topics.length} topic(s). Review to strengthen understanding.`,
          action: 'Review Now',
          icon: AlertCircle,
          color: 'red',
          topics: topics.slice(0, 3)
        });
      }

      // 2. Incomplete lessons → encourage completion
      const incomplete = progress.filter(p => !p.is_completed && p.progress_percent > 50);
      if (incomplete.length > 0) {
        recs.push({
          type: 'complete',
          priority: 'medium',
          title: 'Finish What You Started',
          description: `You have ${incomplete.length} lesson(s) over 50% complete. Finish them for points!`,
          action: 'Continue Learning',
          icon: Target,
          color: 'blue',
          lessonIds: incomplete.slice(0, 3).map(p => p.lesson_id)
        });
      }

      // 3. Time patterns → suggest optimal study time
      const timeMetrics = metrics.filter(m => m.metric_type === 'engagement_score' && m.metadata?.time_of_day);
      if (timeMetrics.length > 5) {
        const timeOfDayScores = {};
        timeMetrics.forEach(m => {
          const time = m.metadata.time_of_day;
          if (!timeOfDayScores[time]) timeOfDayScores[time] = [];
          timeOfDayScores[time].push(m.metric_value);
        });
        
        const bestTime = Object.keys(timeOfDayScores).reduce((best, time) => {
          const avg = timeOfDayScores[time].reduce((sum, v) => sum + v, 0) / timeOfDayScores[time].length;
          const bestAvg = timeOfDayScores[best] 
            ? timeOfDayScores[best].reduce((sum, v) => sum + v, 0) / timeOfDayScores[best].length 
            : 0;
          return avg > bestAvg ? time : best;
        });

        const now = new Date().getHours();
        const isOptimalTime = 
          (bestTime === 'morning' && now >= 6 && now < 12) ||
          (bestTime === 'afternoon' && now >= 12 && now < 18) ||
          (bestTime === 'evening' && now >= 18 && now < 24);

        if (isOptimalTime) {
          recs.push({
            type: 'timing',
            priority: 'low',
            title: 'Perfect Study Time!',
            description: `You're most engaged during the ${bestTime}. Great time to learn!`,
            action: 'Start Studying',
            icon: Clock,
            color: 'green'
          });
        }
      }

      // 4. Streak bonus → encourage consistency
      const recentActivity = progress.filter(p => {
        const daysSince = (Date.now() - new Date(p.updated_date).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 1;
      });
      
      if (recentActivity.length === 0) {
        const daysSinceLastActivity = progress.length > 0 
          ? (Date.now() - new Date(progress[0].updated_date).getTime()) / (1000 * 60 * 60 * 24)
          : 999;
        
        if (daysSinceLastActivity > 2 && daysSinceLastActivity < 7) {
          recs.push({
            type: 'streak',
            priority: 'medium',
            title: 'Keep Your Streak Alive',
            description: `It's been ${Math.floor(daysSinceLastActivity)} days since your last lesson. Don't break the habit!`,
            action: 'Resume Learning',
            icon: TrendingUp,
            color: 'orange'
          });
        }
      }

      // 5. AI-generated personalized suggestion (only if there's actual data)
      if (quizResults.length >= 3 && progress.length >= 3) {
        try {
          const aiRec = await base44.integrations.Core.InvokeLLM({
            prompt: `Based on this learner's recent activity, suggest ONE highly personalized next step.

Recent Quiz Scores: ${quizResults.map(q => `${q.topic}: ${q.score}%`).join(', ')}
Recent Progress: ${progress.slice(0, 5).map(p => `${p.lesson_id}: ${p.progress_percent}%`).join(', ')}

Provide JSON:
{
  "title": "short catchy title",
  "description": "why this is perfect for them now (1 sentence)",
  "action": "action button text"
}`,
            response_json_schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                action: { type: 'string' }
              }
            }
          });

          recs.push({
            type: 'ai_suggestion',
            priority: 'high',
            title: aiRec.title,
            description: aiRec.description,
            action: aiRec.action,
            icon: Sparkles,
            color: 'purple'
          });
        } catch (error) {
          console.error('Failed to generate AI recommendation:', error);
        }
      }

      // Sort by priority and limit
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      
      setRecommendations(recs.slice(0, maxRecommendations));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 bg-gray-200 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900'
  };

  const iconColors = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Recommended For You</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, idx) => {
          const Icon = rec.icon;
          return (
            <Card key={idx} className={`border ${colorClasses[rec.color]}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white">
                    <Icon className={`w-5 h-5 ${iconColors[rec.color]}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    {rec.priority === 'high' && (
                      <Badge className="mt-1 bg-red-600 text-xs">High Priority</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm">{rec.description}</p>
                
                {rec.topics && (
                  <div className="flex flex-wrap gap-1">
                    {rec.topics.map(topic => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}

                <Link to={createPageUrl('PersonalizedLearningPath')}>
                  <Button size="sm" className="w-full gap-2" variant="outline">
                    {rec.action}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}