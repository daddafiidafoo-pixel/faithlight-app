import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2 } from 'lucide-react';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John',
  'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
  'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude',
  'Revelation'
];

const TRANSLATIONS = ['WEB', 'KJV', 'NKJV', 'ESV', 'NIV'];

export default function AdvancedBibleSearch({ onSelectVerse, isDarkMode, selectedTranslation = 'WEB' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('keyword'); // keyword, reference, topic
  const [selectedBook, setSelectedBook] = useState('');
  const [translation, setTranslation] = useState(selectedTranslation);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const accentColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  // Parse Bible reference (e.g., "John 3:16" or "Romans 1:1-5")
  const parseReference = (ref) => {
    const match = ref.match(/^([A-Za-z\s\d]+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (!match) return null;
    
    const [, book, chapter, startVerse, endVerse] = match;
    return {
      book: book.trim(),
      chapter: parseInt(chapter),
      startVerse: parseInt(startVerse),
      endVerse: endVerse ? parseInt(endVerse) : parseInt(startVerse)
    };
  };

  // Simulate Bible search (in production, this would query your Bible data)
  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setResults([]);
    setShowResults(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredResults = [];

      if (searchType === 'reference') {
        const ref = parseReference(searchQuery);
        if (ref) {
          filteredResults = [{
            book: ref.book,
            chapter: ref.chapter,
            startVerse: ref.startVerse,
            endVerse: ref.endVerse,
            translation,
            preview: `${ref.book} ${ref.chapter}:${ref.startVerse}${ref.endVerse !== ref.startVerse ? `-${ref.endVerse}` : ''}`
          }];
        }
      } else if (searchType === 'keyword') {
        // Simulate keyword search across books
        const query = searchQuery.toLowerCase();
        const booksToSearch = selectedBook ? [selectedBook] : BIBLE_BOOKS.slice(0, 10);
        
        booksToSearch.forEach(book => {
          for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 10; j++) {
              if (Math.random() > 0.7) {
                filteredResults.push({
                  book,
                  chapter: i,
                  verse: j,
                  translation,
                  preview: `${book} ${i}:${j}`,
                  relevance: Math.floor(Math.random() * 100)
                });
              }
            }
          }
        });

        // Sort by relevance
        filteredResults.sort((a, b) => (b.relevance || 50) - (a.relevance || 50));
        filteredResults = filteredResults.slice(0, 20);
      } else if (searchType === 'topic') {
        // Topic search (predefined topics with sample results)
        const topics = {
          'love': [
            { book: '1 John', chapter: 4, verse: 8 },
            { book: 'John', chapter: 3, verse: 16 },
            { book: '1 Corinthians', chapter: 13, verse: 4 }
          ],
          'faith': [
            { book: 'Hebrews', chapter: 11, verse: 1 },
            { book: 'Romans', chapter: 3, verse: 28 },
            { book: 'Galatians', chapter: 2, verse: 20 }
          ],
          'hope': [
            { book: 'Romans', chapter: 15, verse: 13 },
            { book: '1 Peter', chapter: 1, verse: 3 },
            { book: 'Proverbs', chapter: 23, verse: 18 }
          ],
          'peace': [
            { book: 'John', chapter: 14, verse: 27 },
            { book: 'Philippians', chapter: 4, verse: 6 },
            { book: '1 Peter', chapter: 5, verse: 7 }
          ]
        };

        const topic = searchQuery.toLowerCase();
        if (topics[topic]) {
          filteredResults = topics[topic].map(ref => ({
            ...ref,
            translation,
            preview: `${ref.book} ${ref.chapter}:${ref.verse}`
          }));
        }
      }

      setResults(filteredResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    if (onSelectVerse) {
      onSelectVerse({
        book: result.book,
        chapter: result.chapter,
        verse: result.verse || result.startVerse,
        translation: result.translation
      });
    }
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div className="w-full space-y-4" style={{ backgroundColor: bgColor }}>
      {/* Search Controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger style={{ borderColor }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keyword">Keywords</SelectItem>
              <SelectItem value="reference">Reference (e.g. John 3:16)</SelectItem>
              <SelectItem value="topic">Topics</SelectItem>
            </SelectContent>
          </Select>

          <Select value={translation} onValueChange={setTranslation}>
            <SelectTrigger style={{ borderColor }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSLATIONS.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {searchType === 'keyword' && (
          <Select value={selectedBook} onValueChange={setSelectedBook}>
            <SelectTrigger style={{ borderColor }}>
              <SelectValue placeholder="All Books" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Books</SelectItem>
              {BIBLE_BOOKS.map(book => (
                <SelectItem key={book} value={book}>{book}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder={
                searchType === 'reference' ? 'e.g. John 3:16' :
                searchType === 'topic' ? 'e.g. love, faith, hope' :
                'Search verses...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              style={{
                borderColor,
                backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF',
                color: textColor
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: accentColor }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            onClick={performSearch}
            disabled={isSearching}
            style={{ backgroundColor: accentColor, color: '#FFFFFF' }}
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <Card style={{ borderColor, backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF' }}>
          <CardHeader>
            <CardTitle style={{ color: textColor, fontSize: '14px' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p style={{ color: '#999', fontSize: '14px' }}>
                {isSearching ? 'Searching...' : 'No results found. Try different keywords or topics.'}
              </p>
            ) : (
              results.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left p-3 rounded-lg transition-all hover:opacity-80"
                  style={{
                    borderColor,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: isDarkMode ? '#0F1411' : '#F9F9F9'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: accentColor, fontWeight: 600, fontSize: '13px' }}>
                      {result.preview}
                    </span>
                    {result.relevance && (
                      <Badge variant="outline" style={{ fontSize: '11px' }}>
                        {result.relevance}%
                      </Badge>
                    )}
                  </div>
                  <span style={{ color: '#999', fontSize: '12px' }}>
                    {result.translation}
                  </span>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}