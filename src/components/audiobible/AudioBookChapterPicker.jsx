import React, { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

export default function AudioBookChapterPicker({ books, booksLoading, bookId, chapter, onBookChange, onChapterChange }) {
  const [showBookPicker, setShowBookPicker] = useState(false);

  const currentBook = books.find(b => b.bookId === bookId);
  // chapters can be a number or an array of chapter numbers from Bible Brain API
  const maxChapters = Array.isArray(currentBook?.chapters)
    ? currentBook.chapters.length
    : (currentBook?.chapters || 1);

  const otBooks = books.filter(b => b.testament === 'OT' || b.testament === 'old');
  const ntBooks = books.filter(b => b.testament === 'NT' || b.testament === 'new');
  // fallback: split by index if testament not set
  const hasTestament = books.some(b => b.testament);
  const displayOT = hasTestament ? otBooks : books.slice(0, 39);
  const displayNT = hasTestament ? ntBooks : books.slice(39);

  if (booksLoading) return (
    <div className="flex items-center gap-2 text-sm text-gray-400 py-1">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading books…
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Book selector */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1.5">Book</p>
        <button
          onClick={() => setShowBookPicker(v => !v)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 text-sm font-medium text-gray-800 transition-all"
        >
          <span>{currentBook?.bookName || bookId}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showBookPicker ? 'rotate-180' : ''}`} />
        </button>

        {showBookPicker && (
          <div className="mt-2 border border-gray-100 rounded-2xl bg-white shadow-lg p-3 max-h-72 overflow-y-auto">
            {displayOT.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1.5">Old Testament</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                  {displayOT.map(b => (
                    <button
                      key={b.bookId}
                      onClick={() => { onBookChange(b.bookId); setShowBookPicker(false); }}
                      className={`text-xs px-1.5 py-1.5 rounded-lg text-center leading-tight transition-colors ${
                        bookId === b.bookId
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                      }`}
                    >
                      {b.bookName?.length > 5 ? b.bookName.slice(0, 4) + '.' : b.bookName || b.bookId}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {displayNT.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1.5">New Testament</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                  {displayNT.map(b => (
                    <button
                      key={b.bookId}
                      onClick={() => { onBookChange(b.bookId); setShowBookPicker(false); }}
                      className={`text-xs px-1.5 py-1.5 rounded-lg text-center leading-tight transition-colors ${
                        bookId === b.bookId
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                      }`}
                    >
                      {b.bookName?.length > 5 ? b.bookName.slice(0, 4) + '.' : b.bookName || b.bookId}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chapter selector */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1.5">Chapter</p>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {Array.from({ length: maxChapters }, (_, i) => i + 1).map(ch => (
            <button
              key={ch}
              onClick={() => onChapterChange(ch)}
              className={`w-9 h-9 text-sm rounded-xl font-medium transition-all ${
                chapter === ch
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 border border-gray-100'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}