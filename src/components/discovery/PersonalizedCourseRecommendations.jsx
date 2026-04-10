import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function PersonalizedCourseRecommendations({ userId, limit = 4 }) {
  // Fetch recommendations for user
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['course-recommendations', userId],
    queryFn: async () => {
      if (!userId) return [];
      const recs = await base44.entities.CourseRecommendation.filter({
        user_id: userId,
        dismissed: false,
        enrolled: false,
      }, '-confidence_score', limit);
      return recs;
    },
    enabled: !!userId,
  });

  // Fetch course details for recommendations
  const { data: courseDetails = {} } = useQuery({
    queryKey: ['recommendation-courses', recommendations.map(r => r.course_id).join(',')],
    queryFn: async () => {
      if (recommendations.length === 0) return {};

      const courses = await Promise.all(
        recommendations.map(rec =>
          base44.entities.TrainingCourse.filter({ id: rec.course_id }, '-created_date', 1)
            .then(results => ({ [rec.course_id]: results[0] }))
        )
      );

      return courses.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    enabled: recommendations.length > 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No recommendations yet. Complete more courses to get personalized suggestions!</p>
        </CardContent>
      </Card>
    );
  }

  const reasonLabels = {
    similar_tags: '🏷️ Based on interests',
    complementary_learning_path: '📚 Complements your learning path',
    trending_in_category: '🔥 Trending in your interests',
    user_interests: '💡 Matches your interests',
    prerequisite_completion: '✅ Ready for next step',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-bold text-gray-900">Recommended For You</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map(rec => {
          const course = courseDetails[rec.course_id];

          return (
            <Card key={rec.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                {/* Course Info */}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {rec.course_title}
                  </h3>

                  {course?.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {course.description}
                    </p>
                  )}

                  {/* Confidence Score */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${rec.confidence_score}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {Math.round(rec.confidence_score)}%
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    {reasonLabels[rec.reason] || rec.reason}
                  </Badge>
                </div>

                {/* Matching Tags */}
                {rec.matching_tags?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Matching interests:</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.matching_tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {rec.matching_tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{rec.matching_tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Enroll Button */}
                <Link
                  to={createPageUrl(`TrainingCourse?id=${rec.course_id}`)}
                  className="block"
                >
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Explore Course
                    <ArrowRight className="w-4 h-4 ml-2" />
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