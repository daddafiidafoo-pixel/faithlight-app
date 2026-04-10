import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AISermonSummaryGenerator({ sermon, onSummaryGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState(sermon?.summary || '');
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    if (!sermon?.content) {
      toast.error('No sermon content to summarize');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a compelling, concise summary (2-3 paragraphs) of this sermon that captures its main message, key points, and practical applications:

Title: ${sermon.title}
Topic: ${sermon.topic || 'N/A'}
Passage: ${sermon.passage_references || 'N/A'}

Content:
${sermon.content}

The summary should be engaging and highlight what listeners will learn.`,
        add_context_from_internet: false
      });

      setSummary(response);
      
      // Save to database
      if (sermon.id) {
        await base44.entities.SharedSermon.update(sermon.id, {
          summary: response
        });
        toast.success('Summary generated and saved!');
        if (onSummaryGenerated) onSummaryGenerated(response);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Sermon Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary ? (
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={copySummary} variant="outline" size="sm">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button onClick={generateSummary} variant="outline" size="sm" disabled={generating}>
                {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Regenerate
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-4">
              No summary yet. Generate one with AI to make your sermon more discoverable.
            </p>
            <Button onClick={generateSummary} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}