import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/components/languageStore';
import { getBookName } from '@/lib/bibleBookNames';
import { base44 } from '@/api/base44Client';

const UI = {
  en: {
    title: 'Search Bible',
    searchPlaceholder: 'Enter keyword or phrase...',
    search: 'Search',
    results: 'Results',
    noResults: 'No verses found',
    tryDifferent: 'Try a different search term',
    searching: 'Searching...',
    verse: 'Verse',
    goTo: 'Go to',
    clearSearch: 'Clear',
  },
  om: {
    title: 'Macaaba Barbaadi',
    searchPlaceholder: 'Jecha ykn seenaa galchi...',
    search: 'Barbaadi',
    results: 'Firoonni',
    noResults: 'Verisiiwwan hin argamne',
    tryDifferent: 'Jecha biraa jija',
    searching: 'Barbaaddaa jira...',
    verse: 'Verisi',
    goTo: 'Geessa',
    clearSearch: 'Haquu',
  },
  am: {
    title: 'ጸሐፍት ፈልግ',
    searchPlaceholder: 'ቃል ወይም ሐረግ ያስገቡ...',
    search: 'ፈልግ',
    results: 'ውጤቶች',
    noResults: 'ፅሑፍ አልተገኘም',
    tryDifferent: 'የተለየ ፈልጋ',
    searching: 'ፈልጋ...',
    verse: 'ፅሑፍ',
    goTo: 'ሂድ',
    clearSearch: 'ጸርግብ',
  },
  sw: {
    title: 'Tafuta Bibilia',
    searchPlaceholder: 'Ingiza neno au kauli...',
    search: 'Tafuta',
    results: 'Matokeo',
    noResults: 'Hakuna ayati iliyopatikana',
    tryDifferent: 'Jaribu neno lingine',
    searching: 'Inatafuta...',
    verse: 'Ayati',
    goTo: 'Nenda',
    clearSearch: 'Futa',
  },
};

export default function BibleVerseSearch() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const bibleLanguage = useLanguageStore(s => s.bibleLanguage);
  const L = UI[uiLanguage] || UI.en;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      // Search in BibleVerseText entity for the selected language
      const verses = await base44.entities.BibleVerseText.filter({
        language_code: bibleLanguage || 'en',
      }, null, 500);

      if (!verses) {
        setResults([]);
        setLoading(false);
        return;
      }

      // Filter by query (case-insensitive)
      const queryLower = query.toLowerCase();
      const filtered = verses.filter(v =>
        (v.text && v.text.toLowerCase().includes(queryLower)) ||
        (v.reference && v.reference.toLowerCase().includes(queryLower))
      );

      // Limit to 50 results
      setResults(filtered.slice(0, 50));
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoTo = (verse) => {
    const url = `/BibleReaderPage?language_code=${bibleLanguage}&book_id=${verse.book_id}&chapter=${verse.chapter}&verse_start=${verse.verse}`;
    window.location.href = url;
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#F8F6F1' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 sticky top-0 z-20" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <h1 className="text-2xl font-bold" style={{ color: '#1F2937' }}>{L.title}</h1>
      </div>

      {/* Search Form */}
      <div className="px-5 py-5">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={L.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2"
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: '#fff',
                color: '#1F2937',
              }}
              onFocus={(e) => e.target.style.ringColor = '#8B5CF6'}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-3 p-1 hover:opacity-70"
              >
                <X className="w-5 h-5" style={{ color: '#9CA3AF' }} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-4 py-3 rounded-2xl font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="px-5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B5CF6' }} />
            <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{L.searching}</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-12 h-12 mb-4" style={{ color: '#D1D5DB' }} />
            <p className="text-base font-semibold" style={{ color: '#1F2937' }}>{L.noResults}</p>
            <p className="text-sm mt-2" style={{ color: '#6B7280' }}>{L.tryDifferent}</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: '#6B7280' }}>
              {results.length} {L.results}
            </p>
            <div className="space-y-3">
              {results.map((verse, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-md"
                  style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  onClick={() => handleGoTo(verse)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold mb-1.5" style={{ color: '#8B5CF6' }}>
                      {verse.book_name} {verse.chapter}:{verse.verse}
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#1F2937' }}
                    >
                      {verse.text}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 shrink-0 mt-1" style={{ color: '#8B5CF6' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}