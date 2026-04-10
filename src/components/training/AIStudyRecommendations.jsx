import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, BookOpen, Zap } from 'lucide-react';

export default function AIStudyRecommendations({ courseId, userId, userName }) {
  // Fetch all engagement metrics for the course
  const { data: engagementMetrics = [] } = useQuery({
    queryKey: ['course-engagement', courseId, userId],
    queryFn: async () => {
      if (!courseId || !userId) return [];
      return await base44.entities.LessonEngagementMetric.filter({
        course_id: courseId,
        user_id: userId,
      }, '-time_spent_seconds');
    },
    enabled: !!courseId && !!userId,
  });

  // Fetch quiz performance
  const { data: quizResults = [] } = useQuery({
    queryKey: ['quiz-results', courseId, userId],
    queryFn: async () => {
      if (!courseId || !userId) return [];
      return await base44.entities.UserQuizResult.filter({
        course_id: courseId,
        user_id: userId,
      }, '-created_date');
    },
    enabled: !!courseId && !!userId,
  });

  // Calculate recommendations based on performance
  const recommendations = React.useMemo(() => {
    const recs = [];

    if (engagementMetrics.length === 0) {
      return [
        {
          type: 'start',
          icon: BookOpen,
          title: 'Get Started',
          message: 'Begin with the first lesson to track your progress and get personalized recommendations.',
          priority: 'high',
        }
      ];
    }

    // Low engagement detection
    const lowEngagement = engagementMetrics.filter(m => m.time_spent_seconds < 300);
    if (lowEngagement.length > engagementMetrics.length * 0.5) {
      recs.push({
        type: 'engagement',
        icon: Zap,
        title: 'Increase Engagement',
        message: `You're spending less than 5 minutes on lessons. Try spending more time to better understand complex concepts.`,
        priority: 'high',
      });
    }

    // Incomplete lessons
    const incompleted = engagementMetrics.filter(m => !m.completed);
    if (incompleted.length > 0) {
      recs.push({
        type: 'completion',
        icon: AlertCircle,
        title: 'Complete In-Progress Lessons',
        message: `You have ${incompleted.length} incomplete lesson(s). Finishing them will help solidify your understanding.`,
        priority: 'high',
      });
    }

    // Quiz performance
    if (quizResults.length > 0) {
      const avgScore = Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length);

      if (avgScore < 70) {
        recs.push({
          type: 'quiz-performance',
          icon: TrendingUp,
          title: 'Review Weak Areas',
          message: `Your average quiz score is ${avgScore}%. Review lessons you struggled with and ask your tutor for clarification.`,
          priority: 'high',
        });
      } else {
        recs.push({
          type: 'excel',
          icon: TrendingUp,
          title: 'You\'re Excelling!',
          message: `Great work! Your average quiz score is ${avgScore}%. Keep up the momentum and challenge yourself with advanced topics.`,
          priority: 'low',
        });
      }
    }

    // Study strategy
    const completedCount = engagementMetrics.filter(m => m.completed).length;
    if (completedCount > 2) {
      recs.push({
        type: 'strategy',
        icon: BookOpen,
        title: 'Spaced Repetition',
        message: 'Review previous lessons periodically to retain what you\'ve learned and build on your knowledge.',
        priority: 'medium',
      });
    }

    return recs.length > 0 ? recs : [{
      type: 'general',
      icon: TrendingUp,
      title: 'Keep Learning',
      message: 'You\'re making good progress. Continue with the next lesson when ready.',
      priority: 'low',
    }];
  }, [engagementMetrics, quizResults]);

  const priorityColors = {
    high: 'border-l-4 border-red-500 bg-red-50',
    medium: 'border-l-4 border-yellow-500 bg-yellow-50',
    low: 'border-l-4 border-green-500 bg-green-50',
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Personalized Study Recommendations
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">AI-powered suggestions based on your learning patterns</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {recommendations.map((rec, idx) => {
          const IconComponent = rec.icon;
          return (
            <div key={idx} className={`p-4 rounded-lg ${priorityColors[rec.priority]}`}>
              <div className="flex items-start gap-3">
                <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <Badge className={priorityBadgeColors[rec.priority]}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{rec.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}