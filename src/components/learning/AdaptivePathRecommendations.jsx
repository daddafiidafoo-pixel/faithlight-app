import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Sparkles, BookOpen, Zap, TrendingUp, Loader2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdaptivePathRecommendations({ userId, onModuleSelect }) {
  const [recommendations, setRecommendations] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adaptiveRecommendations', userId],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateAdaptiveRecommendations', {
        userId
      });
      return response.data;
    },
    enabled: !!userId
  });

  useEffect(() => {
    if (data?.recommendations) {
      setRecommendations(data.recommendations);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p className="text-gray-600">Analyzing your learning profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError || !recommendations) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-600">
          Unable to generate recommendations at this time.
        </CardContent>
      </Card>
    );
  }

  const userProfile = data?.userProfile || {};

  return (
    <div className="space-y-8">
      {/* User Profile Summary */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Your Learning Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest">Spiritual Level</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">Level {userProfile.spiritualLevel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest">Learning Pace</p>
              <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                {userProfile.learningPace}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest">Avg Quiz Score</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {userProfile.averageQuizScore}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest">Preferred Style</p>
              <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                {userProfile.teachingStyle}
              </p>
            </div>
          </div>

          {/* Strengths & Struggles */}
          <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
            <div>
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                ✓ Your Strengths
              </h4>
              <div className="space-y-1">
                {userProfile.strengths && userProfile.strengths.length > 0 ? (
                  userProfile.strengths.map((strength, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                      {strength}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Keep exploring to identify strengths</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                ⚡ Areas to Strengthen
              </h4>
              <div className="space-y-1">
                {userProfile.strugglingAreas && userProfile.strugglingAreas.length > 0 ? (
                  userProfile.strugglingAreas.map((area, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-amber-100 text-amber-800">
                      {area}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Great job! Stay consistent to grow</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'All Recommendations' },
          { value: 'modules', label: 'Course Modules' },
          { value: 'sermonTopic', label: 'Sermon Topics' },
          { value: 'paths', label: 'Learning Paths' }
        ].map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === cat.value
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Module Recommendations */}
      {(selectedCategory === 'all' || selectedCategory === 'modules') && recommendations.modules && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Recommended Modules
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.modules.map((module, idx) => (
              <Card
                key={idx}
                className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
                style={{
                  borderLeftColor:
                    module.priority === 'high' ? '#DC2626' : '#F59E0B'
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    </div>
                    <Badge
                      variant={module.priority === 'high' ? 'destructive' : 'secondary'}
                      className="ml-2 flex-shrink-0"
                    >
                      {module.priority === 'high' ? '🔥 High' : '📌 Medium'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700">
                    <strong>Why:</strong> {module.reason}
                  </p>
                  {module.modules && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Topics:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.modules.map((m, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {module.estimatedLength && (
                    <p className="text-xs text-gray-600">⏱️ {module.estimatedLength}</p>
                  )}
                  <Button className="w-full gap-2 mt-2" onClick={() => onModuleSelect?.(module)}>
                    Start Learning
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sermon Topic Suggestions */}
      {(selectedCategory === 'all' || selectedCategory === 'sermonTopic') && recommendations.sermonTopics && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-600" />
            Personalized Sermon Topics
          </h3>
          <p className="text-gray-600">
            Based on your theological interests and teaching preferences:
          </p>
          <div className="grid gap-3">
            {recommendations.sermonTopics.map((sermon, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{sermon.topic}</h4>
                      {sermon.theme && (
                        <p className="text-sm text-gray-600 mt-1">Theme: {sermon.theme}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {sermon.style && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {sermon.style}
                          </Badge>
                        )}
                        {sermon.audience && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {sermon.audience}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Link to={createPageUrl('SermonBuilder')}>
                      <Button size="sm" className="gap-2">
                        Create
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Learning Path Suggestions */}
      {(selectedCategory === 'all' || selectedCategory === 'paths') && recommendations.learningPaths && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Suggested Learning Paths
          </h3>
          <div className="grid gap-4">
            {recommendations.learningPaths.map((path, idx) => (
              <Card
                key={idx}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{path.name}</h4>
                      <p className="text-gray-700 mt-2">{path.description}</p>
                      <div className="flex gap-6 mt-3 text-sm text-gray-600">
                        {path.courses && (
                          <span>📚 {path.courses} courses</span>
                        )}
                        {path.estimatedWeeks && (
                          <span>⏳ ~{path.estimatedWeeks} weeks</span>
                        )}
                      </div>
                      <p className="text-sm text-green-700 font-medium mt-2">
                        ✓ {path.reason}
                      </p>
                    </div>
                    <Button className="gap-2 flex-shrink-0">
                      Explore
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}