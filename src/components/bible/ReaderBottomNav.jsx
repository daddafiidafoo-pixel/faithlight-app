import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CHAPTER_COUNTS = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25,
  '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42,
  'Psalm': 150, 'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Songs': 8, 'Isaiah': 66, 'Jeremiah': 52,
  'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1,
  'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14,
  'Malachi': 4, 'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
  '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6, 'Philippians': 4,
  'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4,
  'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5,
  '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
};

export default function ReaderBottomNav({ book, chapter, onChapterChange, isDarkMode }) {
  if (!book || !chapter) return null;

  const maxChapter = CHAPTER_COUNTS[book] || 150;
  const chapterNum = Number(chapter);
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < maxChapter;

  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-4 rounded-xl mt-6 mb-4"
      style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}
    >
      <Button
        variant="outline"
        className="flex-1 gap-2 justify-start"
        disabled={!hasPrev}
        onClick={() => onChapterChange(chapterNum - 1)}
        style={{
          borderColor,
          color: hasPrev ? primaryColor : borderColor,
          opacity: hasPrev ? 1 : 0.4,
        }}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm font-medium">
          {hasPrev ? `${book} ${chapterNum - 1}` : 'First Chapter'}
        </span>
      </Button>

      <span className="text-xs font-semibold px-2 shrink-0" style={{ color: primaryColor }}>
        {chapterNum} / {maxChapter}
      </span>

      <Button
        variant="outline"
        className="flex-1 gap-2 justify-end"
        disabled={!hasNext}
        onClick={() => onChapterChange(chapterNum + 1)}
        style={{
          borderColor,
          color: hasNext ? primaryColor : borderColor,
          opacity: hasNext ? 1 : 0.4,
        }}
      >
        <span className="text-sm font-medium">
          {hasNext ? `${book} ${chapterNum + 1}` : 'Last Chapter'}
        </span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}