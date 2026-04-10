import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

export default function SemanticBibleSearch() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    testament: '',
    book_key: '',
    language_code: 'en'
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await base44.functions.invoke('semanticBibleSearch', {
        query,
        language_code: filters.language_code,
        testament: filters.testament || undefined,
        book_key: filters.book_key || undefined,
        limit: 50
      });

      setResults(response.data?.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('search.semantic', 'Search by meaning...')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {t('common.search', 'Search')}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium">Testament</label>
              <select
                value={filters.testament}
                onChange={(e) => setFilters({ ...filters, testament: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="">All</option>
                <option value="old">Old Testament</option>
                <option value="new">New Testament</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Book</label>
              <Input
                placeholder="e.g., genesis"
                value={filters.book_key}
                onChange={(e) => setFilters({ ...filters, book_key: e.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Language</label>
              <select
                value={filters.language_code}
                onChange={(e) => setFilters({ ...filters, language_code: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="en">English</option>
                <option value="om">Oromo</option>
                <option value="am">Amharic</option>
                <option value="ar">Arabic</option>
                <option value="sw">Swahili</option>
              </select>
            </div>
          </div>
        )}
      </form>

      <div className="mt-6 space-y-3">
        {results.map((verse, idx) => (
          <div key={idx} className="p-3 border rounded-lg hover:bg-blue-50">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">
                  {verse.book_name} {verse.chapter}:{verse.verse}
                </h4>
                <p className="text-sm text-gray-700 mt-1">{verse.text}</p>
                {verse.reason && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Match: {verse.reason}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  {verse.relevance_score}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && query && (
        <p className="text-center text-gray-500 mt-8">No results found</p>
      )}
    </div>
  );
}