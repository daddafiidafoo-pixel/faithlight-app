import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, BookOpen } from 'lucide-react';

export default function PersonalizedSermonTopics({ user, onSelectTopic }) {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateTopics = async () => {
    if (!user?.comprehensive_profile) {
      setTopics([
        { title: 'The Love of God', passage: '1 John 4:7-21', relevance: 'Foundational truth', difficulty: 'medium' },
        { title: 'Walking by Faith', passage: 'Hebrews 11', relevance: 'Practical living', difficulty: 'medium' },
        { title: 'The Power of Prayer', passage: 'James 5:13-18', relevance: 'Spiritual growth', difficulty: 'simple' },
        { title: 'Grace and Mercy', passage: 'Ephesians 2:1-10', relevance: 'Gospel essentials', difficulty: 'medium' }
      ]);
      return;
    }

    setIsLoading(true);
    const profile = user.comprehensive_profile;

    try {
      const prompt = `Based on this pastor/teacher's profile, suggest 6 sermon topics that align with their ministry:

USER PROFILE:
- Spiritual Goals: ${profile.spiritual_goals?.join(', ') || 'General growth'}
- Ministry Goals: ${profile.ministry_goals?.join(', ') || 'General ministry'}
- Areas for Growth (to teach on): ${profile.areas_of_growth?.join(', ') || 'General'}
- Theological Interests: ${profile.theological_interests?.join(', ') || 'General theology'}
- Sermon Prep Focus: ${profile.sermon_prep_focus?.join(', ') || 'General preaching'}
- Content Depth: ${profile.preferred_content_depth || 'medium'}

Generate topics that:
1. Address their ministry goals and focus areas
2. Align with their theological interests
3. Help congregants grow in areas they're passionate about
4. Match their preferred content depth
5. Are timely and relevant

Return JSON:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            topics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  passage: { type: 'string' },
                  relevance: { type: 'string' },
                  difficulty: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setTopics(response.topics || []);
    } catch (error) {
      console.error('Failed to generate topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      generateTopics();
    }
  }, [user]);

  if (!user) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Personalized Sermon Topics
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateTopics}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {user.comprehensive_profile && (
          <p className="text-xs text-gray-600 mt-1">
            Based on your ministry goals and theological interests
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topics.map((topic, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition cursor-pointer"
              onClick={() => onSelectTopic && onSelectTopic(`${topic.title} - ${topic.passage}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                <Badge variant="outline" className="text-xs">{topic.difficulty}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">{topic.passage}</span>
              </div>
              <p className="text-xs text-gray-600">{topic.relevance}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}