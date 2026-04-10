import React, { useState } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VerseSearchBar({ onSelectVerse = null, uiLang = 'en' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e) => {
    const q = e.target.value.trim();
    setQuery(q);

    if (q.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      // Search using Bible Brain API via backend function
      const response = await base44.functions.invoke('bibleBrainVerseSearch', {
        query: q,
        limit: 15,
      });

      if (response?.data?.verses) {
        setResults(response.data.verses);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVerse = (verse) => {
    if (onSelectVerse) {
      onSelectVerse(verse);
    }
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={uiLang === 'om' ? 'Aayata sagalee barbaadi...' : 'Search verses by keyword...'}
          className="w-full min-h-[44px] px-4 pl-11 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-gray-500">
              <Loader size={16} className="animate-spin" />
              <span className="text-sm">{uiLang === 'om' ? 'Barbaadaa jira...' : 'Searching...'}</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {query.length < 2
                ? uiLang === 'om' ? 'Erga hoji barbaadi' : 'Type to search'
                : uiLang === 'om' ? 'Eegaa hin argamne' : 'No results found'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map((verse, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleSelectVerse(verse)}
                    className="w-full text-left p-3 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-indigo-600 text-sm">{verse.reference}</p>
                        <p className="text-gray-600 text-xs line-clamp-2 mt-1">{verse.text}</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}