import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function AISummaryGenerator({ lessonTitle, lessonContent, courseId, language = 'en' }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const generateSummary = async () => {
    if (!lessonContent) {
      setError('No lesson content available to summarize');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const prompt = `You are an expert Bible teacher summarizing educational content for FaithLight, a biblical learning platform.

Summarize the following lesson in ${language === 'om' ? 'Afaan Oromo' : 'English'}:

**Lesson Title:** ${lessonTitle}

**Content:**
${lessonContent}

Create a concise summary that:
1. Captures the main theme and central message
2. Highlights 3-5 key takeaways
3. Includes 1-2 reflection questions
4. Uses clear, accessible language
5. Maintains biblical accuracy

Return a JSON object with:
{
  "title": "Summary title",
  "overview": "Brief 2-3 sentence overview",
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "reflection_questions": ["question 1", "question 2"],
  "study_tips": ["tip 1", "tip 2"]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            overview: { type: 'string' },
            key_takeaways: { type: 'array', items: { type: 'string' } },
            reflection_questions: { type: 'array', items: { type: 'string' } },
            study_tips: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      setSummary(result);
      toast.success('Summary generated successfully');
    } catch (err) {
      setError(`Failed to generate summary: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5" />
          Quick Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!summary ? (
          <>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <Button
              onClick={generateSummary}
              disabled={loading}
              className="w-full gap-2"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Summary
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">{summary.overview}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Key Takeaways</h4>
              <ul className="space-y-1">
                {summary.key_takeaways?.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700">• {item}</li>
                ))}
              </ul>
            </div>

            {summary.study_tips?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Study Tips</h4>
                <ul className="space-y-1">
                  {summary.study_tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-gray-700">💡 {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => setSummary(null)}
              variant="outline"
              className="w-full text-sm"
            >
              Generate New Summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}