import React, { useState, useEffect } from 'react';
import { getVerseBookmarks, deleteVerseBookmark } from '@/components/audio/VerseBookmarkPanel';
import { Bookmark, Search, Trash2, BookOpen } from 'lucide-react';

export default function MyAnnotations() {
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setBookmarks(getVerseBookmarks());
  }, []);

  const filtered = bookmarks.filter(b =>
    b.verseText?.toLowerCase().includes(search.toLowerCase()) ||
    b.note?.toLowerCase().includes(search.toLowerCase()) ||
    `${b.bookId} ${b.chapter}:${b.verseNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    deleteVerseBookmark(id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-6 h-6 text-pink-200" />
            <h1 className="text-2xl font-bold">My Journal</h1>
          </div>
          <p className="text-purple-100 text-sm">Your saved verses and personal reflections</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search verses or notes..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Bookmark className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold">
              {search ? 'No results found' : 'No bookmarks yet'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Tap the bookmark icon while listening to save a verse with your notes.
            </p>
          </div>
        )}

        {/* Bookmark list */}
        <div className="space-y-3">
          {filtered.map(bookmark => (
            <div key={bookmark.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-purple-600">
                    {bookmark.bookId} {bookmark.chapter}:{bookmark.verseNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {new Date(bookmark.savedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {bookmark.verseText && (
                <p className="text-sm text-slate-600 italic mb-3 line-clamp-3 border-l-2 border-purple-200 pl-3">
                  "{bookmark.verseText}"
                </p>
              )}

              {bookmark.note ? (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">My Note</p>
                  <p className="text-sm text-slate-700">{bookmark.note}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No personal note added</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}