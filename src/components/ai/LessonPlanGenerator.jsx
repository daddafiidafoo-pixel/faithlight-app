import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LessonPlanGenerator({ topic, objectives, onLessonGenerated }) {
  const [lessonTitle, setLessonTitle] = useState('');
  const [scriptureReferences, setScriptureReferences] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateLesson = async () => {
    if (!lessonTitle.trim()) {
      setError('Please provide a lesson title');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert educational content creator. Generate detailed lesson content based on:

Lesson Title: ${lessonTitle}
Course Context: ${topic || 'General educational content'}
Learning Objectives: ${objectives || 'To understand the material'}
${scriptureReferences ? `Scripture References: ${scriptureReferences}` : ''}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Create comprehensive lesson content with:
1. A 2-3 sentence introduction
2. Main learning content (3-4 key sections with explanations)
3. 3-5 key takeaways
4. Discussion questions (3-4)
5. Practice assignment description

Format as JSON:
{
  "introduction": "string",
  "sections": [
    {
      "title": "string",
      "content": "string"
    }
  ],
  "keyTakeaways": ["string"],
  "discussionQuestions": ["string"],
  "practiceAssignment": "string",
  "estimatedTime": number
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            introduction: { type: 'string' },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                },
              },
            },
            keyTakeaways: { type: 'array', items: { type: 'string' } },
            discussionQuestions: { type: 'array', items: { type: 'string' } },
            practiceAssignment: { type: 'string' },
            estimatedTime: { type: 'number' },
          },
        },
      });

      setGeneratedContent(response.data);
    } catch (err) {
      setError('Failed to generate lesson content. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyContent = () => {
    const text = JSON.stringify(generatedContent, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseContent = () => {
    if (onLessonGenerated) {
      onLessonGenerated({
        title: lessonTitle,
        content: generatedContent.sections
          .map((s) => `## ${s.title}\n${s.content}`)
          .join('\n\n'),
        scriptureReferences,
        objectives: generatedContent.keyTakeaways,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          AI Lesson Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedContent ? (
          <>
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">
                Lesson Title *
              </label>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g., Understanding Parables in Matthew"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">
                Scripture References (Optional)
              </label>
              <Input
                value={scriptureReferences}
                onChange={(e) => setScriptureReferences(e.target.value)}
                placeholder="e.g., Matthew 13:1-23, Mark 4:1-34"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">
                Additional Context (Optional)
              </label>
              <Textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any specific aspects, teaching style preferences, or additional details..."
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerateLesson}
              disabled={isGenerating || !lessonTitle.trim()}
              className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Content
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Generated Content Preview */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-gray-700">{generatedContent.introduction}</p>
              </div>

              <div className="space-y-3">
                {generatedContent.sections?.map((section, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      {section.title}
                    </h4>
                    <p className="text-xs text-gray-700 line-clamp-3">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {generatedContent.keyTakeaways && (
                <div className="border rounded-lg p-3 bg-blue-50">
                  <p className="font-semibold text-sm text-blue-900 mb-2">
                    Key Takeaways
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    {generatedContent.keyTakeaways.slice(0, 3).map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedContent.discussionQuestions && (
                <div className="border rounded-lg p-3 bg-purple-50">
                  <p className="font-semibold text-sm text-purple-900 mb-2">
                    Discussion Questions
                  </p>
                  <ul className="text-xs text-purple-800 space-y-1">
                    {generatedContent.discussionQuestions.slice(0, 2).map((q, idx) => (
                      <li key={idx}>• {q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setGeneratedContent(null)}
                className="flex-1"
              >
                Generate Again
              </Button>
              <Button
                onClick={handleCopyContent}
                variant="outline"
                className="flex-1 gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                onClick={handleUseContent}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              >
                Use Content
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}