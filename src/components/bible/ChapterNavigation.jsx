import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getNextChapter, getPrevChapter, getBookByCode } from '../lib/bibleBooks';
import { useLocale } from '../lib/useLocale';

/**
 * Prev / Next chapter navigation bar.
 * Props:
 *   bookCode   {string}
 *   chapter    {number}
 *   language   {string} 'en' | 'om'
 *   onNavigate ({bookCode, chapter}) => void
 */
export default function ChapterNavigation({ bookCode, chapter, language: _langProp, onNavigate }) {
  const { ref } = useLocale();
  const prev = getPrevChapter(bookCode, chapter);
  const next = getNextChapter(bookCode, chapter);
  const book = getBookByCode(bookCode);
  const label = book ? ref({ bookCode, chapter }) : `${bookCode} ${chapter}`;

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <button
        onClick={() => prev && onNavigate(prev)}
        disabled={!prev}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {prev && (
          <span className="hidden sm:inline text-xs text-gray-500">
            {ref({ bookCode: prev.bookCode, chapter: prev.chapter })}
          </span>
        )}
      </button>

      <span className="text-sm font-extrabold text-gray-800 flex-1 text-center">{label}</span>

      <button
        onClick={() => next && onNavigate(next)}
        disabled={!next}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {next && (
          <span className="hidden sm:inline text-xs text-gray-500">
            {ref({ bookCode: next.bookCode, chapter: next.chapter })}
          </span>
        )}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}