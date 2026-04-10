import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, Lightbulb, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function IllustrationSuggester() {
  const [topic, setTopic] = useState('');
  const [mainPoint, setMainPoint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [illustrations, setIllustrations] = useState([]);

  const generateIllustrations = async () => {
    if (!topic.trim() && !mainPoint.trim()) {
      toast.error('Please enter a topic or main point');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Generate 5 diverse sermon illustrations for the following:

Topic: ${topic || 'General'}
Main Point: ${mainPoint}

For each illustration, provide:
1. Type (Story, Analogy, Current Event, Historical Event, or Personal Experience)
2. The Illustration (2-3 paragraphs, vivid and engaging)
3. Application Connection (how it relates to the sermon point)
4. Source/Citation (if applicable)

Make the illustrations:
- Relatable to modern audiences
- Culturally appropriate
- Clear and memorable
- Emotionally engaging
- Theologically sound

Include a mix of:
- Contemporary stories or current events
- Historical examples
- Biblical parallels from other passages
- Real-life analogies
- Hypothetical scenarios

Format as a JSON array with this structure:
[
  {
    "type": "Story",
    "title": "Brief title",
    "illustration": "Full illustration text...",
    "application": "How this connects to the sermon point...",
    "source": "Source if applicable"
  }
]`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            illustrations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  illustration: { type: "string" },
                  application: { type: "string" },
                  source: { type: "string" }
                }
              }
            }
          }
        }
      });

      setIllustrations(result.illustrations || []);
      toast.success('Illustrations generated!');
    } catch (error) {
      console.error('Failed to generate illustrations:', error);
      toast.error('Failed to generate illustrations');
    } finally {
      setIsLoading(false);
    }
  };

  const generateApplicationPoints = async () => {
    if (!topic.trim() && !mainPoint.trim()) {
      toast.error('Please enter a topic or main point');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Generate 5 practical application points for a sermon on:

Topic: ${topic || 'General'}
Main Point: ${mainPoint}

For each application point, provide:
1. Clear, actionable statement
2. Specific steps or examples
3. Why it matters
4. Common obstacles and how to overcome them

Make applications:
- Specific and actionable (not vague)
- Relevant to different life stages
- Challenging but achievable
- Rooted in scripture
- Practical for daily life

Format as a JSON array:
[
  {
    "type": "Application",
    "title": "Brief title",
    "illustration": "Full application description with steps...",
    "application": "Why this matters and obstacles to consider...",
    "source": "Supporting scripture"
  }
]`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            illustrations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  illustration: { type: "string" },
                  application: { type: "string" },
                  source: { type: "string" }
                }
              }
            }
          }
        }
      });

      setIllustrations(result.illustrations || []);
      toast.success('Application points generated!');
    } catch (error) {
      console.error('Failed to generate applications:', error);
      toast.error('Failed to generate application points');
    } finally {
      setIsLoading(false);
    }
  };

  const copyIllustration = (illustration) => {
    const text = `${illustration.title}\n\n${illustration.illustration}\n\nApplication: ${illustration.application}\n\nSource: ${illustration.source || 'N/A'}`;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Illustration & Application Suggester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Sermon Topic</Label>
          <Input
            placeholder="e.g., Faith, Prayer, Love"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div>
          <Label>Main Point or Message</Label>
          <Textarea
            placeholder="e.g., God's grace is available to everyone, regardless of their past"
            value={mainPoint}
            onChange={(e) => setMainPoint(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={generateIllustrations}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Get Illustrations
              </>
            )}
          </Button>

          <Button 
            onClick={generateApplicationPoints}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            Get Applications
          </Button>
        </div>

        {illustrations.length > 0 && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Suggestions</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={generateIllustrations}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>

            {illustrations.map((ill, idx) => (
              <Card key={idx} className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ill.type}</Badge>
                      <h4 className="font-semibold">{ill.title}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyIllustration(ill)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
                    {ill.illustration}
                  </p>
                  
                  <div className="bg-indigo-50 p-3 rounded-lg mb-2">
                    <p className="text-xs font-semibold text-indigo-900 mb-1">
                      Application:
                    </p>
                    <p className="text-sm text-indigo-800">
                      {ill.application}
                    </p>
                  </div>
                  
                  {ill.source && (
                    <p className="text-xs text-gray-500 italic">
                      Source: {ill.source}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}