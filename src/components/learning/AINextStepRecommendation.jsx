import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, MessageSquare, TrendingUp, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AINextStepRecommendation({ user }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completedContent, setCompletedContent] = useState({ sermons: [], plans: [], courses: [] });

  useEffect(() => {
    if (user) {
      fetchCompletedContent();
    }
  }, [user]);

  const fetchCompletedContent = async () => {
    try {
      // Get user's completed study plans
      const plans = await base44.entities.StudyPlan.filter(
        { user_id: user.id, status: 'completed' },
        '-updated_date',
        10
      );

      // Get user's course progress
      const progress = await base44.entities.UserProgress.filter(
        { user_id: user.id },
        '-updated_date',
        20
      );
      const completedCourses = progress.filter(p => p.completion_percentage === 100);

      // Get saved sermons (proxy for engagement)
      const collections = await base44.entities.SermonCollection.filter(
        { user_id: user.id },
        '-updated_date',
        5
      );

      setCompletedContent({
        sermons: collections.flatMap(c => c.sermon_ids || []),
        plans,
        courses: completedCourses
      });
    } catch (error) {
      console.error('Error fetching completed content:', error);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const userContext = {
        interests: user.interests || [],
        theological_stance: user.theological_stance || 'evangelical',
        ministry_focus: user.ministry_focus || [],
        reading_level: user.preferred_reading_level || 'medium',
        completedPlans: completedContent.plans.map(p => ({
          title: p.title,
          topics: p.topics,
          duration: p.duration_days
        })),
        completedCourseCount: completedContent.courses.length,
        savedSermonCount: completedContent.sermons.length
      };

      const prompt = `Based on this user's learning history and preferences, recommend 5 specific next steps for their faith journey:

User Profile:
- Interests: ${userContext.interests.join(', ')}
- Theological Stance: ${userContext.theological_stance}
- Ministry Focus: ${userContext.ministry_focus.join(', ')}
- Reading Level: ${userContext.reading_level}
- Completed Study Plans: ${userContext.completedPlans.map(p => p.title).join(', ')}
- Completed Courses: ${userContext.completedCourseCount}
- Engaged with ${userContext.savedSermonCount} sermons

Provide diverse recommendations across:
1. New study topics to explore
2. Advanced theological concepts to deepen understanding
3. Practical ministry applications
4. Community engagement opportunities
5. Scripture memorization or deeper Bible study

Return as JSON array with: title, description, type (study_plan, course, sermon_topic, community), difficulty, estimated_duration, why_recommended`;

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
                  difficulty: { type: 'string' },
                  estimated_duration: { type: 'string' },
                  why_recommended: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setRecommendations(response.recommendations || []);
      toast.success('Personalized recommendations generated');
    } catch (error) {
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'study_plan': return <TrendingUp className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'sermon_topic': return <MessageSquare className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI-Powered Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Get personalized recommendations for your next learning steps
            </p>
            <Button onClick={generateRecommendations} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Your Journey...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Recommendations
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Based on your learning history and preferences
              </p>
              <Button variant="outline" size="sm" onClick={generateRecommendations} disabled={loading}>
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <Card key={idx} className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(rec.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                        <p className="text-xs text-gray-600 italic mb-3">
                          💡 {rec.why_recommended}
                        </p>
                        <div className="flex gap-2 flex-wrap items-center">
                          <Badge variant="outline" className="capitalize">
                            {rec.type?.replace('_', ' ')}
                          </Badge>
                          <Badge className={getDifficultyColor(rec.difficulty)}>
                            {rec.difficulty}
                          </Badge>
                          {rec.estimated_duration && (
                            <Badge variant="secondary">
                              {rec.estimated_duration}
                            </Badge>
                          )}
                          <Button size="sm" className="ml-auto" variant="ghost">
                            Explore
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}