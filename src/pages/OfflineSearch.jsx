import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Loader2, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

function highlight(text, query) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{p}</mark>
      : p
  );
}

export default function OfflineSearch() {
  const [query, setQuery] = useState('');
  const [allChapters, setAllChapters] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [totalChapters, setTotalChapters] = useState(0);
  const debounceRef = useRef(null);

  // Load all downloaded chapters on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const chapters = await base44.entities.OfflineTextChapter.list('-downloaded_at', 500);
        setAllChapters(chapters);
        setTotalChapters(chapters.length);
      } catch { }
      setLoading(false);
    };
    load();
  }, []);

  // Search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) { setResults([]); return; }

    debounceRef.current = setTimeout(() => {
      setSearching(true);
      const q = query.trim().toLowerCase();
      const hits = [];

      for (const chapter of allChapters) {
        let verses = [];
        try { verses = JSON.parse(chapter.verses_json || '[]'); } catch { continue; }

        for (const v of verses) {
          if (v.text?.toLowerCase().includes(q)) {
            hits.push({
              book: chapter.book_name || chapter.book_id,
              chapter: chapter.chapter,
              verse: v.verse,
              text: v.text,
              reference: v.reference || `${chapter.book_name} ${chapter.chapter}:${v.verse}`,
              version: chapter.version_id,
            });
          }
          if (hits.length >= 200) break;
        }
        if (hits.length >= 200) break;
      }

      setResults(hits);
      setSearching(false);
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query, allChapters]);

  const grouped = results.reduce((acc, r) => {
    const key = `${r.book} ${r.chapter}`;
    if (!acc[key]) acc[key] = { book: r.book, chapter: r.chapter, version: r.version, verses: [] };
    acc[key].verses.push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Search Offline Bible</h1>
            <p className="text-xs text-gray-400">
              {loading ? 'Loading chapters…' : `Search across ${totalChapters} downloaded chapter${totalChapters !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for a word, phrase, or verse…"
            className="pl-9 pr-9 h-11 rounded-xl border-gray-200 bg-white shadow-sm text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        )}

        {!loading && totalChapters === 0 && (
          <div className="text-center py-12 space-y-3">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-gray-400 text-sm">No chapters downloaded yet.</p>
            <Link to={createPageUrl('OfflineManager')}
              className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-medium hover:underline">
              Download chapters <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {!loading && totalChapters > 0 && !query && (
          <div className="text-center py-12 text-gray-300">
            <Search className="w-10 h-10 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Start typing to search your offline library</p>
          </div>
        )}

        {searching && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Searching…
          </div>
        )}

        {/* Results */}
        {!searching && query.length >= 2 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">
                {results.length === 0 ? 'No results found' : `${results.length} verse${results.length !== 1 ? 's' : ''} found`}
              </p>
              {results.length > 0 && (
                <Badge variant="secondary" className="text-xs">{Object.keys(grouped).length} chapter{Object.keys(grouped).length !== 1 ? 's' : ''}</Badge>
              )}
            </div>

            {Object.entries(grouped).map(([key, group]) => (
              <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold text-sm text-gray-700">{group.book} {group.chapter}</span>
                    <Badge variant="outline" className="text-xs py-0">{group.version}</Badge>
                  </div>
                  <Link
                    to={createPageUrl(`OfflineReader?book=${encodeURIComponent(group.book)}&chapter=${group.chapter}&version=${group.version}`)}
                    className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                    Read <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {group.verses.map((v, i) => (
                    <div key={i} className="px-4 py-3">
                      <p className="text-xs text-gray-400 mb-1 font-medium">{v.reference}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{highlight(v.text, query)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {results.length >= 200 && (
              <p className="text-center text-xs text-gray-400 pt-2">Showing first 200 results — refine your search for more precision.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}