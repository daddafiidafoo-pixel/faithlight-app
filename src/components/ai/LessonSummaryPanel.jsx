import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, BookOpen, Brain, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonSummaryPanel({ lessonContent, lessonTitle }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const generateLessonSummary = async () => {
    if (!lessonContent) {
      toast.error('No lesson content to summarize');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Create a comprehensive summary of this biblical lesson. Provide:

1. Lesson Synopsis (1-2 sentences)
2. Core Concepts (3-5 main concepts taught)
3. Learning Objectives (what students should understand)
4. Key Scripture Passages (references used in the lesson)
5. Discussion Questions (2-3 reflection questions)
6. Application Points (how to apply this lesson practically)

Lesson:
${lessonContent}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            synopsis: { type: 'string' },
            core_concepts: {
              type: 'array',
              items: { type: 'string' }
            },
            learning_objectives: {
              type: 'array',
              items: { type: 'string' }
            },
            key_scripture: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                  verse_text: { type: 'string' }
                }
              }
            },
            discussion_questions: {
              type: 'array',
              items: { type: 'string' }
            },
            application_points: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['synopsis', 'core_concepts', 'learning_objectives', 'key_scripture']
        }
      });

      setSummary(result);
      setExpanded(true);
      toast.success('Lesson summary generated');
    } catch (error) {
      console.error('Error generating lesson summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={generateLessonSummary}
        disabled={loading}
        className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Summary...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Lesson Summary
          </>
        )}
      </Button>

      {summary && expanded && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Lesson Summary {lessonTitle && `- ${lessonTitle}`}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Synopsis */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Overview</h4>
              <p className="text-sm text-gray-700">{summary.synopsis}</p>
            </div>

            {/* Core Concepts */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Core Concepts</h4>
              <ul className="space-y-1">
                {summary.core_concepts?.map((concept, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-purple-600">•</span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learning Objectives */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Learning Objectives</h4>
              <ul className="space-y-1">
                {summary.learning_objectives?.map((obj, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Scripture */}
            {summary.key_scripture?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Key Scripture
                </h4>
                <div className="space-y-2">
                  {summary.key_scripture.map((ref, idx) => (
                    <div key={idx} className="bg-white rounded p-2 border border-purple-100">
                      <p className="font-semibold text-xs text-purple-900">{ref.reference}</p>
                      {ref.verse_text && (
                        <p className="text-xs text-gray-600 italic mt-1">"{ref.verse_text}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discussion Questions */}
            {summary.discussion_questions?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Reflection Questions</h4>
                <ul className="space-y-2">
                  {summary.discussion_questions.map((q, idx) => (
                    <li key={idx} className="text-sm text-gray-700 bg-white rounded p-2 border border-purple-100">
                      <span className="font-semibold text-purple-600">Q{idx + 1}:</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application Points */}
            {summary.application_points?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Application Points
                </h4>
                <ul className="space-y-1">
                  {summary.application_points.map((point, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-green-600">→</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => setExpanded(false)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Close Summary
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}