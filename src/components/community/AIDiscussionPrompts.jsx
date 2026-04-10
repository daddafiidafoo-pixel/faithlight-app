import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

export default function AIDiscussionPrompts({ topic = 'general', onSelectPrompt }) {
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generatePrompts = async () => {
    setIsLoading(true);
    try {
      // Try to get user profile for personalization
      let userProfile = null;
      try {
        userProfile = await base44.auth.me();
      } catch (error) {
        // User not logged in, use default prompts
      }

      const profileContext = userProfile?.comprehensive_profile ? `

USER PROFILE CONTEXT (personalize to this):
- Spiritual Goals: ${userProfile.comprehensive_profile.spiritual_goals?.join(', ') || 'General growth'}
- Areas for Growth: ${userProfile.comprehensive_profile.areas_of_growth?.join(', ') || 'General'}
- Theological Interests: ${userProfile.comprehensive_profile.theological_interests?.join(', ') || 'General'}
- Content Depth: ${userProfile.comprehensive_profile.preferred_content_depth || 'medium'}` : '';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 4 thoughtful discussion prompts for a Christian learning community forum.

Topic focus: ${topic}${profileContext}

Requirements:
1. Questions should encourage deep biblical reflection
2. Be respectful and inclusive of different perspectives
3. Promote constructive dialogue
4. Be specific enough to generate meaningful discussion
5. Relate to practical Christian living
${profileContext ? '6. Address the user\'s growth areas and interests where relevant' : ''}

Return JSON array:`,
        response_json_schema: {
          type: 'object',
          properties: {
            prompts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  category: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setPrompts(response.prompts || []);
    } catch (error) {
      console.error('Failed to generate prompts:', error);
      // Fallback prompts
      setPrompts([
        {
          question: 'How has your understanding of grace deepened through recent study?',
          category: 'Theology',
          description: 'Share personal insights on grace'
        },
        {
          question: 'What biblical passage has challenged you most this week?',
          category: 'Scripture',
          description: 'Discuss challenging verses'
        },
        {
          question: 'How do you practice hospitality as described in Romans 12:13?',
          category: 'Practical Faith',
          description: 'Apply Scripture to daily life'
        },
        {
          question: 'What questions do you have about prayer and spiritual disciplines?',
          category: 'Spiritual Growth',
          description: 'Ask and learn together'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    generatePrompts();
  }, [topic]);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="w-5 h-5" />
            AI Discussion Starters
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generatePrompts}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && prompts.length === 0 ? (
          <p className="text-center text-gray-600 py-4">Generating prompts...</p>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 border border-purple-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    {prompt.category}
                  </Badge>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{prompt.question}</h4>
                <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                {onSelectPrompt && (
                  <Button
                    size="sm"
                    onClick={() => onSelectPrompt(prompt)}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Start Discussion
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}