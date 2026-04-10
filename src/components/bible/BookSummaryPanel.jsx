import React, { useState } from 'react';
import { BookText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BookSummaryPanel({ book }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    if (!book) return;

    setLoading(true);
    try {
      const prompt = `Generate a comprehensive thematic summary of the Bible book: ${book}

Include:
1. **Overview**: Brief introduction and authorship
2. **Key Themes**: 3-5 major theological themes
3. **Structure**: Outline of main sections/chapters
4. **Memorable Passages**: 3-4 key verses with references
5. **Application**: How this book speaks to modern believers

Keep it scholarly yet accessible, around 300-400 words.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setSummary(response);
    } catch (error) {
      toast.error('Failed to generate book summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Book Summary: {book}</h3>
        </div>
        <Button onClick={generateSummary} disabled={loading || !book} size="sm">
          <Sparkles className="w-4 h-4 mr-1" />
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {summary && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-800">{summary}</div>
          </div>
        </Card>
      )}

      {!summary && !loading && book && (
        <Card className="p-6 text-center border-dashed">
          <BookText className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Get a comprehensive thematic overview of {book}
          </p>
        </Card>
      )}
    </div>
  );
}