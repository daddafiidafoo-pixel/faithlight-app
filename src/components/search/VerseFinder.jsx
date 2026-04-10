import React, { useState, useCallback } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useLocale } from '../lib/useLocale';
import { BIBLE_BOOKS } from '../lib/bibleBooks';

const TOPICS = {
  hope: ['Romans 15:13', 'Psalm 42:5', 'Jeremiah 29:11'],
  love: ['1 John 4:7-8', 'John 13:34-35', '1 Corinthians 13:4-7'],
  faith: ['Hebrews 11:1', 'Romans 10:17', 'Mark 11:24'],
  forgiveness: ['Ephesians 4:31-32', 'Matthew 18:21-22', 'Colossians 3:13'],
  strength: ['Psalm 27:1', 'Philippians 4:13', 'Joshua 1:9'],
  peace: ['Philippians 4:6-7', 'John 14:27', 'Isaiah 26:3'],
};

const TOPIC_LABELS = {
  en: { hope: 'Hope', love: 'Love', faith: 'Faith', forgiveness: 'Forgiveness', strength: 'Strength', peace: 'Peace' },
  om: { hope: 'Abdii', love: 'Jaalala', faith: 'Amantii', forgiveness: 'Dhiifama', strength: 'Cimina', peace: 'Nagaa' },
  am: { hope: 'ተስፋ', love: 'ፍቅር', faith: 'እምነት', forgiveness: 'ይቅርታ', strength: 'ጥንካሬ', peace: 'ሰላም' },
  sw: { hope: 'Tumaini', love: 'Upendo', faith: 'Imani', forgiveness: 'Msamaha', strength: 'Nguvu', peace: 'Amani' },
  ar: { hope: 'أمل', love: 'حب', faith: 'إيمان', forgiveness: 'مغفرة', strength: 'قوة', peace: 'سلام' },
  fr: { hope: 'Espoir', love: 'Amour', faith: 'Foi', forgiveness: 'Pardon', strength: 'Force', peace: 'Paix' },
};

export default function VerseFinder() {
  const { t, lang, safeT, bookName, ref } = useLocale();
  const topicLabels = TOPIC_LABELS[lang] || TOPIC_LABELS.en;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const navigate = useNavigate();

  const handleSearch = useCallback((searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowSuggestions(true);
      return;
    }

    setLoading(true);
    setShowSuggestions(false);

    setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const found = [];

      // Search all 66 books by English or Oromoo name
      BIBLE_BOOKS.forEach((book) => {
        if (
          book.name_en.toLowerCase().includes(term) ||
          book.name_om.toLowerCase().includes(term) ||
          book.code.toLowerCase().includes(term)
        ) {
          found.push({
            type: 'book',
            text: bookName(book),
            ref: `${book.name_en} 1:1`,
            bookCode: book.code,
          });
        }
      });

      // Search by topic
      Object.entries(TOPICS).forEach(([topic, verses]) => {
        if (topic.includes(term)) {
          verses.forEach((verse) => {
            found.push({ type: 'topic', text: `${topicLabels[topic] || topic}: ${verse}`, ref: verse });
          });
        }
      });

      // Direct reference (e.g., "John 3:16" or "Yohaannis 3:16")
      if (/^[1-3]?\s*[a-zA-Z]+\s*\d+/i.test(term)) {
        found.push({ type: 'reference', text: searchTerm, ref: searchTerm });
      }

      setResults(found.slice(0, 10));
      setLoading(false);
    }, 250);
  }, []);

  const handleSelect = (verse) => {
    navigate(createPageUrl('BibleReader', `verse=${encodeURIComponent(verse.ref)}`));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={safeT('search.placeholder', lang === 'om' ? 'Aayata, mata-duree, yookaan kitaaba barbaadi...' : 'Search verses, topics, or books...')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b last:border-b-0 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{result.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {result.type === 'book' && '📖 Book'}
                {result.type === 'topic' && '🏷️ Topic'}
                {result.type === 'reference' && '🔍 Reference'}
              </p>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">{t('common.loading', 'Searching...')}</span>
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-amber-600 inline mr-2" />
          <p className="text-sm text-amber-800">{t('search.noResults', 'No results found. Try a different search.')}</p>
        </div>
      )}

      {/* Suggestions when empty */}
      {showSuggestions && query === '' && (
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-3">{t('verse.popularTopics', 'Popular Topics')}</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(TOPICS).map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setQuery(topic);
                  handleSearch(topic);
                }}
                className="text-left px-3 py-2 bg-gray-100 hover:bg-indigo-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                {topicLabels[topic] || (topic.charAt(0).toUpperCase() + topic.slice(1))}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}