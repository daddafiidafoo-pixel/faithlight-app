import React, { useState, useEffect } from 'react';
import { Bookmark, BookOpen, Trash2, Search, ChevronRight, BookmarkCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getSavedVerses, unsaveVerse } from '@/components/bible/SaveVerseButton';
import { toast } from 'sonner';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

export default function SavedVerses() {
  const [verses, setVerses] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = () => setVerses(getSavedVerses());

  useEffect(() => {
    load();
    window.addEventListener('fl:verses_updated', load);
    return () => window.removeEventListener('fl:verses_updated', load);
  }, []);

  const filtered = verses.filter(v => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.book?.toLowerCase().includes(q) ||
      v.text?.toLowerCase().includes(q) ||
      `${v.book} ${v.chapter}:${v.verse}`.toLowerCase().includes(q)
    );
  });

  const handleRemove = (id) => {
    unsaveVerse(id);
    toast('Verse removed');
  };

  const goToVerse = (v) => {
    // Navigate to Bible reader at the saved location
    const params = new URLSearchParams();
    if (v.book) params.set('book', v.book);
    if (v.chapter) params.set('chapter', v.chapter);
    if (v.verse) params.set('verse', v.verse);
    navigate(`/BibleReaderNew?${params.toString()}`);
  };

  // Group by book
  const grouped = filtered.reduce((acc, v) => {
    const key = v.book || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-600" />
            Saved Verses
          </h1>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {verses.length} saved
          </span>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search book, verse, or text..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      <div className="px-4 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">
              {search ? 'No verses match your search' : 'No saved verses yet'}
            </p>
            <p className="text-gray-300 text-sm mt-1">
              {search ? 'Try a different search term.' : 'Tap the bookmark icon while reading to save verses here.'}
            </p>
            {!search && (
              <Link to="/BibleReaderNew" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
                <BookOpen size={14} /> Open Bible
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([book, bookVerses]) => (
              <div key={book}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={13} className="text-indigo-400" />
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{book}</h3>
                  <div className="flex-1 h-px bg-indigo-100" />
                  <span className="text-xs text-gray-400">{bookVerses.length}</span>
                </div>
                <div className="space-y-2">
                  {bookVerses.map(v => (
                    <div
                      key={v.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => goToVerse(v)}
                            className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                          >
                            {v.book} {v.chapter}:{v.verse}
                            <ChevronRight size={12} />
                          </button>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-300">{timeAgo(v.savedAt)}</span>
                            <button
                              onClick={() => handleRemove(v.id)}
                              className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                              aria-label="Remove bookmark"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {v.text && (
                          <p className="text-sm text-gray-700 leading-relaxed mt-2 italic">
                            "{v.text}"
                          </p>
                        )}
                        <button
                          onClick={() => goToVerse(v)}
                          className="mt-3 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-600 font-medium transition-colors"
                        >
                          <BookOpen size={12} /> Read in Bible
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}