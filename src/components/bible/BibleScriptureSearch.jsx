import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X, BookOpen, ArrowRight, GitBranch, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

// Parse "John 3:16" or "John 3:16-18" or "1 Cor 13:4"
function parseReference(input) {
  // Match patterns like: Book Chapter:Verse or Book Chapter:Verse-Verse
  const refPattern = /^((?:\d\s*)?[a-zA-Z\s]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/;
  const match = input.trim().match(refPattern);
  if (!match) return null;
  return {
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    verseStart: match[3] ? parseInt(match[3]) : null,
    verseEnd: match[4] ? parseInt(match[4]) : null,
  };
}

// Normalize book names for matching
const BOOK_ALIASES = {
  'gen': 'Genesis', 'ex': 'Exodus', 'lev': 'Leviticus', 'num': 'Numbers', 'deut': 'Deuteronomy',
  'josh': 'Joshua', 'judg': 'Judges', '1sam': '1 Samuel', '2sam': '2 Samuel',
  '1ki': '1 Kings', '2ki': '2 Kings', '1chr': '1 Chronicles', '2chr': '2 Chronicles',
  'ps': 'Psalm', 'psa': 'Psalm', 'prov': 'Proverbs', 'eccl': 'Ecclesiastes',
  'isa': 'Isaiah', 'jer': 'Jeremiah', 'lam': 'Lamentations', 'ezek': 'Ezekiel', 'dan': 'Daniel',
  'hos': 'Hosea', 'joel': 'Joel', 'amos': 'Amos', 'obad': 'Obadiah', 'jon': 'Jonah',
  'mic': 'Micah', 'nah': 'Nahum', 'hab': 'Habakkuk', 'zeph': 'Zephaniah',
  'hag': 'Haggai', 'zech': 'Zechariah', 'mal': 'Malachi',
  'matt': 'Matthew', 'mt': 'Matthew', 'mk': 'Mark', 'lk': 'Luke', 'jn': 'John',
  'rom': 'Romans', '1cor': '1 Corinthians', '2cor': '2 Corinthians', 'gal': 'Galatians',
  'eph': 'Ephesians', 'phil': 'Philippians', 'col': 'Colossians',
  '1thes': '1 Thessalonians', '2thes': '2 Thessalonians', '1tim': '1 Timothy', '2tim': '2 Timothy',
  'tit': 'Titus', 'phlm': 'Philemon', 'heb': 'Hebrews', 'jas': 'James',
  '1pet': '1 Peter', '2pet': '2 Peter', '1jn': '1 John', '2jn': '2 John', '3jn': '3 John',
  'jude': 'Jude', 'rev': 'Revelation',
};

const ALL_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah',
  'Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs','Isaiah','Jeremiah',
  'Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah',
  'Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke',
  'John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians',
  'Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy',
  'Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John',
  'Jude','Revelation'
];

function resolveBook(input) {
  const normalized = input.toLowerCase().replace(/\s+/g, '');
  if (BOOK_ALIASES[normalized]) return BOOK_ALIASES[normalized];
  // Fuzzy match against full names
  const exact = ALL_BOOKS.find(b => b.toLowerCase() === input.toLowerCase());
  if (exact) return exact;
  const starts = ALL_BOOKS.find(b => b.toLowerCase().startsWith(input.toLowerCase().slice(0, 4)));
  return starts || null;
}

const CROSS_REFERENCE_MAP = {
  'John 3:16': ['Romans 5:8', 'Romans 8:32', '1 John 4:9', 'Ephesians 2:8'],
  'Psalm 23:1': ['Psalm 80:1', 'Isaiah 40:11', 'Ezekiel 34:11', 'John 10:11'],
  'Romans 8:28': ['Genesis 50:20', 'Jeremiah 29:11', 'Philippians 1:6'],
  'Jeremiah 29:11': ['Romans 8:28', 'Psalm 139:16', 'Proverbs 19:21'],
  'Matthew 5:3': ['Luke 6:20', 'Isaiah 57:15', 'Psalm 34:18'],
};

