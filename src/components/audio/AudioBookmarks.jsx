import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Clock } from 'lucide-react';

const STORAGE_KEY = 'fl_audio_bookmarks';

function loadBookmarks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveBookmarks(bms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bms));
}

function formatTime(s) {
  if (!s && s !== 0) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(loadBookmarks);

  const addBookmark = (book, chapter, position, label) => {
    const bm = {
      id: Date.now(),
      book, chapter, position,
      label: label || `${book} ${chapter} · ${formatTime(position)}`,
      created: new Date().toISOString(),
    };
    setBookmarks(prev => {
      const next = [bm, ...prev];
      saveBookmarks(next);
      return next;
    });
    return bm;
  };

  const removeBookmark = (id) => {
    setBookmarks(prev => {
      const next = prev.filter(b => b.id !== id);
      saveBookmarks(next);
      return next;
    });
  };

  const bookmarksForChapter = (book, chapter) =>
    bookmarks.filter(b => b.book === book && b.chapter === chapter);

  return { bookmarks, addBookmark, removeBookmark, bookmarksForChapter };
}

/** Inline bookmark button shown in the player */
export function BookmarkButton({ book, chapter, currentTime, addBookmark, bookmarksForChapter }) {
  const chapterBms = bookmarksForChapter(book, chapter);
  const alreadyBookmarked = chapterBms.some(b => Math.abs(b.position - currentTime) < 2);

  return (
    <button
      onClick={() => {
        if (!alreadyBookmarked) {
          addBookmark(book, chapter, Math.floor(currentTime));
        }
      }}
      title={alreadyBookmarked ? 'Already bookmarked near here' : 'Bookmark current position'}
      className={`p-2 rounded-full transition-all ${
        alreadyBookmarked
          ? 'text-amber-500 bg-amber-50'
          : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
      }`}
    >
      <Bookmark className={`w-4 h-4 ${alreadyBookmarked ? 'fill-amber-400' : ''}`} />
    </button>
  );
}

/** Panel listing bookmarks for current chapter, with jump + delete */
export function BookmarksPanel({ book, chapter, bookmarks, removeBookmark, onJump }) {
  const chapterBms = bookmarks.filter(b => b.book === book && b.chapter === chapter);
  if (!chapterBms.length) return null;

  return (
    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 overflow-hidden">
      <div className="px-3 py-2 bg-white border-b border-amber-100 flex items-center gap-2">
        <Bookmark className="w-3.5 h-3.5 text-amber-500" />
        <p className="text-xs font-semibold text-gray-600">Bookmarks · {book} {chapter}</p>
      </div>
      <div className="divide-y divide-amber-100">
        {chapterBms.map(bm => (
          <div key={bm.id} className="flex items-center gap-2 px-3 py-2">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <button
              onClick={() => onJump(bm.position)}
              className="flex-1 text-left text-sm text-gray-700 hover:text-indigo-600 transition-colors"
            >
              {bm.label}
            </button>
            <button onClick={() => removeBookmark(bm.id)} className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}