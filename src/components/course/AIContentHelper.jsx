import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';

export default function AIContentHelper({ type = 'outline', onContentGenerated, initialPrompt = '' }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const prompts = {
    outline: {
      label: 'Generate Lesson Outline',
      placeholder: 'e.g., "Jesus calming the storm" or "Matthew 8:23-27"',
      instruction: 'Create a detailed, structured lesson outline with clear sections and learning objectives. Include key points, discussion prompts, and learning outcomes.',
    },
    questions: {
      label: 'Suggest Discussion Questions',
      placeholder: 'e.g., "Lesson about faith during trials" or "John 14:1-6"',
      instruction: 'Generate 5-8 thought-provoking discussion questions that encourage deep reflection and personal application. Include a mix of comprehension, analysis, and application questions.',
    },
    refine: {
      label: 'Refine Description/Title',
      placeholder: 'Paste your lesson title or description here',
      instruction: 'Improve clarity, engagement, and appeal without changing the core meaning. Make it more compelling and clear for students.',
    },
  };

  const currentPrompt = prompts[type];

  const generateContent = async () => {
    if (!prompt.trim()) {
      setError('Please enter something to work with');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      let fullPrompt = '';

      if (type === 'outline') {
        fullPrompt = `${currentPrompt.instruction}\n\nTopic/Scripture: ${prompt}`;
      } else if (type === 'questions') {
        fullPrompt = `${currentPrompt.instruction}\n\nLesson Topic: ${prompt}`;
      } else if (type === 'refine') {
        fullPrompt = `${currentPrompt.instruction}\n\nOriginal text: ${prompt}`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: type === 'outline' || type === 'questions',
      });

      setResult(response);
      if (onContentGenerated) {
        onContentGenerated(response);
      }
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error('AI generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <CardTitle>{currentPrompt.label}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={currentPrompt.placeholder}
          rows={3}
          className="resize-none"
          disabled={loading}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={generateContent}
          disabled={loading || !prompt.trim()}
          className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-800">Generated</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-1"
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
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-[400px] overflow-y-auto">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                {result}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}