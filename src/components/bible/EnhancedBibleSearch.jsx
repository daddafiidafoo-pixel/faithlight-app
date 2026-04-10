import React, { useState } from 'react';
import { Search, BookOpen, ChevronRight, X, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { parseVerseReference, getTestament, getBookSection, BIBLE_BOOKS, OLD_TESTAMENT, NEW_TESTAMENT } from '@/lib/verseParser';

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

export default function EnhancedBibleSearch({ onSelectVerse }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTestament, setSelectedTestament] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');

  const handleSearch = async (e) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      // Check if it's a verse reference like "John 3:16"
      const verseRef = parseVerseReference(q);
      
      if (verseRef) {
        // Exact verse reference search
        const filter = { book: verseRef.book, chapter: verseRef.chapter };
        let results = await base44.entities.StructuredBibleVerse.filter(filter, '-updated_date', 50);
        
        if (verseRef.startVerse) {
          results = results.filter(v => v.verse >= verseRef.startVerse && v.verse <= (verseRef.endVerse || verseRef.startVerse));
        }
        
        setResults(results);
      } else {
        // Keyword search across Bible text
        let filter = {};
        
        // Apply testament filter
        if (selectedTestament === 'ot') {
          filter.book = { $in: OLD_TESTAMENT };
        } else if (selectedTestament === 'nt') {
          filter.book = { $in: NEW_TESTAMENT };
        }
        
        // Apply section filter
        if (selectedSection !== 'all') {
          // Map section to books (simplified for now)
          const sectionBooks = {
            'gospels': ['Matthew', 'Mark', 'Luke', 'John'],
            'epistles': ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude']
          };
          if (sectionBooks[selectedSection]) {
            filter.book = { $in: sectionBooks[selectedSection] };
          }
        }
        
        // Add keyword search
        filter.text = { $regex: q, $options: 'i' };
        
        const keywordResults = await base44.entities.StructuredBibleVerse.filter(filter, '-updated_date', 50);
        setResults(keywordResults);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verse (e.g., 'John 3:16') or keyword…"
            className="w-full px-4 py-3 pl-11 pr-28 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-500'}`}
              aria-label="Toggle filters"
            >
              <Filter size={14} />
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? '…' : 'Search'}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Testament</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'ot', label: 'Old Testament' },
                  { id: 'nt', label: 'New Testament' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedTestament(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedTestament === opt.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Section</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'gospels', label: 'Gospels' },
                  { id: 'epistles', label: 'Epistles' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedSection(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedSection === opt.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Results */}
      {hasSearched && (
        <div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
              <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">No results found</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">{results.length} result(s)</p>
              {results.map((verse) => (
                <button
                  key={verse.id}
                  onClick={() => onSelectVerse?.(verse)}
                  className="w-full text-left p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group"
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
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}