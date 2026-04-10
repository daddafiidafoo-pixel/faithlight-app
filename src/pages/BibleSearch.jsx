import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ChevronRight, X, Highlighter, BookMarked, SlidersHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EnhancedBibleSearch from '@/components/bible/EnhancedBibleSearch';
import ChapterSummaryPanel from '@/components/bible/ChapterSummaryPanel';
import VerseSearchBar from '@/components/bible/VerseSearchBar';

// All 66 Bible book names for the book picker
const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians',
  '2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James',
  '1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

// Simple fuzzy match — returns true if query chars appear in order in text
function fuzzyMatch(text, query) {
  if (!query) return true;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

// Highlight matching words in a text snippet
function Highlighted({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  const words = query.trim().split(/\s+/).filter(Boolean);
  const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-yellow-100 text-yellow-900 rounded px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

export default function BibleSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Search mode: 'keyword' | 'book' | 'highlights' | 'journal'
  const [searchMode, setSearchMode] = useState('keyword');
  const [selectedBook, setSelectedBook] = useState('');
  const [verseFrom, setVerseFrom] = useState('');
  const [verseTo, setVerseTo] = useState('');
  const [highlightResults, setHighlightResults] = useState([]);
  const [journalResults, setJournalResults] = useState([]);

  const MODES = [
    { id: 'keyword', label: 'Keyword', ModeIcon: Search },
    { id: 'book', label: 'Book/Range', ModeIcon: BookOpen },
    { id: 'highlights', label: 'My Highlights', ModeIcon: Highlighter },
    { id: 'journal', label: 'My Journal', ModeIcon: BookMarked },
  ];

  const handleSearch = async (e) => {
    e?.preventDefault();
    const q = searchQuery.trim();

    setIsLoading(true);
    setHasSearched(true);
    setResults([]);
    setHighlightResults([]);
    setJournalResults([]);

    try {
      if (searchMode === 'keyword') {
        // Primary: regex search
        let searchResults = [];
        try {
          searchResults = await base44.entities.StructuredBibleVerse.filter(
            { text: { $regex: q, $options: 'i' } }, '-updated_date', 50
          );
        } catch {
          searchResults = [];
        }
        // If no results, do fuzzy fallback from a broader pull
        if (searchResults.length === 0 && q.length >= 3) {
          try {
            const broad = await base44.entities.StructuredBibleVerse.list('-updated_date', 200);
            searchResults = broad.filter(v => fuzzyMatch(v.text || '', q) || fuzzyMatch(v.reference || '', q));
          } catch { searchResults = []; }
        }
        setResults(searchResults);

      } else if (searchMode === 'book') {
        const filter = {};
        if (selectedBook) filter.reference = { $regex: selectedBook, $options: 'i' };
        if (q) filter.text = { $regex: q, $options: 'i' };
        const res = await base44.entities.StructuredBibleVerse.filter(filter, '-updated_date', 80);
        setResults(res);

      } else if (searchMode === 'highlights') {
        const user = await base44.auth.me().catch(() => null);
        if (!user) { setHighlightResults([]); setIsLoading(false); return; }
        const highlights = await base44.entities.VerseHighlight.filter(
          { userEmail: user.email }, '-created_date', 100
        );
        const filtered = q
          ? highlights.filter(h =>
              fuzzyMatch(h.textSnippet || '', q) ||
              fuzzyMatch(h.verseReference || '', q)
            )
          : highlights;
        setHighlightResults(filtered);

      } else if (searchMode === 'journal') {
        const user = await base44.auth.me().catch(() => null);
        if (!user) { setJournalResults([]); setIsLoading(false); return; }
        const entries = await base44.entities.VerseJournalEntry.filter(
          { userEmail: user.email }, '-created_date', 100
        );
        const filtered = q
          ? entries.filter(e =>
              fuzzyMatch(e.reflection || '', q) ||
              fuzzyMatch(e.verseReference || '', q)
            )
          : entries;
        setJournalResults(filtered);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToVerse = (verse) => {
    navigate(`/BibleReader?book=${verse.book_key}&chapter=${verse.chapter}&verse=${verse.verse}`);
  };

  const handleViewSummary = (verse) => {
    setSelectedChapter({ book: verse.book, chapter: verse.chapter });
    setShowSummaryPanel(true);
  };

  const resultCount = searchMode === 'highlights' ? highlightResults.length
    : searchMode === 'journal' ? journalResults.length
    : results.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Bible Search</h1>
          </div>
          <p className="text-gray-500 text-sm">Search by keywords, book, highlights, or journal</p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {MODES.map(({ id, label, ModeIcon }) => (
            <button
              key={id}
              onClick={() => { setSearchMode(id); setHasSearched(false); setResults([]); }}
              className={`flex items-center gap-1.5 flex-shrink-0 min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                searchMode === id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-200'
              }`}
            >
              <ModeIcon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Quick Verse Search Bar */}
        <div className="mb-6">
          <VerseSearchBar onSelectVerse={handleNavigateToVerse} uiLang="en" />
        </div>

        {/* Enhanced Search */}
        {searchMode === 'keyword' && (
          <div className="mb-6">
            <EnhancedBibleSearch onSelectVerse={handleNavigateToVerse} />
          </div>
        )}

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchMode === 'keyword' ? 'Search verses by keyword or phrase…'
                : searchMode === 'book' ? 'Filter text within selected book…'
                : searchMode === 'highlights' ? 'Search your highlights…'
                : 'Search your journal entries…'
              }
              className="w-full px-4 py-3 pl-11 pr-28 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              {searchMode === 'book' && (
                <button
                  type="button"
                  onClick={() => setShowFilters(f => !f)}
                  className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <SlidersHorizontal size={14} />
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? '…' : 'Search'}
              </button>
            </div>
          </div>

          {/* Book/Range filters */}
          {searchMode === 'book' && showFilters && (
            <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Book</label>
                <select
                  value={selectedBook}
                  onChange={e => setSelectedBook(e.target.value)}
                  aria-label="Select Bible book"
                  className="w-full min-h-[44px] border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <option value="">All Books</option>
                  {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">From verse</label>
                  <input
                    type="number"
                    min={1}
                    value={verseFrom}
                    onChange={e => setVerseFrom(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">To verse</label>
                  <input
                    type="number"
                    min={1}
                    value={verseTo}
                    onChange={e => setVerseTo(e.target.value)}
                    placeholder="e.g. 16"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {(selectedBook || verseFrom || verseTo) && (
                <button
                  type="button"
                  onClick={() => { setSelectedBook(''); setVerseFrom(''); setVerseTo(''); }}
                  className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                >
                  <X size={12} /> Clear filters
                </button>
              )}
            </div>
          )}
        </form>

        {/* Results */}
        {hasSearched && (
          <div>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : resultCount === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No results found</p>
                <p className="text-gray-400 text-sm mt-1">Try a different keyword or search mode</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-3 font-medium">{resultCount} result{resultCount !== 1 ? 's' : ''}</p>

                {/* Bible verse results */}
                {(searchMode === 'keyword' || searchMode === 'book') && (
                  <div className="space-y-2">
                    {results
                      .filter(v => {
                        if (verseFrom && v.verse < parseInt(verseFrom)) return false;
                        if (verseTo && v.verse > parseInt(verseTo)) return false;
                        return true;
                      })
                      .map((verse) => (
                        <button
                               key={verse.id}
                               onClick={() => handleNavigateToVerse(verse)}
                               className="w-full text-left p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group shadow-sm"
                               onContextMenu={(e) => {
                                 e.preventDefault();
                                 handleViewSummary(verse);
                               }}
                             >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-bold text-indigo-600 text-sm">{verse.reference}</span>
                                {verse.translation_code && (
                                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                    {verse.translation_code}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 line-clamp-2 text-sm leading-relaxed">
                                <Highlighted text={verse.text} query={searchQuery} />
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewSummary(verse);
                                }}
                                className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors font-medium"
                              >
                                Summary
                              </button>
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            </div>
                            </button>
                            ))}
                            </div>
                            )}

                {/* Highlights results */}
                {searchMode === 'highlights' && (
                  <div className="space-y-2">
                    {highlightResults.map((h) => (
                      <div
                        key={h.id}
                        className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-indigo-600 text-sm">{h.verseReference}</span>
                          <span className={`w-3 h-3 rounded-full flex-shrink-0`}
                            style={{ backgroundColor: h.color === 'yellow' ? '#fde68a' : h.color === 'green' ? '#bbf7d0' : h.color === 'blue' ? '#bfdbfe' : h.color === 'pink' ? '#fbcfe8' : '#ddd6fe' }}
                          />
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed italic">
                          <Highlighted text={h.textSnippet} query={searchQuery} />
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Journal results */}
                {searchMode === 'journal' && (
                  <div className="space-y-2">
                    {journalResults.map((e) => (
                      <div
                        key={e.id}
                        className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-indigo-600 text-sm">{e.verseReference}</span>
                          {e.mood && (
                            <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded capitalize">{e.mood}</span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          <Highlighted text={e.reflection} query={searchQuery} />
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty / start state */}
         {!hasSearched && searchMode !== 'keyword' && (
           <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
             <BookOpen className="w-14 h-14 text-indigo-200 mx-auto mb-4" />
             <p className="text-gray-600 font-medium">
               {searchMode === 'highlights' ? 'Search your highlighted verses'
                 : searchMode === 'journal' ? 'Search your journal reflections'
                 : searchMode === 'book' ? 'Filter by book and verse range'
                 : 'Type a keyword to search the Bible'}
             </p>
             <p className="text-gray-400 text-sm mt-1">Fuzzy search helps find results even with typos</p>
           </div>
         )}

        {/* Chapter Summary Modal */}
        {showSummaryPanel && selectedChapter && (
          <ChapterSummaryPanel
            book={selectedChapter.book}
            chapter={selectedChapter.chapter}
            onClose={() => setShowSummaryPanel(false)}
          />
        )}
        </div>
        </div>
        );
        }