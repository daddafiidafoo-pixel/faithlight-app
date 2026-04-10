import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X } from 'lucide-react';

export default function TagsSuggester({ courseTitle, description, onTagsSelected }) {
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all available tags
  const { data: availableTags = [] } = useQuery({
    queryKey: ['course-tags'],
    queryFn: async () => {
      try {
        const tags = await base44.entities.CourseTag.list();
        return tags || [];
      } catch (err) {
        console.warn('Failed to load tags:', err);
        return [];
      }
    },
  });

  const generateTags = async () => {
    if (!courseTitle.trim()) return;

    try {
      setIsLoading(true);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Given this course:
Title: ${courseTitle}
${description ? `Description: ${description}` : ''}

Suggest 5-8 relevant tags for this course. Tags should be:
- Concise (1-3 words each)
- Category/topic-based (e.g., "Bible Study", "Leadership", "Prayer", "Discipleship")
- Useful for course discovery
- Related to religious education

Return a JSON object with:
{
  "tags": ["tag1", "tag2", "tag3", ...],
  "reasoning": "Brief explanation of why these tags"
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            tags: { type: 'array', items: { type: 'string' } },
            reasoning: { type: 'string' },
          },
        },
      });

      setSuggestedTags(response.data.tags || []);
    } catch (err) {
      console.error('Failed to generate tags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseTitle && availableTags.length > 0) {
      generateTags();
    }
  }, [courseTitle]);

  const handleToggleTag = (tag) => {
    const newSelected = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newSelected);
    if (onTagsSelected) {
      onTagsSelected(newSelected);
    }
  };

  if (!courseTitle) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-blue-600" />
          AI-Suggested Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Analyzing course...</span>
          </div>
        ) : suggestedTags.length > 0 ? (
          <>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Select tags that best describe your course:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedTags.includes(tag) && <span className="mr-1">✓</span>}
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {selectedTags.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-gray-600 mb-2">Selected ({selectedTags.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="default" className="gap-1">
                      {tag}
                      <button
                        onClick={() => handleToggleTag(tag)}
                        className="ml-1 hover:opacity-75"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => generateTags()}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Sparkles className="w-3 h-3" />
              Regenerate Tags
            </Button>
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No tags generated
          </p>
        )}
      </CardContent>
    </Card>
  );
}