import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, BookOpen, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const DISCLAIMER = '⚠️ AI commentary is a study aid. Always verify with Scripture. AI may be wrong.';

export default function AIVerseCommentaryPanel({ book, chapter, verseStart, verseEnd, verseText, translation = 'WEB', language = 'en' }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Check cache first
  const cacheKey = ['ai-commentary-cache', book, chapter, verseStart, verseEnd, language];
  const { data: cached } = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const results = await base44.entities.AICommentaryCache.filter({
        book,
        chapter,
        verse_start: verseStart,
      }, '-created_date', 1).catch(() => []);
      return results.find(r => r.language === language && r.verse_end === (verseEnd || verseStart)) || null;
    },
    enabled: !!book && !!chapter && !!verseStart,
    retry: false,
    staleTime: 1000 * 60 * 60 * 24, // 24h cache
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const ref = verseEnd && verseEnd !== verseStart
        ? `${book} ${chapter}:${verseStart}-${verseEnd}`
        : `${book} ${chapter}:${verseStart}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical scholar. Provide a concise commentary on ${ref} (${translation}).

VERSE TEXT:
${verseText}

Provide in this exact structure (use markdown):
## Context
(2-3 sentences: author, audience, historical setting)

## Key Themes
(2-3 bullet points of major themes)

## Cross References
(2-3 related passages)

## Practical Application
(2-3 sentences of daily life application)

${language !== 'en' ? `Please respond in the language with code: ${language}` : ''}

Keep each section brief and educational. Avoid political, medical, or legal advice.`,
      });

      // Save to cache
      await base44.entities.AICommentaryCache.create({
        translation,
        book,
        chapter,
        verse_start: verseStart,
        verse_end: verseEnd || verseStart,
        language,
        result_text: response,
      }).catch(() => null);

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });

  const commentary = cached?.result_text || generateMutation.data;
  const isLoading = generateMutation.isPending;

  if (!book || !chapter || !verseStart) return null;

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-800">AI Commentary</span>
            <Badge className="text-xs bg-indigo-100 text-indigo-700 border-0">
              {book} {chapter}:{verseStart}{verseEnd && verseEnd !== verseStart ? `-${verseEnd}` : ''}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {!commentary && (
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 gap-1"
                onClick={() => { generateMutation.mutate(); setExpanded(true); }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {isLoading ? 'Generating…' : 'Get Commentary'}
              </Button>
            )}
            {commentary && (
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setExpanded(v => !v)}>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expanded ? 'Hide' : 'Show'}
              </Button>
            )}
          </div>
        </div>

        {commentary && expanded && (
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{DISCLAIMER}</p>
            </div>
            <div className="prose prose-sm prose-indigo max-w-none text-gray-800 bg-white rounded-lg p-4 border border-indigo-100">
              <ReactMarkdown>{commentary}</ReactMarkdown>
            </div>
            {cached && (
              <p className="text-xs text-gray-400 text-right">Cached result · {new Date(cached.created_date).toLocaleDateString()}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}