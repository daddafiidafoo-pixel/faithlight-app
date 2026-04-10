import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CourseOutlineGenerator({ onOutlineGenerated }) {
  const [topic, setTopic] = useState('');
  const [objectives, setObjectives] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [duration, setDuration] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateOutline = async () => {
    if (!topic.trim() || !objectives.trim()) {
      setError('Please provide topic and learning objectives');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert course designer. Create a detailed course outline based on the following:

Topic: ${topic}
Learning Objectives: ${objectives}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${duration ? `Estimated Duration: ${duration} hours` : ''}

Generate a structured course outline with:
1. Course Title (suggested improvement on the topic if needed)
2. 5-8 main lessons with:
   - Lesson title
   - Learning objectives (2-3 key objectives)
   - Key topics to cover
   - Estimated time per lesson
   - Assessment method

Format the response as JSON with this structure:
{
  "courseTitle": "string",
  "summary": "string",
  "lessons": [
    {
      "order": 1,
      "title": "string",
      "objectives": ["string"],
      "topics": ["string"],
      "estimatedMinutes": number,
      "assessmentType": "quiz|discussion|assignment|practical"
    }
  ]
}

Ensure the outline is practical, scripture-focused if appropriate, and achieves the stated learning objectives.`,
        response_json_schema: {
          type: 'object',
          properties: {
            courseTitle: { type: 'string' },
            summary: { type: 'string' },
            lessons: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  order: { type: 'number' },
                  title: { type: 'string' },
                  objectives: { type: 'array', items: { type: 'string' } },
                  topics: { type: 'array', items: { type: 'string' } },
                  estimatedMinutes: { type: 'number' },
                  assessmentType: { type: 'string' },
                },
              },
            },
          },
        },
      });

      setGeneratedOutline(response.data);
    } catch (err) {
      setError('Failed to generate outline. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyOutline = () => {
    const text = JSON.stringify(generatedOutline, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseOutline = () => {
    if (onOutlineGenerated) {
      onOutlineGenerated(generatedOutline);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Course Outline Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedOutline ? (
          <>
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">
                Course Topic *
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Advanced Bible Study Methods"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">
                Learning Objectives *
              </label>
              <Textarea
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="What should students be able to do after completing this course?
e.g., Understand hermeneutical principles, apply exegesis techniques, etc."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">
                  Target Audience (Optional)
                </label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Seminary students, pastors"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">
                  Duration (Hours, Optional)
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 20"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerateOutline}
              disabled={isGenerating || !topic.trim() || !objectives.trim()}
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Outline
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Generated Outline Display */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {generatedOutline.courseTitle}
                </h3>
                <p className="text-sm text-gray-700">{generatedOutline.summary}</p>
              </div>

              {/* Lessons Preview */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">
                  Suggested Lessons ({generatedOutline.lessons?.length || 0})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {generatedOutline.lessons?.map((lesson) => (
                    <div
                      key={lesson.order}
                      className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex items-start gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex-shrink-0">
                          {lesson.order}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            ⏱️ {Math.round(lesson.estimatedMinutes / 60)}h • 
                            <span className="ml-1 inline-block bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs">
                              {lesson.assessmentType}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setGeneratedOutline(null)}
                  className="flex-1"
                >
                  Generate Again
                </Button>
                <Button
                  onClick={handleCopyOutline}
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
                  onClick={handleUseOutline}
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Sparkles className="w-4 h-4" />
                  Use Outline
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}