export default function BibleScriptureSearch({ translation = 'WEB', onNavigate, isDarkMode = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('keyword'); // 'keyword' | 'reference'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedResult, setExpandedResult] = useState(null);
  const [crossRefs, setCrossRefs] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Detect mode from query
  useEffect(() => {
    const parsed = parseReference(query);
    setMode(parsed ? 'reference' : 'keyword');
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    setCrossRefs([]);
    setExpandedResult(null);

    try {
      const parsed = parseReference(query);
      if (parsed) {
        // Reference search
        const resolvedBook = resolveBook(parsed.book);
        if (!resolvedBook) {
          setError(`Book "${parsed.book}" not found. Try spelling it out fully.`);
          setLoading(false);
          return;
        }

        const all = await base44.entities.BibleVerse.filter({
          book: resolvedBook,
          chapter: parsed.chapter,
          translation,
        }, 'verse', 200);

        let found = all;
        if (parsed.verseStart) {
          found = all.filter(v =>
            v.verse >= parsed.verseStart &&
            (!parsed.verseEnd || v.verse <= parsed.verseEnd)
          );
        }
        setResults(found.map(v => ({ ...v, matchType: 'reference' })));

        // Show cross-references for known passages
        const refKey = `${resolvedBook} ${parsed.chapter}:${parsed.verseStart || 1}`;
        if (CROSS_REFERENCE_MAP[refKey]) setCrossRefs(CROSS_REFERENCE_MAP[refKey]);
      } else {
        // Keyword search — search across all books
        const keywords = query.trim().toLowerCase().split(/\s+/).filter(w => w.length > 2);
        if (!keywords.length) { setError('Please enter at least one keyword (3+ chars)'); setLoading(false); return; }

        // Search verse by verse using a broad text match
        const allVerses = await base44.entities.BibleVerse.filter({ translation }, 'verse', 2000);
        const matched = allVerses.filter(v =>
          v.text && keywords.every(k => v.text.toLowerCase().includes(k))
        ).slice(0, 50);

        setResults(matched.map(v => ({ ...v, matchType: 'keyword', keywords })));
      }
    } catch (err) {
      setError('Search failed. Make sure Bible data is imported.');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') setOpen(false);
  };

  const highlightText = (text, keywords = []) => {
    if (!keywords.length) return text;
    let result = text;
    keywords.forEach(kw => {
      const regex = new RegExp(`(${kw})`, 'gi');
      result = result.replace(regex, '**$1**');
    });
    return result.split('**').map((part, i) =>
      keywords.some(k => part.toLowerCase() === k.toLowerCase())
        ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
        : part
    );
  };

  const bg = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textCol = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedCol = isDarkMode ? '#A0A0A0' : '#6B7280';
  const borderCol = isDarkMode ? '#2A2F2C' : '#E5E7EB';

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
        style={{ color: isDarkMode ? '#8FB996' : '#6B8E6E' }}
        title="Search Scripture"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">Search</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: bg, border: `1px solid ${borderCol}` }}>
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: borderCol }}>
              <Search className="w-5 h-5 flex-shrink-0" style={{ color: '#6366F1' }} />
              <Input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by keyword or reference (e.g. 'love', 'John 3:16', '1 Cor 13:4-7')"
                className="border-none shadow-none focus-visible:ring-0 text-base flex-1"
                style={{ backgroundColor: 'transparent', color: textCol }}
              />
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {mode === 'reference' ? '📍 Reference' : '🔍 Keyword'}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Search button */}
            <div className="px-4 py-2 flex gap-2" style={{ borderBottom: `1px solid ${borderCol}` }}>
              <Button size="sm" onClick={handleSearch} disabled={loading} className="gap-1.5">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Search
              </Button>
              <span className="text-xs self-center" style={{ color: mutedCol }}>
                {mode === 'reference' ? 'Direct to passage' : 'Searches verse text'}
              </span>
              {results.length > 0 && (
                <span className="text-xs self-center ml-auto" style={{ color: mutedCol }}>
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* Cross-references */}
              {crossRefs.length > 0 && (
                <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: isDarkMode ? '#1A2A3A' : '#EFF6FF', border: `1px solid ${isDarkMode ? '#2A3A4A' : '#BFDBFE'}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-700">Cross-references</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {crossRefs.map(ref => (
                      <button
                        key={ref}
                        onClick={() => { setQuery(ref); handleSearch(); }}
                        className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        {ref}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {results.map((v, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 transition-all"
                  style={{ backgroundColor: expandedResult === i ? (isDarkMode ? '#1A3A2A' : '#F0FDF4') : (isDarkMode ? '#242924' : '#F9FAFB'), border: `1px solid ${borderCol}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold" style={{ color: '#6366F1' }}>
                          {v.book} {v.chapter}:{v.verse}
                        </span>
                        <span className="text-xs" style={{ color: mutedCol }}>{v.translation}</span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: textCol }}>
                        {v.matchType === 'keyword' ? highlightText(v.text, v.keywords) : v.text}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="Go to this verse"
                        onClick={() => {
                          onNavigate?.({ book: v.book, chapter: v.chapter, verse: v.verse });
                          setOpen(false);
                        }}
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setExpandedResult(expandedResult === i ? null : i)}
                      >
                        {expandedResult === i ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                  {expandedResult === i && (
                    <div className="mt-3 pt-3 border-t flex gap-2" style={{ borderColor: borderCol }}>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => {
                          onNavigate?.({ book: v.book, chapter: v.chapter, verse: v.verse });
                          setOpen(false);
                        }}
                      >
                        <BookOpen className="w-3 h-3" /> Open Chapter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(`${v.book} ${v.chapter}:${v.verse} — ${v.text}`);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {!loading && !error && results.length === 0 && query && (
                <div className="text-center py-10">
                  <Search className="w-8 h-8 mx-auto mb-3" style={{ color: mutedCol }} />
                  <p className="text-sm" style={{ color: mutedCol }}>No results. Try a different keyword or check the book name.</p>
                  <p className="text-xs mt-1" style={{ color: mutedCol }}>Examples: "love", "John 3:16", "faith hope love"</p>
                </div>
              )}

              {!query && (
                <div className="text-center py-8">
                  <p className="text-sm font-medium" style={{ color: textCol }}>Search Tips</p>
                  <div className="mt-3 space-y-2 text-left max-w-sm mx-auto">
                    {[
                      ['📍 Reference', 'John 3:16 — goes directly to verse'],
                      ['📍 Range', '1 Cor 13:4-7 — shows verse range'],
                      ['🔍 Keyword', 'love — finds all verses containing "love"'],
                      ['🔍 Phrase', 'faith hope love — finds verses with all words'],
                    ].map(([badge, desc]) => (
                      <div key={badge} className="flex items-start gap-2">
                        <span className="text-xs font-medium shrink-0" style={{ color: '#6366F1' }}>{badge}</span>
                        <span className="text-xs" style={{ color: mutedCol }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}