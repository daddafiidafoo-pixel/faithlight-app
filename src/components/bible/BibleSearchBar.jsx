import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

const SECTIONS = [
  { id: 'all', label: 'All Books' },
  { id: 'ot', label: 'Old Testament' },
  { id: 'nt', label: 'New Testament' },
  { id: 'pentateuch', label: 'Pentateuch' },
  { id: 'gospels', label: 'Gospels' },
  { id: 'psalms-proverbs', label: 'Psalms & Proverbs' },
  { id: 'epistles', label: 'Epistles' }
];

const BOOK_SECTIONS = {
  ot: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'],
  nt: ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'],
  pentateuch: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'],
  gospels: ['Matthew', 'Mark', 'Luke', 'John'],
  'psalms-proverbs': ['Psalms', 'Proverbs'],
  epistles: ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude']
};

const ALL_BOOKS = Object.values(BOOK_SECTIONS).flat();

// Sample Bible data (in production, this would come from an API or database)
const SAMPLE_VERSES = [
  { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning God created the heavens and the earth.' },
  { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world that he gave his one and only Son...' },
  { book: 'Psalms', chapter: 23, verse: 1, text: 'The Lord is my shepherd, I lack nothing.' },
  { book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in the Lord with all your heart and lean not on your own understanding...' },
  { book: 'Romans', chapter: 8, verse: 28, text: 'And we know that in all things God works for the good of those who love him...' },
  { book: 'Matthew', chapter: 5, verse: 7, text: 'Blessed are the merciful, for they will be shown mercy.' }
];

export default function BibleSearchBar({ onSelectVerse, onSelectBook }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const filterBooks = (section) => {
    if (section === 'all') return ALL_BOOKS;
    return BOOK_SECTIONS[section] || [];
  };

  const performSearch = (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filteredBooks = filterBooks(selectedSection);
    const lowerQuery = query.toLowerCase();

    // Search in book names
    const bookMatches = filteredBooks.filter(book =>
      book.toLowerCase().includes(lowerQuery)
    ).map(book => ({
      type: 'book',
      book,
      displayText: book
    }));

    // Search in verse text (sample data)
    const verseMatches = SAMPLE_VERSES.filter(verse =>
      filteredBooks.includes(verse.book) &&
      verse.text.toLowerCase().includes(lowerQuery)
    ).map(verse => ({
      type: 'verse',
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
      displayText: `${verse.book} ${verse.chapter}:${verse.verse}`
    }));

    setResults([...bookMatches, ...verseMatches].slice(0, 10));
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleResultClick = (result) => {
    if (result.type === 'book' && onSelectBook) {
      onSelectBook(result.book);
    } else if (result.type === 'verse' && onSelectVerse) {
      onSelectVerse(result.book, result.chapter, result.verse);
    }
    setShowResults(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search Bible passages, books, or keywords..."
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setShowResults(true)}
            className="flex-1 border-0 focus:ring-0 focus:outline-none p-0 text-sm"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Section Filters */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setSelectedSection(section.id);
              performSearch(searchQuery);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedSection === section.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleResultClick(result)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{result.displayText}</p>
                  {result.type === 'verse' && (
                    <p className="text-gray-600 text-xs line-clamp-2 mt-1">{result.text}</p>
                  )}
                </div>
                <span className="text-xs text-indigo-600 font-medium ml-2 flex-shrink-0">
                  {result.type === 'book' ? 'Book' : 'Verse'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && searchQuery && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center z-50">
          <p className="text-gray-500 text-sm">No results found for &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}