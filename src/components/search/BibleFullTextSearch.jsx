import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, Zap, ChevronRight, X, Sparkles } from 'lucide-react';
import { searchBible, searchByTheme, getSuggestions, detectTheme, BOOK_CATEGORIES, THEME_KEYWORDS, getCategoryForBook } from './bibleSearchEngine';
import { useDownloadedTranslations } from '@/components/offline/useBibleOffline';
import { debounce } from 'lodash';

const FILTERS = [
  { id: 'all',        label: 'All' },
  { id: 'OT',         label: 'Old Testament' },
  { id: 'NT',         label: 'New Testament' },
  { id: 'Gospels',    label: 'Gospels' },
  { id: 'Wisdom',     label: 'Wisdom' },
  { id: 'Letters',    label: 'Letters' },
];

const THEME_LIST = Object.keys(THEME_KEYWORDS);

export default function BibleFullTextSearch() {
  const { translations } = useDownloadedTranslations();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [elapsed, setElapsed] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  // Sync language to first available downloaded translation
  useEffect(() => {
    if (translations.length && !translations.find(t => t.languageCode === language)) {
      setLanguage(translations[0].languageCode);
    }
  }, [translations]);

  const runSearch = useCallback(
    debounce(async (q, f, lang) => {
      if (!q.trim()) { setResults([]); setGrouped({}); setHasSearched(false); return; }
      setLoading(true);
      setHasSearched(true);
      try {
        const theme = detectTheme(q);
        let res;
        if (theme && q.trim() === theme) {
          res = await searchByTheme(lang, theme, 50);
        } else {
          res = await searchBible(lang, q, { filter: f, limit: 50 });
        }
        setResults(res.results);
        setElapsed(res.elapsed);
        setSource(res.source);

        // Group by category
        const g = {};
        for (const v of res.results) {
          const cat = getCategoryForBook(v.bookCode);
          if (!g[cat]) g[cat] = [];
          g[cat].push(v);
        }
        setGrouped(g);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInput = (val) => {
    setQuery(val);
    setSuggestions(getSuggestions(val));
    setShowSuggestions(true);
    runSearch(val, filter, language);
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    setShowSuggestions(false);
    runSearch(s, filter, language);
    inputRef.current?.focus();
  };

  const handleFilterChange = (f) => {
    setFilter(f);
    if (query) runSearch(query, f, language);
  };

  const handleThemeClick = (theme) => {
    setQuery(theme);
    setShowSuggestions(false);
    runSearch(theme, filter, language);
  };

  const highlightText = (text, q) => {
    if (!q) return text;
    const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let result = text;
    words.forEach(w => {
      result = result.replace(new RegExp(`(${w})`, 'gi'), '<mark class="bg-yellow-200 rounded-sm px-0.5">$1</mark>');
    });
    return result;
  };

  const hasDownloaded = translations.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-base font-semibold text-gray-800 mb-2">Search the Bible</h1>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => handleInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="faith, hope, love, be not afraid…"
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setGrouped({}); setHasSearched(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
                {suggestions.map(s => (
                  <button key={s} onClick={() => handleSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-gray-400" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language + Filter row */}
          <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar">
            {translations.length > 1 && (
              <select value={language} onChange={e => { setLanguage(e.target.value); if(query) runSearch(query, filter, e.target.value); }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 shrink-0">
                {translations.map(t => (
                  <option key={t.languageCode} value={t.languageCode}>{t.flag} {t.languageName}</option>
                ))}
              </select>
            )}
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => handleFilterChange(f.id)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${filter === f.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">

        {/* No downloads warning */}
        {!hasDownloaded && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            <p className="font-medium mb-1">No offline Bible downloaded</p>
            <p>Download a Bible translation in <strong>My Bible</strong> to enable fast offline search.</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-purple-600 text-sm">
            <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            Searching…
          </div>
        )}

        {/* Results meta */}
        {!loading && hasSearched && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Zap className="w-3.5 h-3.5" />
            {results.length} results
            {elapsed != null && <span>· {elapsed}ms</span>}
            {source === 'local_index' && <span className="text-green-600 font-medium">· offline index</span>}
            {source === 'scan' && <span className="text-amber-600">· scan (building index…)</span>}
          </div>
        )}

        {/* Theme chips (shown when idle) */}
        {!hasSearched && hasDownloaded && (
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Browse by topic
            </p>
            <div className="flex flex-wrap gap-2">
              {THEME_LIST.map(t => (
                <button key={t} onClick={() => handleThemeClick(t)}
                  className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-purple-400 hover:text-purple-700 transition capitalize shadow-sm">
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results grouped by category */}
        {!loading && results.length > 0 && Object.entries(grouped).map(([cat, verses]) => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{cat}</span>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{verses.length}</span>
            </div>
            <div className="space-y-2">
              {verses.map(v => (
                <VerseCard key={v.id} verse={v} query={query} highlightText={highlightText} />
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No verses found for "<span className="italic">{query}</span>"</p>
            <p className="text-xs mt-1">Try different keywords or check the filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

function VerseCard({ verse, query, highlightText }) {
  const [expanded, setExpanded] = useState(false);
  const text = verse.text || '';
  const preview = text.length > 120 ? text.slice(0, 120) + '…' : text;

  return (
    <button onClick={() => setExpanded(e => !e)}
      className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-purple-200 transition">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs font-semibold text-purple-600 mb-1">{verse.reference || `${verse.bookCode} ${verse.chapter}:${verse.verse}`}</p>
          <p className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightText(expanded ? text : preview, query) }} />
        </div>
        {text.length > 120 && (
          <ChevronRight className={`w-4 h-4 text-gray-300 shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        )}
      </div>
    </button>
  );
}