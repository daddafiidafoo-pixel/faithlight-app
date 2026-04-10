import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function AISermonRecommendation({ sermons, onSermonSelect, userContext }) {
  const [userNeed, setUserNeed] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const findRelevantSermons = async () => {
    if (!userNeed.trim()) {
      toast.error('Please describe what you need');
      return;
    }

    setIsAnalyzing(true);
    try {
      const sermonSummaries = sermons.slice(0, 50).map(s => ({
        id: s.id,
        title: s.title || 'Untitled',
        topic: s.topic || '',
        passage: s.passage_references || '',
        summary: s.summary || '',
        style: s.style || 'teaching',
        tags: s.tags || []
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `A user needs sermon help. Find the most relevant sermons from our library.

USER'S NEED:
${userNeed}

USER CONTEXT:
${userContext ? `- Current study: ${userContext.currentStudy || 'N/A'}
- Interests: ${userContext.interests?.join(', ') || 'N/A'}
- Ministry role: ${userContext.role || 'N/A'}` : 'No additional context'}

AVAILABLE SERMONS:
${JSON.stringify(sermonSummaries, null, 2)}

Analyze the user's need and recommend 3-5 most relevant sermons. Consider:
1. Topic alignment with user's stated need
2. Passage relevance
3. Style appropriateness
4. Contextual fit with user's background

Return JSON:`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sermon_id: { type: 'string' },
                  relevance_score: { type: 'number' },
                  reason: { type: 'string' },
                  how_to_use: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setRecommendations(response.recommendations || []);
      toast.success('Found relevant sermons!');
    } catch (error) {
      toast.error('Failed to analyze');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSermonById = (id) => sermons.find(s => s.id === id);

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Sermon Finder
        </CardTitle>
        <p className="text-sm text-gray-600">
          Tell us what you need, and we'll find the perfect sermon
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="E.g., 'I'm preaching on forgiveness next Sunday' or 'Need a youth-friendly message about faith' or 'Looking for expository teaching on Romans 8'"
          value={userNeed}
          onChange={(e) => setUserNeed(e.target.value)}
          rows={3}
        />

        <Button
          onClick={findRelevantSermons}
          disabled={isAnalyzing || !userNeed.trim()}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Find Sermons
            </>
          )}
        </Button>

        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="font-semibold text-sm">Recommended for You:</h4>
            {recommendations.map((rec, idx) => {
              const sermon = getSermonById(rec.sermon_id);
              if (!sermon) return null;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition cursor-pointer"
                  onClick={() => onSermonSelect && onSermonSelect(sermon)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-gray-900">{sermon.title}</h5>
                    <Badge className="bg-indigo-100 text-indigo-800">
                      {Math.round(rec.relevance_score * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <BookOpen className="w-3 h-3 inline mr-1" />
                    {sermon.passage_references}
                  </p>
                  <p className="text-xs text-indigo-700 mb-2">
                    💡 {rec.reason}
                  </p>
                  <p className="text-xs text-gray-500">
                    ✅ {rec.how_to_use}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}