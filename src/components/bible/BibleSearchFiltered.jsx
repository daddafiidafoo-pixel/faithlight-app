import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/components/I18nProvider';
import { createPageUrl } from '@/utils';

const TESTAMENT_FILTERS = {
  all: 'All Books',
  old: 'Old Testament',
  new: 'New Testament',
};

const SECTION_FILTERS = {
  gospels: { name: 'Gospels', books: ['matthew', 'mark', 'luke', 'john'] },
  psalms: { name: 'Psalms', books: ['psalms'] },
  prophets: { name: 'Prophets', books: ['isaiah', 'jeremiah', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi'] },
  paulLetters: { name: 'Paul\'s Letters', books: ['romans', 'corinthians', 'galatians', 'ephesians', 'philippians', 'colossians', 'thessalonians', 'timothy', 'titus', 'philemon'] },
};

export default function BibleSearchFiltered() {
  const { t, lang } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [testament, setTestament] = useState('all');
  const [section, setSection] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setSearched(true);

      // Build query filter
      const query = {
        language_code: lang || 'en',
      };

      if (testament !== 'all') {
        query.testament = testament;
      }

      // Fetch verses matching search term
      const verses = await base44.entities.StructuredBibleVerse.filter(query, '-created_date', 100);

      // Filter by search term in text or book name
      let filtered = verses.filter(v =>
        v.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.book_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Filter by section if selected
      if (section !== 'all' && SECTION_FILTERS[section]) {
        const sectionBooks = SECTION_FILTERS[section].books;
        filtered = filtered.filter(v => sectionBooks.includes(v.book_key));
      }

      setResults(filtered.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, testament, section, lang]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTestament('all');
    setSection('all');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder={t('search.placeholder', 'Search by keyword, book name, or verse...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? t('common.searching', 'Searching...') : t('common.search', 'Search')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Testament:</span>
        </div>
        {Object.entries(TESTAMENT_FILTERS).map(([key, label]) => (
          <Button
            key={key}
            variant={testament === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTestament(key)}
            className={testament === key ? 'bg-indigo-600' : ''}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Section:</span>
        </div>
        <Button
          variant={section === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSection('all')}
          className={section === 'all' ? 'bg-indigo-600' : ''}
        >
          All Sections
        </Button>
        {Object.entries(SECTION_FILTERS).map(([key, { name }]) => (
          <Button
            key={key}
            variant={section === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSection(key)}
            className={section === key ? 'bg-indigo-600' : ''}
          >
            {name}
          </Button>
        ))}
      </div>

      {searched && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2 text-gray-600">
          <X className="w-4 h-4" /> Clear Filters
        </Button>
      )}

      {/* Results */}
      <div className="space-y-3">
        {results.length > 0 ? (
          <>
            <p className="text-sm text-gray-600">
              {t('search.resultsCount', `Found ${results.length} verses`, { count: results.length })}
            </p>
            {results.map((verse, idx) => (
              <a
                key={idx}
                href={createPageUrl('BibleReader', `?book=${verse.book_key}&chapter=${verse.chapter}`)}
                className="block p-4 border rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors group"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-indigo-600 group-hover:underline">
                      {verse.book_name} {verse.chapter}:{verse.verse}
                    </p>
                    <p className="text-gray-700 text-sm mt-1 line-clamp-2">{verse.text}</p>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">
                    {verse.testament === 'old' ? t('search.oldTestament', 'OT') : t('search.newTestament', 'NT')}
                  </span>
                </div>
              </a>
            ))}
          </>
        ) : searched ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {t('search.noResults', 'No verses found matching your search. Try different keywords.')}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}