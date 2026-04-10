import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, X, Zap } from 'lucide-react';
import { advancedSearch, fuzzySearch, optimizeResults } from './bibleSearchEngine';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs',
  'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const CHAPTER_COUNTS = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25,
  '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalm': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Songs': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
  'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3,
  'Haggai': 2, 'Zechariah': 14, 'Malachi': 4, 'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
  '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6, 'Philippians': 4, 'Colossians': 4,
  '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3, 'Philemon': 1,
  'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
};

export default function BibleAdvancedSearch({ onSelect }) {
  const [book, setBook] = useState('');
  const [startChapter, setStartChapter] = useState('');
  const [endChapter, setEndChapter] = useState('');
  const [startVerse, setStartVerse] = useState('');
  const [endVerse, setEndVerse] = useState('');
  const [translation, setTranslation] = useState('WEB');
  const [keyword, setKeyword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const chapters = book ? Array.from({ length: CHAPTER_COUNTS[book] || 1 }, (_, i) => i + 1) : [];
  const maxChapter = startChapter ? parseInt(startChapter) : 1;

  // Fetch available translations
  const { data: translations = [] } = useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const verses = await base44.entities.BibleVerse.list('translation', 1);
      const unique = [...new Set(verses.map(v => v.translation))];
      return unique;
    }
  });

  // Fetch verses based on filters
  const { data: verses = [], isLoading } = useQuery({
    queryKey: ['bibleVerses', book, startChapter, endChapter, startVerse, endVerse, translation, keyword],
    queryFn: async () => {
      if (!book || !startChapter) return [];

      // Handle chapter range
      const start = parseInt(startChapter);
      const end = endChapter ? parseInt(endChapter) : start;

      let results = [];
      for (let ch = start; ch <= end; ch++) {
        const chapterVerses = await base44.entities.BibleVerse.filter({
          book: book,
          translation: translation,
          chapter: ch
        }, 'verse', 500);
        results.push(...chapterVerses);
      }

      // Use advanced search engine for intelligent filtering
      const filters = {
        book,
        startChapter: start,
        endChapter: end,
        translation,
        keyword: keyword.trim()
      };

      if (startVerse) filters.startVerse = parseInt(startVerse);
      if (endVerse) filters.endVerse = parseInt(endVerse);

      let filtered = advancedSearch(results, filters);
      filtered = optimizeResults(filtered);

      return filtered;
    },
    enabled: !!book && !!startChapter
  });

  const handleSearch = () => {
    if (!book || !startChapter) return;

    const start = parseInt(startChapter);
    const end = endChapter ? parseInt(endChapter) : start;

    if (verses.length === 0) {
      alert('No verses found matching your criteria');
      return;
    }

    // Generate reference
    let reference = `${book} ${start}`;
    if (end !== start) reference += `-${end}`;
    if (startVerse) reference += `:${startVerse}`;
    if (endVerse && !startVerse) reference += `:1-${endVerse}`;
    else if (endVerse && startVerse) reference += `-${endVerse}`;

    if (keyword) reference += ` (search: "${keyword}")`;

    onSelect({
      book,
      startChapter: start,
      endChapter: end,
      startVerse: startVerse ? parseInt(startVerse) : null,
      endVerse: endVerse ? parseInt(endVerse) : null,
      translation,
      keyword,
      verses,
      reference
    });
  };

  const handleReset = () => {
    setBook('');
    setStartChapter('');
    setEndChapter('');
    setStartVerse('');
    setEndVerse('');
    setKeyword('');
    setTranslation('WEB');
    setShowAdvanced(false);
  };

  const isFiltered = book || startChapter || keyword || translation !== 'WEB';

  return (
    <div className="space-y-4">
      {/* Basic Search */}
      <div className="space-y-3">
        <Select value={book} onValueChange={setBook}>
          <SelectTrigger>
            <SelectValue placeholder="Select book" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {BIBLE_BOOKS.map(b => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {book && (
          <Select value={startChapter} onValueChange={setStartChapter}>
            <SelectTrigger>
              <SelectValue placeholder="Start chapter" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {chapters.map(c => (
                <SelectItem key={c} value={c.toString()}>Chapter {c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Translation Filter */}
      {translations.length > 1 && (
        <Select value={translation} onValueChange={setTranslation}>
          <SelectTrigger>
            <SelectValue placeholder="Translation" />
          </SelectTrigger>
          <SelectContent>
            {translations.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Toggle Advanced */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '▼ Less Options' : '▶ Advanced Filters'}
      </Button>

      {/* Advanced Filters */}
      {showAdvanced && book && startChapter && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="p-4 space-y-3">
            {/* Verse Range */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Verse Range (optional)</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Start verse"
                  value={startVerse}
                  onChange={(e) => setStartVerse(e.target.value)}
                  min="1"
                  className="w-24 text-sm"
                />
                <span className="flex items-center text-gray-500">–</span>
                <Input
                  type="number"
                  placeholder="End verse"
                  value={endVerse}
                  onChange={(e) => setEndVerse(e.target.value)}
                  min="1"
                  className="w-24 text-sm"
                />
              </div>
            </div>

            {/* Chapter Range */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">End Chapter (optional)</p>
              <Select value={endChapter} onValueChange={setEndChapter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Same as start" />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {chapters.map(c => (
                    c >= (startChapter ? parseInt(startChapter) : 1) && (
                      <SelectItem key={c} value={c.toString()}>Chapter {c}</SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Keyword Search */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Search Keywords</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 'love', 'faith', 'Jesus'"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="text-sm flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Uses AI-powered relevance ranking</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}

      {verses.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-green-700">
              <strong>{verses.length}</strong> verse{verses.length !== 1 ? 's' : ''} found
            </p>
            {keyword && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                Ranked by relevance
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSearch}
          disabled={!book || !startChapter || isLoading}
          className="flex-1 gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </Button>
        {isFiltered && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1"
          >
            <X className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}