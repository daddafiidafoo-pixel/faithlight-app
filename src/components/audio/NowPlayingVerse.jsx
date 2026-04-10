import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function NowPlayingVerse({ verses, currentVerseIndex, book, chapter, isPlaying }) {
  if (!verses || verses.length === 0) return null;

  const currentVerse = verses[currentVerseIndex];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardContent className="pt-8 pb-8">
        <div className="text-center space-y-4">
          {/* Status */}
          <div className="flex items-center justify-center gap-2">
            {isPlaying && (
              <div className="flex gap-1">
                <div className="w-2 h-4 bg-blue-600 rounded animate-pulse" />
                <div className="w-2 h-6 bg-blue-600 rounded animate-pulse animation-delay-100" />
                <div className="w-2 h-4 bg-blue-600 rounded animate-pulse animation-delay-200" />
              </div>
            )}
            <span className="text-sm font-semibold text-blue-600">
              {isPlaying ? 'Now Playing' : 'Paused'}
            </span>
          </div>

          {/* Reference */}
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {book} {chapter}:{currentVerse.verse}
            </p>
            
            {/* Verse Text - Large and Clear */}
            <p className="text-2xl font-serif leading-relaxed text-gray-900 mb-4">
              "{currentVerse.text}"
            </p>

            {/* Verse Number */}
            <p className="text-xs text-gray-500">
              Verse {currentVerseIndex + 1} of {verses.length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}