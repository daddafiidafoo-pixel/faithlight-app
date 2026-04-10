import React, { useState } from 'react';
import { Sparkles, BookOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIDevotionalGenerator({ user, readingHistory = [] }) {
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateDevotional = async () => {
    if (!user) {
      toast.error('Please sign in to generate devotionals');
      return;
    }

    setLoading(true);
    try {
      // Get recent reading history
      const recentBooks = [...new Set(readingHistory.slice(0, 10).map(h => h.book))];
      const recentChapters = readingHistory.slice(0, 5).map(h => `${h.book} ${h.chapter}`).join(', ');

      const prompt = `Generate a personalized daily devotional for a Christian believer.

READER'S RECENT CONTEXT:
- Recently read: ${recentChapters || 'No recent history'}
- Books of interest: ${recentBooks.join(', ') || 'Various'}

Create a devotional with:
1. A relevant Bible verse (from their recent reading or related themes)
2. A brief reflection (2-3 paragraphs) connecting the verse to daily life
3. A practical application point
4. A short prayer

Make it encouraging, theologically sound, and personally relevant.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setDevotional(response);
    } catch (error) {
      toast.error('Failed to generate devotional');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold">Daily Devotional</h3>
        </div>
        <Button onClick={generateDevotional} disabled={loading} size="sm">
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 mr-1" />
              Generate
            </>
          )}
        </Button>
      </div>

      {devotional && (
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-800">{devotional}</div>
          </div>
        </Card>
      )}

      {!devotional && !loading && (
        <Card className="p-8 text-center border-dashed">
          <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">
            Click "Generate" to create a personalized devotional based on your reading history
          </p>
        </Card>
      )}
    </div>
  );
}