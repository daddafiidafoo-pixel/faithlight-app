import React, { useState, useEffect } from 'react';
import { BookOpen, Loader, AlertCircle, Volume2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ChapterSummaryPanel({ book, chapter, onClose }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (book && chapter) {
      generateSummary();
    }
  }, [book, chapter]);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await base44.functions.invoke('generateChapterSummary', {
        book,
        chapter: parseInt(chapter)
      });

      if (response.data && response.data.summary) {
        setSummary(response.data.summary);
      } else {
        setError('Failed to generate summary');
      }
    } catch (err) {
      console.error('Summary generation error:', err);
      setError(err.message || 'Error generating summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{book} {chapter}</h3>
            <p className="text-sm text-gray-500">AI Summary</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-gray-600 text-sm">Generating summary…</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 text-sm">{error}</p>
                <button
                  onClick={generateSummary}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {summary && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
                  {summary}
                </p>
              </div>

              <button
                onClick={() => toast.success('Audio playback not yet implemented')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium text-sm hover:bg-indigo-200 transition-colors"
              >
                <Volume2 size={16} />
                Listen to Summary
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}