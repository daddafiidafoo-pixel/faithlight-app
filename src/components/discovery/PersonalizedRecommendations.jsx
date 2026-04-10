import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';

/**
 * Personalized course recommendations powered by AI
 * Based on user progress, interests, and engagement
 */
export default function PersonalizedRecommendations({ userId }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['personalized-recommendations', userId],
    queryFn: async () => {
      const response = await base44.functions.invoke(
        'generatePersonalizedRecommendations',
        { user_id: userId }
      );
      return response.data.recommendations || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-600 mt-2">Analyzing your learning path...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg">Recommended For You</CardTitle>
        </div>
        <p className="text-xs text-gray-600 mt-1">Personalized based on your progress & interests</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isExpanded ? (
          // Collapsed view - show first recommendation
          <div className="space-y-3">
            {recommendations.slice(0, 1).map((rec, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      {rec.title}
                    </h3>
                    <p className="text-sm text-gray-700 mt-2">{rec.reason}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Level {rec.level}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        ~{rec.estimatedHours}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsExpanded(true)}
            >
              See all {recommendations.length} recommendations
            </Button>
          </div>
        ) : (
          // Expanded view - show all recommendations
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  {rec.title}
                </h3>
                <p className="text-sm text-gray-700 mt-2">{rec.reason}</p>
                <div className="bg-blue-50 rounded p-3 mt-3 border-l-2 border-blue-400">
                  <p className="text-xs font-semibold text-gray-900 mb-1">Why This Matters:</p>
                  <p className="text-xs text-gray-700">{rec.alignment}</p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Level {rec.level}
                  </Badge>
                  <span className="text-xs text-gray-600">~{rec.estimatedHours}h</span>
                </div>
                <Button className="w-full mt-3 text-xs">Start Course</Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsExpanded(false)}
            >
              Show less
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}