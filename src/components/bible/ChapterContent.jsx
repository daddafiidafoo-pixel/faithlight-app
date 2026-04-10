import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function ChapterContent({ bibleId, bookId, chapterId, chapterNumber, language }) {
  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ['bible-chapter', bibleId, bookId, chapterId, language],
    queryFn: async () => {
      try {
        // Query local BibleChapter entity
        const result = await base44.entities.BibleChapter.filter({
          bibleId,
          bookId,
          chapterId,
          language
        });
        return result?.[0] || null;
      } catch (err) {
        console.debug('[ChapterContent] Failed to fetch chapter:', err?.message);
        return null;
      }
    },
    enabled: !!(bibleId && bookId && chapterId && language)
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">Failed to load chapter content</p>
        </CardContent>
      </Card>
    );
  }

  if (!chapter) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-700">Chapter not available in this language</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900">{chapter.reference}</h2>
      </div>

      {/* Render HTML if available, fall back to plain text */}
      {chapter.contentHtml ? (
        <div
          className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: chapter.contentHtml }}
        />
      ) : (
        <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
          {chapter.contentText}
        </div>
      )}

      {/* Audio player if available */}
      {chapter.audioUrl && (
        <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm font-semibold text-indigo-900 mb-3">Listen to this chapter</p>
          <audio
            controls
            className="w-full"
            src={chapter.audioUrl}
            controlsList="nodownload"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}