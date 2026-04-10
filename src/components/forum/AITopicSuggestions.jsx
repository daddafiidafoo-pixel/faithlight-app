import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AITopicSuggestions({ userId, limit = 5 }) {
  // Fetch suggested topics based on user activity
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['ai-topic-suggestions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Fetch user's forum activity
      const userTopics = await base44.entities.ForumTopic.filter({
        created_by_user_id: userId,
      }, '-created_date', 20);

      if (userTopics.length === 0) return [];

      // Extract topics user has engaged with
      const userInterestTags = new Set();
      userTopics.forEach(topic => {
        if (topic.tags) {
          topic.tags.forEach(tag => userInterestTags.add(tag));
        }
      });

      // Find similar topics
      const allTopics = await base44.entities.ForumTopic.filter({
        is_pinned: false,
      }, '-reply_count', 50);

      const suggestions = allTopics
        .filter(topic => !topic.created_by_user_id?.includes(userId))
        .map(topic => {
          let relevanceScore = 0;

          // Match by tags
          if (topic.tags) {
            const matchingTags = topic.tags.filter(tag => userInterestTags.has(tag));
            relevanceScore += matchingTags.length * 30;
          }

          // Trending topics
          if (topic.reply_count > 10) {
            relevanceScore += 20;
          }

          return {
            ...topic,
            relevanceScore,
          };
        })
        .filter(t => t.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      return suggestions;
    },
    enabled: !!userId,
  });

  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Suggested for You
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-indigo-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map(topic => (
              <Link
                key={topic.id}
                to={createPageUrl(`ForumTopic?id=${topic.id}`)}
                className="block"
              >
                <div className="p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all">
                  <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                    {topic.title}
                  </h4>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      {topic.reply_count || 0} replies
                    </span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                  </div>

                  {topic.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {topic.tags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}