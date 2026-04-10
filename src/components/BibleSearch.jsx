import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

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

export default function BibleSearch({ onSelect }) {
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');

  const chapters = book ? Array.from({ length: CHAPTER_COUNTS[book] || 1 }, (_, i) => i + 1) : [];

  const { data: verses = [], isLoading } = useQuery({
    queryKey: ['bibleVerses', book, chapter],
    queryFn: () => {
      if (!book || !chapter) return [];
      return base44.entities.BibleVerse.filter({
        book: book,
        chapter: parseInt(chapter)
      }, '-verse', 200);
    },
    enabled: !!book && !!chapter
  });

  React.useEffect(() => {
    if (verses.length > 0 && onSelect) {
      onSelect({
        book,
        chapter: parseInt(chapter),
        verses,
        reference: `${book} ${chapter}`
      });
    }
  }, [verses, book, chapter, onSelect]);

  return (
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
        <Select value={chapter} onValueChange={setChapter}>
          <SelectTrigger>
            <SelectValue placeholder="Select chapter" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {chapters.map(c => (
              <SelectItem key={c} value={c.toString()}>Chapter {c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}