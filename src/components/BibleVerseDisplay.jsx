import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Copy, MessageCircle, ChevronRight } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function BibleVerseDisplay({ verses, reference, onAskAI, fullChapter = false }) {
  if (!verses || verses.length === 0) {
    return null;
  }

  const handleCopy = () => {
    const text = verses.map(v => `${reference}:${v.verse} ${v.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
  };

  const verseText = verses.map(v => v.text).join(' ');
  const handleAskAI = () => {
    if (onAskAI) {
      onAskAI(reference, verseText);
    }
  };

  return (
    <Card className="bg-blue-50 border-blue-200 border-l-4 border-l-blue-600">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-semibold text-blue-900">{reference}</p>
              {fullChapter && <Badge className="text-xs bg-blue-200 text-blue-800">Full Chapter</Badge>}
            </div>
            <div className="space-y-2">
              {verses.map((v, idx) => (
                <div key={idx} className="text-sm text-blue-900 leading-relaxed">
                  <span className="font-semibold text-blue-700 text-xs">{v.verse}</span>{' '}
                  {v.text}
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-3">— {verses[0]?.translation || 'WEB'} Translation</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-3 border-t border-blue-200">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 hover:bg-blue-100"
            onClick={handleAskAI}
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Ask AI
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 hover:bg-blue-100"
            onClick={handleCopy}
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          {!fullChapter && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-700 hover:bg-blue-100 ml-auto"
              asChild
            >
              <a href={createPageUrl('BibleReader')}>
                Read Full Chapter
                <ChevronRight className="w-3 h-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}