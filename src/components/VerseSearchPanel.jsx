import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function VerseSearchPanel({ onVerseSelect, onClose, t, uiLang }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('both');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await base44.functions.invoke('searchBibleVerses', {
        query: query.trim(),
        searchType
      });
      setResults(response.data?.verses || []);
      if (!response.data?.verses?.length) {
        toast.info('No verses found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search verses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-800">Add Scripture</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g., 'John 3:16' or 'hope'"
            className="flex-1 min-h-[44px] border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50"
          >
            <Search size={16} />
          </button>
        </div>

        <div className="flex gap-2">
          {['reference', 'keyword', 'both'].map(type => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`flex-1 min-h-[44px] px-2 py-2 text-xs rounded-lg font-medium transition-colors flex items-center justify-center ${
                searchType === type
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'both' ? 'Both' : type === 'reference' ? 'Reference' : 'Keyword'}
            </button>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {results.map((verse, i) => (
            <button
              key={i}
              onClick={() => {
                onVerseSelect(verse);
                setQuery('');
                setResults([]);
              }}
              className="w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 border border-gray-100 transition-colors"
            >
              <p className="text-xs font-semibold text-indigo-600 mb-1">{verse.reference}</p>
              <p className="text-xs text-gray-600 line-clamp-2">{verse.text}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}