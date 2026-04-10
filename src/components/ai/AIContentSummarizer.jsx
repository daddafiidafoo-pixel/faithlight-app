import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIContentSummarizer({ content, contentType = 'text', title }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    if (!content) {
      toast.error('No content to summarize');
      return;
    }

    setLoading(true);
    try {
      const contentPreview = content.substring(0, 500);
      
      const prompt = contentType === 'lesson' 
        ? `Summarize this biblical lesson in a clear, concise way. Include:
1. Main Summary (2-3 sentences)
2. Key Takeaways (3-5 bullet points)
3. Relevant Scripture References (provide actual Bible verses if mentioned, or suggest related passages)

Lesson Content:
${content}`
        : contentType === 'discussion'
        ? `Summarize this biblical discussion/conversation. Include:
1. Discussion Summary (2-3 sentences covering the main points)
2. Key Arguments/Points (3-5 main points discussed)
3. Scripture References (any Bible verses mentioned or relevant to the discussion)

Discussion:
${content}`
        : `Summarize this biblical text. Include:
1. Text Summary (2-3 sentences)
2. Key Concepts (3-5 main ideas)
3. Relevant Scripture Cross-References

Text:
${content}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'Main summary of the content' },
            key_takeaways: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Key takeaways or main points'
            },
            scripture_references: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference: { type: 'string', description: 'Bible reference (e.g., John 3:16)' },
                  relevance: { type: 'string', description: 'How it relates to the content' }
                }
              },
              description: 'Relevant scripture references'
            }
          },
          required: ['summary', 'key_takeaways', 'scripture_references']
        }
      });

      setSummary(result);
      toast.success('Summary generated successfully');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (summary) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-amber-600" />
            AI Summary {title && `- ${title}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Summary</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {summary.summary}
            </p>
          </div>

          {/* Key Takeaways */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Key Takeaways</h3>
            <ul className="space-y-2">
              {summary.key_takeaways?.map((takeaway, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Scripture References */}
          {summary.scripture_references?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Scripture References
              </h3>
              <div className="space-y-2">
                {summary.scripture_references.map((ref, idx) => (
                  <div key={idx} className="bg-white rounded p-3 border border-amber-100">
                    <p className="font-semibold text-sm text-amber-900">{ref.reference}</p>
                    <p className="text-xs text-gray-600 mt-1">{ref.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => setSummary(null)}
              variant="outline"
              size="sm"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={generateSummary}
      disabled={loading}
      className="gap-2 bg-amber-600 hover:bg-amber-700"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating Summary...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Summarize {contentType === 'lesson' ? 'Lesson' : contentType === 'discussion' ? 'Discussion' : 'Content'}
        </>
      )}
    </Button>
  );
}