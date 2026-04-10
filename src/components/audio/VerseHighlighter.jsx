import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function VerseHighlighter({ verses, currentVerseIndex, startVerse, endVerse, fullChapter }) {
  const currentVerseRef = useRef(null);

  // Auto-scroll to current verse
  useEffect(() => {
    if (currentVerseRef.current) {
      currentVerseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentVerseIndex]);

  if (!verses || verses.length === 0) {
    return <div className="text-center text-gray-500 py-8">No verses loaded</div>;
  }

  const verseRange = fullChapter ? verses.length : (endVerse || verses.length);

  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {verses.map((verse, idx) => {
            const isCurrentVerse = idx === currentVerseIndex;
            const isInRange = idx < verseRange && idx >= (startVerse - 1);
            
            return (
              <div
                key={`${verse.verse}-${idx}`}
                ref={isCurrentVerse ? currentVerseRef : null}
                className={`p-3 rounded-lg transition-all ${
                  isCurrentVerse
                    ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                    : isInRange
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-gray-200 opacity-50'
                }`}
              >
                <div className="flex gap-3">
                  <span className={`font-bold min-w-fit ${isCurrentVerse ? 'text-blue-600' : 'text-gray-600'}`}>
                    v{verse.verse}
                  </span>
                  <p className={`text-sm leading-relaxed ${isCurrentVerse ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    {verse.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}