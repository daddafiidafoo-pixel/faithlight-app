import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, BookOpen, Users, Target, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function NextStepsRecommendation({ user, completedPath }) {
  const [recommendations, setRecommendations] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: allCourses = [] } = useQuery({
    queryKey: ['published-courses-next'],
    queryFn: () => base44.entities.Course.filter({ published: true })
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress-next', user?.id],
    queryFn: () => base44.entities.UserProgress.filter({ user_id: user.id }),
    enabled: !!user
  });

  const { data: userInterests = [] } = useQuery({
    queryKey: ['user-interests-next', user?.id],
    queryFn: () => base44.entities.UserInterest.filter({ user_id: user.id }),
    enabled: !!user
  });

  const { data: learningMetrics = [] } = useQuery({
    queryKey: ['learning-metrics-next', user?.id],
    queryFn: () => base44.entities.UserLearningMetrics.filter({ user_id: user.id }, '-recorded_at', 50),
    enabled: !!user
  });

  const generateNextSteps = async () => {
    setIsGenerating(true);
    try {
      const completedCourseIds = userProgress.filter(p => p.completed).map(p => p.course_id);
      const topInterests = userInterests
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5)
        .map(i => i.interest_value)
        .join(', ');

      const struggleAreas = learningMetrics
        .filter(m => m.metric_type === 'struggle_area')
        .map(m => m.metadata?.topic)
        .filter(Boolean)
        .slice(0, 3)
        .join(', ');

      const completedTopics = completedPath?.topics?.join(', ') || '';
      const profile = user?.comprehensive_profile || {};

      const prompt = `Based on this user's learning journey, recommend their next steps:

COMPLETED PATH:
- Title: ${completedPath?.title || 'Recent study'}
- Topics: ${completedTopics}
- Duration: ${completedPath?.duration_days || 0} days

USER PROFILE:
- Spiritual Goals: ${profile.spiritual_goals?.join(', ') || 'General growth'}
- Learning Goals: ${profile.learning_goals?.join(', ') || 'General learning'}
- Theological Interests: ${profile.theological_interests?.join(', ') || 'General theology'}
- Preferred Depth: ${profile.preferred_content_depth || 'medium'}

LEARNING HISTORY:
- Top Interests: ${topInterests || 'General biblical studies'}
- Completed Courses: ${completedCourseIds.length}
- Struggle Areas: ${struggleAreas || 'None identified'}
- Available Courses: ${allCourses.slice(0, 10).map(c => c.title).join(', ')}

Generate 4-5 personalized next steps with:
1. Natural progression from what they just completed
2. Address any struggle areas with targeted recommendations
3. Align with their goals and interests
4. Mix of different learning modalities (courses, study groups, mentorship, etc.)

Return JSON:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  type: { type: 'string' },
                  reason: { type: 'string' },
                  actionable_step: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setRecommendations(response.recommendations || []);
    } catch (error) {
      toast.error('Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    if (completedPath && user) {
      generateNextSteps();
    }
  }, [completedPath, user]);

  const typeIcons = {
    course: BookOpen,
    group: Users,
    mentor: Users,
    study_plan: Target,
    default: TrendingUp
  };

  const typeLinks = {
    course: 'ExploreCourses',
    group: 'DiscoverGroups',
    mentor: 'FindMentor',
    study_plan: 'StudyPlans'
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          What's Next for Your Journey?
        </CardTitle>
        <p className="text-sm text-gray-600">
          Continue growing with these personalized recommendations
        </p>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
            <p className="text-sm text-gray-600">Analyzing your journey...</p>
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, idx) => {
              const Icon = typeIcons[rec.type] || typeIcons.default;
              const linkPage = typeLinks[rec.type] || 'Home';

              return (
                <div key={idx} className="bg-white rounded-lg p-4 border border-green-200 hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Icon className="w-5 h-5 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {rec.type}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          💡 {rec.reason}
                        </p>
                      </div>
                      <Link to={createPageUrl(linkPage)}>
                        <Button size="sm" variant="outline" className="gap-2">
                          {rec.actionable_step}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Button onClick={generateNextSteps} className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            Get Next Steps
          </Button>
        )}
      </CardContent>
    </Card>
  );
}