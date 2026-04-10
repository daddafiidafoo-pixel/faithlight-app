import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader, Sparkles, BookMarked, Link as LinkIcon, Video, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AISupplementaryResources({ lessonTitle, lessonContent, scriptureReferences = [] }) {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState(null);
  const [error, setError] = useState('');

  const generateResources = async () => {
    if (!lessonContent) {
      setError('No lesson content available');
      return;
    }

    setLoading(true);
    setError('');
    setResources(null);

    try {
      const scriptureContext = scriptureReferences?.length > 0 
        ? `\n\nKey Scripture References: ${scriptureReferences.join(', ')}` 
        : '';

      const prompt = `You are an expert Bible education curator for FaithLight learning platform.

Based on this lesson, suggest 5-7 high-quality supplementary resources for deeper study:

**Lesson Title:** ${lessonTitle}

**Content Summary:**
${lessonContent.substring(0, 1000)}...${scriptureContext}

Provide resources in these categories:
1. Related Bible passages (other verses/chapters to study)
2. Theological books or commentaries (real or representative)
3. Video resources or documentaries
4. Study tools (concordances, Bible dictionaries, etc.)
5. Related lessons or topics to explore
6. Practical application exercises

For each resource, provide:
- Type (article, video, book, tool, lesson, exercise)
- Title
- Brief description (1-2 sentences)
- Why it's relevant to this lesson
- Difficulty level (beginner, intermediate, advanced)

Return a JSON object with:
{
  "resources": [
    {
      "type": "video|book|article|tool|lesson|exercise",
      "title": "Resource title",
      "description": "Brief description",
      "relevance": "Why this is relevant",
      "difficulty": "beginner|intermediate|advanced",
      "category": "scripture|commentary|video|tools|lessons|practice"
    }
  ],
  "summary": "2-3 sentence summary of the resource recommendations"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            resources: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  relevance: { type: 'string' },
                  difficulty: { type: 'string' },
                  category: { type: 'string' },
                },
              },
            },
            summary: { type: 'string' },
          },
        },
      });

      setResources(result);
      toast.success('Resources generated successfully');
    } catch (err) {
      setError(`Failed to generate resources: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'book':
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'tool':
        return <BookMarked className="w-4 h-4" />;
      case 'lesson':
        return <BookMarked className="w-4 h-4" />;
      case 'exercise':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LinkIcon className="w-5 h-5" />
          Supplementary Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!resources ? (
          <>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <Button
              onClick={generateResources}
              disabled={loading}
              className="w-full gap-2"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Finding Resources...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" />
                  Find Resources
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
              {resources.summary}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {resources.resources?.map((resource, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-gray-600">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                          {resource.title}
                        </h4>
                        <Badge className={`text-xs flex-shrink-0 ${getDifficultyColor(resource.difficulty)}`}>
                          {resource.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                      <p className="text-xs text-blue-700 italic">
                        💡 {resource.relevance}
                      </p>
                      {resource.category && (
                        <Badge variant="outline" className="text-xs mt-2">
                          {resource.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setResources(null)}
              variant="outline"
              className="w-full text-sm"
            >
              Find Different Resources
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}