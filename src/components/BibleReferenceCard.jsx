import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, MessageSquare, BookOpen, Bookmark, RefreshCw, AlertCircle } from 'lucide-react';
import { createPageUrl } from '../utils';

const MAX_DISPLAY_LINES = 10;

export default function BibleReferenceCard({
  reference,
  verses,
  translation = 'WEB',
  onAskAI,
  onSave,
  isLoading = false,
  error = null,
  onRetry
}) {
  const [expanded, setExpanded] = useState(false);
  const [copiedVerseId, setCopiedVerseId] = useState(null);

  if (isLoading) {
    return <BibleReferenceCardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">{error}</p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="text-amber-700"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
                <Button size="sm" variant="ghost" className="text-amber-600">
                  Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verses || verses.length === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">No verses found for {reference}</p>
        </CardContent>
      </Card>
    );
  }

  const displayVerses = expanded ? verses : verses.slice(0, MAX_DISPLAY_LINES);
  const hasMore = verses.length > MAX_DISPLAY_LINES && !expanded;

  const handleCopyVerse = async (verse) => {
    const text = `${reference}:${verse.verse} (${translation})\n${verse.text}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVerseId(verse.id);
      setTimeout(() => setCopiedVerseId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const passageText = verses.map(v => `${v.verse} ${v.text}`).join('\n');

  const handleReadChapter = () => {
    const [book, ref] = reference.split(' ');
    const chapter = ref.split(':')[0];
    const readerUrl = createPageUrl('BibleReader') + `?book=${encodeURIComponent(book)}&chapter=${chapter}`;
    window.location.href = readerUrl;
  };

  return (
    <Card className="border-indigo-200 bg-white overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{reference}</h3>
            <p className="text-xs text-gray-500 mt-1">Tap verse to copy</p>
          </div>
          <Badge variant="outline" className="bg-white border-indigo-200 text-indigo-700 ml-2">
            {translation}
          </Badge>
        </div>
      </CardHeader>

      {/* Body - Verses */}
      <CardContent className="py-4 space-y-3">
        {displayVerses.map((verse) => (
          <div
            key={verse.id}
            onClick={() => handleCopyVerse(verse)}
            className="group cursor-pointer p-3 rounded-lg hover:bg-indigo-50 transition-colors"
            role="button"
            tabIndex={0}
            aria-label={`Verse ${verse.verse}: ${verse.text}`}
          >
            <div className="flex gap-2">
              <span className="text-xs font-bold text-indigo-600 min-w-fit">
                {verse.verse}
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-700 leading-relaxed">{verse.text}</p>
              </div>
              {copiedVerseId === verse.id && (
                <span className="text-xs text-green-600 font-semibold ml-2 flex-shrink-0">
                  Copied
                </span>
              )}
            </div>
          </div>
        ))}

        {hasMore && (
          <button
            onClick={() => setExpanded(true)}
            className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 py-2"
          >
            Show {verses.length - MAX_DISPLAY_LINES} more verses
          </button>
        )}

        {expanded && verses.length > MAX_DISPLAY_LINES && (
          <button
            onClick={() => setExpanded(false)}
            className="text-sm text-gray-600 font-semibold hover:text-gray-700 py-2"
          >
            Show less
          </button>
        )}
      </CardContent>

      {/* Footer - Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2 flex-wrap">
        <Button
          size="sm"
          className="flex-1 min-w-fit bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => onAskAI?.(passageText, reference)}
        >
          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
          Ask AI
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex-1 min-w-fit"
          onClick={handleReadChapter}
        >
          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
          Read Chapter
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="px-2"
          onClick={() => {
            const text = passageText;
            navigator.clipboard.writeText(`${reference}\n${text}`);
          }}
          title="Copy all verses"
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>

        {onSave && (
          <Button
            size="sm"
            variant="ghost"
            className="px-2"
            onClick={() => onSave?.(reference, verses)}
            title="Save to bookmarks"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </Card>
  );
}

/**
 * Skeleton loader for BibleReferenceCard
 */
function BibleReferenceCardSkeleton() {
  return (
    <Card className="border-gray-200 overflow-hidden">
      <CardHeader className="pb-3 bg-gray-100 border-b">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </CardHeader>

      <CardContent className="py-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2 p-3">
            <div className="flex gap-2">
              <div className="h-3 bg-gray-300 rounded w-4 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      <div className="px-4 py-3 bg-gray-50 border-t flex gap-2">
        <div className="h-8 bg-gray-300 rounded flex-1" />
        <div className="h-8 bg-gray-200 rounded flex-1" />
      </div>
    </Card>
  );
}

export { BibleReferenceCardSkeleton };