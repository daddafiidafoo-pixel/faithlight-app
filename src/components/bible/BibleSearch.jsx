/**
 * BibleSearch
 * Search for words/phrases across Bible chapters.
 * Uses bibleBrainProxy to fetch chapters and highlights matching terms.
 */
import React, { useState, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, BookOpen } from 'lucide-react';

// NT chapters to search through (efficient subset — expand as needed)
const SEARCH_CHAPTERS = [
  { book: 'MAT', chapters: 28 }, { book: 'MRK', chapters: 16 },
  { book: 'LUK', chapters: 24 }, { book: 'JHN', chapters: 21 },
  { book: 'ACT', chapters: 28 }, { book: 'ROM', chapters: 16 },
  { book: 'GAL', chapters: 6 }, { book: 'EPH', chapters: 6 },
  { book: 'PHP', chapters: 4 }, { book: 'HEB', chapters: 13 },
  { book: 'JAS', chapters: 5 }, { book: 'REV', chapters: 22 },
  { book: 'PSA', chapters: 150 }, { book: 'PRO', chapters: 31 },
  { book: 'ISA', chapters: 66 }, { book: 'JHN', chapters: 21 },
];

const BOOK_NAMES = {
  GEN:'Genesis', EXO:'Exodus', PSA:'Psalms', PRO:'Proverbs', ISA:'Isaiah',
  MAT:'Matthew', MRK:'Mark', LUK:'Luke', JHN:'John', ACT:'Acts',
  ROM:'Romans', GAL:'Galatians', EPH:'Ephesians', PHP:'Philippians',
  HEB:'Hebrews', JAS:'James', REV:'Revelation',
};

/** Highlight a query term inside text */
function HighlightText({ text, query }) {
  if (!query) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-yellow-300 text-yellow-900 rounded px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

export default function BibleSearch({ catalog }) {
  const versions = useMemo(
    () => (catalog?.versions ?? []).filter(v => v.hasText && !v.pending && v.textFilesetId && !v.textFilesetId.startsWith('REPLACE')),
    [catalog]
  );

  const [query, setQuery] = useState('');
  const [versionId, setVersionId] = useState(versions[0]?.id || 'en_web');
  const [scope, setScope] = useState('nt'); // 'nt' | 'ot' | 'all'
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const abortRef = useRef(false);

  const selectedMeta = useMemo(() => catalog?.versions?.find(v => v.id === versionId), [catalog, versionId]);

  const scopeChapters = useMemo(() => {
    const NT_BOOKS = ['MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'];
    const OT_BOOKS = ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','PSA','PRO','ISA','JER','EZK','DAN'];
    const filtered = scope === 'nt'
      ? SEARCH_CHAPTERS.filter(c => NT_BOOKS.includes(c.book))
      : scope === 'ot'
        ? SEARCH_CHAPTERS.filter(c => OT_BOOKS.includes(c.book))
        : SEARCH_CHAPTERS;
    return filtered;
  }, [scope]);

  async function runSearch() {
    if (!query.trim() || !selectedMeta?.textFilesetId) return;
    abortRef.current = false;
    setLoading(true);
    setResults(null);

    const matches = [];
    const q = query.trim().toLowerCase();

    for (const { book, chapters } of scopeChapters) {
      if (abortRef.current) break;
      for (let ch = 1; ch <= chapters; ch++) {
        if (abortRef.current) break;
        setProgress(`Searching ${BOOK_NAMES[book] || book} ${ch}…`);
        try {
          const res = await base44.functions.invoke('bibleBrainProxy', {
            action: 'text',
            versionId: selectedMeta.textFilesetId,
            book,
            chapter: String(ch),
          });
          const verses = res?.data?.data?.verses ?? [];
          for (const v of verses) {
            if ((v.text || '').toLowerCase().includes(q)) {
              matches.push({
                book,
                bookName: BOOK_NAMES[book] || book,
                chapter: ch,
                verse: v.verse,
                text: v.text,
              });
            }
          }
        } catch {
          // skip chapter on error
        }
      }
    }

    setResults(matches);
    setLoading(false);
    setProgress('');
  }

  function stop() {
    abortRef.current = true;
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search for a word or phrase…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && runSearch()}
          />
        </div>
        <Select value={versionId} onValueChange={setVersionId}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {versions.map(v => <SelectItem key={v.id} value={v.id}>{v.abbr || v.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nt">NT only</SelectItem>
            <SelectItem value="ot">OT (partial)</SelectItem>
            <SelectItem value="all">All available</SelectItem>
          </SelectContent>
        </Select>
        {loading
          ? <Button variant="outline" onClick={stop}>Stop</Button>
          : <Button onClick={runSearch} disabled={!query.trim()} className="bg-indigo-600 hover:bg-indigo-700">
              <Search className="w-4 h-4 mr-1" /> Search
            </Button>
        }
      </div>

      {/* Progress */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{progress}</span>
          <span className="text-xs text-gray-400">(searching chapter by chapter — this may take a minute)</span>
        </div>
      )}

      {/* Results */}
      {results !== null && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              {results.length === 0
                ? `No results for "${query}" in ${selectedMeta?.abbr || versionId}`
                : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}" in ${selectedMeta?.abbr || versionId}`
              }
            </p>
            {results.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {[...new Set(results.map(r => r.book))].length} books
              </Badge>
            )}
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {results.map((r, i) => (
              <div key={i} className="border rounded-lg px-4 py-3 bg-white hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-700">
                    {r.bookName} {r.chapter}:{r.verse}
                  </span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  <HighlightText text={r.text} query={query.trim()} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {results === null && !loading && (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Type a word or phrase and press Search.</p>
          <p className="text-xs mt-1">Searches verse-by-verse through the selected version.</p>
        </div>
      )}
    </div>
  );
}