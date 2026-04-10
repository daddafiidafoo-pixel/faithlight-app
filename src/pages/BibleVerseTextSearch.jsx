import React, { useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, BookOpen, Hash, X, ChevronRight } from 'lucide-react';

function highlight(text, query) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
      : part
  );
}

export default function BibleVerseTextSearch() {
  const [bookName, setBookName] = useState('');
  const [chapter, setChapter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [language, setLanguage] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const search = useCallback(async (overrides = {}) => {
    const bk = overrides.bookName  !== undefined ? overrides.bookName  : bookName;
    const ch = overrides.chapter   !== undefined ? overrides.chapter   : chapter;
    const kw = overrides.keyword   !== undefined ? overrides.keyword   : keyword;
    const lg = overrides.language  !== undefined ? overrides.language  : language;

    // Need at least one filter
    if (!bk.trim() && !ch.trim() && !kw.trim() && !lg.trim()) {
      setError('Enter at least one filter to search.');
      return;
    }

    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const filters = {};
      if (lg.trim()) filters.language_code = lg.trim().toLowerCase();
      if (bk.trim()) filters.book_name = bk.trim();
      if (ch.trim() && !isNaN(Number(ch))) filters.chapter = Number(ch);

      // Fetch with filters; keyword filtering done client-side on text field
      const data = await base44.entities.BibleVerseText.filter(filters, 'book_id', 200);

      const kwLower = kw.trim().toLowerCase();
      const filtered = kwLower
        ? data.filter(v => v.text?.toLowerCase().includes(kwLower))
        : data;

      setResults(filtered);
    } catch (e) {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [bookName, chapter, keyword, language]);

  const triggerSearch = (field, value) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search({ [field]: value }), 400);
  };

  const handleClear = () => {
    setBookName('');
    setChapter('');
    setKeyword('');
    setLanguage('');
    setResults([]);
    setSearched(false);
    setError('');
  };

  const hasFilters = bookName || chapter || keyword || language;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Bible Verse Search</h1>
          </div>
          <p className="text-sm text-gray-500">Filter by book, chapter, language, or keyword</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 mb-5">

          {/* Keyword */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={keyword}
              onChange={e => { setKeyword(e.target.value); triggerSearch('keyword', e.target.value); }}
              placeholder="Search keyword in verse text…"
              className="w-full pl-9 pr-4 py-3 min-h-[44px] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Book Name */}
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={bookName}
                onChange={e => { setBookName(e.target.value); triggerSearch('bookName', e.target.value); }}
                placeholder="Book name…"
                className="w-full pl-9 pr-4 py-3 min-h-[44px] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Chapter */}
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="number"
                min="1"
                value={chapter}
                onChange={e => { setChapter(e.target.value); triggerSearch('chapter', e.target.value); }}
                placeholder="Chapter…"
                className="w-full pl-9 pr-4 py-3 min-h-[44px] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          {/* Language */}
          <input
            type="text"
            value={language}
            onChange={e => { setLanguage(e.target.value); triggerSearch('language', e.target.value); }}
            placeholder="Language code (e.g. en, om, am)…"
            className="w-full px-4 py-3 min-h-[44px] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => search()}
              disabled={loading}
              className="flex-1 min-h-[44px] bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching…' : 'Search'}
            </button>
            {hasFilters && (
              <button
                onClick={handleClear}
                className="min-h-[44px] min-w-[44px] px-4 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 text-sm"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">Searching…</div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No verses found</p>
            <p className="text-gray-400 text-sm">Try a different book name, chapter, or keyword</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
              {results.length} verse{results.length !== 1 ? 's' : ''} found
            </p>
            <div className="space-y-2">
              {results.map(verse => (
                <div key={verse.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {verse.reference || `${verse.book_name} ${verse.chapter}:${verse.verse}`}
                      </span>
                      {verse.language_code && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase font-mono">
                          {verse.language_code}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {highlight(verse.text || '', keyword)}
                  </p>
                </div>
              ))}
            </div>

            {results.length === 200 && (
              <p className="text-center text-xs text-gray-400 mt-4">
                Showing first 200 results — refine your filters for more specific results.
              </p>
            )}
          </>
        )}

      </div>
    </div>
  );
}