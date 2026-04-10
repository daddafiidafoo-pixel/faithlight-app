import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, ChevronDown } from 'lucide-react';

export default function VerseExplanationGenerator({ onExplainVerse }) {
  const [verseRef, setVerseRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleGenerateExplanation = async () => {
    if (!verseRef.trim()) return;
    
    setIsLoading(true);
    try {
      const explanation = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a detailed verse-by-verse explanation of ${verseRef}:

1. **Verse Text**: Display the verse in a clear translation
2. **Word-by-Word Breakdown**: Explain key words and phrases with original language insights (Hebrew/Greek)
3. **Historical Context**: When, why, and to whom this was written
4. **Theological Significance**: What this verse teaches about God and faith
5. **Cultural Background**: Social customs or historical facts that illuminate meaning
6. **Connection to Other Scripture**: Related verses that support or expand this teaching
7. **Practical Application**: How believers today should live out this verse
8. **Commentary Insights**: What respected Bible scholars say about this passage

Format with clear markdown headers and make it comprehensive yet understandable.`,
        add_context_from_internet: true
      });

      onExplainVerse(`Verse Explanation: ${verseRef}`, explanation);
      setVerseRef('');
      setExpanded(false);
    } catch (error) {
      console.error('Failed to generate explanation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-blue-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Verse-by-Verse Explanation</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-blue-200 p-4">
          <p className="text-xs text-gray-600 mb-3">Enter a Bible verse reference (e.g., "John 3:16", "Romans 8:28")</p>
          <div className="flex gap-2">
            <Input
              value={verseRef}
              onChange={(e) => setVerseRef(e.target.value)}
              placeholder="e.g., Psalm 23:1"
              className="flex-1"
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateExplanation()}
            />
            <Button
              onClick={handleGenerateExplanation}
              disabled={!verseRef.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}