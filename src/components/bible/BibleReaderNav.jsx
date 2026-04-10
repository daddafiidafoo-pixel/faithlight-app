import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBibleBooks } from '@/lib/bibleService';

export default function BibleReaderNav({ book, chapter, onBookChange, onChapterChange }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      const booksData = await getBibleBooks();
      setBooks(booksData);
      setLoading(false);
    };
    load();
  }, []);

  const currentBookData = books.find(b => b.code === book);
  const maxChapters = currentBookData ? currentBookData.numChapters || 1 : 1;
  const filteredBooks = search.trim()
    ? books.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    : books;

  const handlePrevChapter = () => {
    if (chapter > 1) {
      onChapterChange(chapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (chapter < maxChapters) {
      onChapterChange(chapter + 1);
    }
  };

  if (loading) {
    return (
      <div className="h-16 bg-slate-50 border-b border-slate-200 flex items-center px-4">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 sticky top-[56px] z-20">
      <div className="flex gap-2 items-center max-w-2xl mx-auto">

        {/* Book Selector with search */}
        <div className="flex-1 relative">
          {showSearch ? (
            <div className="flex items-center gap-1 h-9 border border-slate-300 rounded-md bg-white px-2">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search books..."
                className="flex-1 text-sm outline-none bg-transparent"
              />
              <button onClick={() => { setSearch(''); setShowSearch(false); setShowDropdown(false); }}>
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowSearch(true); setShowDropdown(true); }}
              className="w-full h-9 border border-slate-300 rounded-md bg-white px-3 flex items-center justify-between text-sm text-slate-700 hover:bg-slate-50"
            >
              <span>{currentBookData?.name || book}</span>
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => { setShowDropdown(false); setShowSearch(false); setSearch(''); }} />
              <div className="absolute top-10 left-0 right-0 z-20 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredBooks.length === 0 ? (
                  <p className="text-sm text-slate-400 px-3 py-2">No books found</p>
                ) : (
                  filteredBooks.map(b => (
                    <button
                      key={b.code}
                      onClick={() => { onBookChange(b.code); setShowDropdown(false); setShowSearch(false); setSearch(''); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700 ${b.code === book ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'}`}
                    >
                      {b.name}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Chapter Navigation */}
        <div className="flex gap-1 items-center">
          <Button variant="ghost" size="sm" onClick={handlePrevChapter} disabled={chapter <= 1} className="h-9 w-9 p-0">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-sm font-medium text-slate-700 w-12 text-center">Ch. {chapter}</div>
          <Button variant="ghost" size="sm" onClick={handleNextChapter} disabled={chapter >= maxChapters} className="h-9 w-9 p-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}