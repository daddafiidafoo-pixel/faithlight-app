import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ChapterSummaryGenerator({
  book,
  chapter,
  verses,
  isDarkMode = false,
  onClose
}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    if (!verses || verses.length === 0) {
      toast.error('No verses available');
      return;
    }

    setLoading(true);
    try {
      const verseText = verses.map(v => `${v.verse}. ${v.text}`).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a concise, insightful summary of ${book} chapter ${chapter}. Focus on:
1. Main themes and spiritual lessons
2. Key events and important moments
3. Central messages or teachings
4. How this chapter relates to broader biblical context

Keep it clear, engaging, and under 200 words.

VERSES:
${verseText}`,
        add_context_from_internet: false
      });

      setSummary(response);
      toast.success('Summary generated!');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  if (summary) {
    return (
      <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
              <h3 style={{ color: textColor }} className="font-semibold">
                {book} {chapter} Summary
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSummary(null)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p style={{ color: textColor }} className="leading-relaxed text-sm mb-4">
            {summary}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSummary(null)}
            style={{ borderColor, color: primaryColor }}
          >
            Generate New Summary
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generateSummary}
      disabled={loading}
      className="gap-2"
      style={{ borderColor, color: primaryColor }}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Generate Summary
        </>
      )}
    </Button>
  );
}