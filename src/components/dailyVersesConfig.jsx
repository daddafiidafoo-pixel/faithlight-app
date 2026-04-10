/**
 * Daily Verses Configuration
 * 50 Bible verses, rotated throughout the year
 * Verse is selected by: date index = (day of year - 1) % 50
 */

export const DAILY_VERSES = [
  { ref: 'Genesis 1:1', book: 'Genesis', chapter: 1, verse: 1 },
  { ref: 'Psalm 23:1', book: 'Psalm', chapter: 23, verse: 1 },
  { ref: 'John 3:16', book: 'John', chapter: 3, verse: 16 },
  { ref: 'Romans 12:1', book: 'Romans', chapter: 12, verse: 1 },
  { ref: 'Proverbs 3:5-6', book: 'Proverbs', chapter: 3, verse: 5 },
  { ref: 'Matthew 6:9-13', book: 'Matthew', chapter: 6, verse: 9 },
  { ref: '1 Corinthians 13:4-7', book: '1 Corinthians', chapter: 13, verse: 4 },
  { ref: 'Philippians 4:6-7', book: 'Philippians', chapter: 4, verse: 6 },
  { ref: 'Deuteronomy 6:5', book: 'Deuteronomy', chapter: 6, verse: 5 },
  { ref: '1 John 4:7-8', book: '1 John', chapter: 4, verse: 7 },
  { ref: 'Joshua 1:8-9', book: 'Joshua', chapter: 1, verse: 8 },
  { ref: 'Isaiah 40:28-31', book: 'Isaiah', chapter: 40, verse: 28 },
  { ref: 'Hebrews 11:1', book: 'Hebrews', chapter: 11, verse: 1 },
  { ref: '2 Timothy 1:7', book: '2 Timothy', chapter: 1, verse: 7 },
  { ref: 'Proverbs 31:8-9', book: 'Proverbs', chapter: 31, verse: 8 },
  { ref: 'Psalm 119:105', book: 'Psalm', chapter: 119, verse: 105 },
  { ref: 'Matthew 5:14-16', book: 'Matthew', chapter: 5, verse: 14 },
  { ref: 'Colossians 3:15-17', book: 'Colossians', chapter: 3, verse: 15 },
  { ref: 'James 1:22-25', book: 'James', chapter: 1, verse: 22 },
  { ref: 'Ephesians 4:2-6', book: 'Ephesians', chapter: 4, verse: 2 },
  { ref: 'Luke 11:9-10', book: 'Luke', chapter: 11, verse: 9 },
  { ref: 'Mark 11:24', book: 'Mark', chapter: 11, verse: 24 },
  { ref: 'Proverbs 22:6', book: 'Proverbs', chapter: 22, verse: 6 },
  { ref: '1 Peter 1:3-9', book: '1 Peter', chapter: 1, verse: 3 },
  { ref: 'Ecclesiastes 3:1-8', book: 'Ecclesiastes', chapter: 3, verse: 1 },
  { ref: 'Psalm 100', book: 'Psalm', chapter: 100, verse: 1 },
  { ref: 'John 14:27', book: 'John', chapter: 14, verse: 27 },
  { ref: 'Galatians 5:22-23', book: 'Galatians', chapter: 5, verse: 22 },
  { ref: 'Proverbs 27:12', book: 'Proverbs', chapter: 27, verse: 12 },
  { ref: '2 Corinthians 5:17', book: '2 Corinthians', chapter: 5, verse: 17 },
  { ref: 'Psalm 42:11', book: 'Psalm', chapter: 42, verse: 11 },
  { ref: 'Matthew 11:28', book: 'Matthew', chapter: 11, verse: 28 },
  { ref: 'Proverbs 15:22', book: 'Proverbs', chapter: 15, verse: 22 },
  { ref: 'Philippians 2:3-11', book: 'Philippians', chapter: 2, verse: 3 },
  { ref: '1 Thessalonians 5:16-18', book: '1 Thessalonians', chapter: 5, verse: 16 },
  { ref: 'Psalm 37:23-24', book: 'Psalm', chapter: 37, verse: 23 },
  { ref: 'James 3:17-18', book: 'James', chapter: 3, verse: 17 },
  { ref: 'Romans 8:28', book: 'Romans', chapter: 8, verse: 28 },
  { ref: 'Titus 2:11-14', book: 'Titus', chapter: 2, verse: 11 },
  { ref: 'Psalm 119:165', book: 'Psalm', chapter: 119, verse: 165 },
  { ref: 'Matthew 7:7-11', book: 'Matthew', chapter: 7, verse: 7 },
  { ref: 'Proverbs 9:10', book: 'Proverbs', chapter: 9, verse: 10 },
  { ref: 'John 1:1-5', book: 'John', chapter: 1, verse: 1 },
  { ref: 'Micah 6:8', book: 'Micah', chapter: 6, verse: 8 },
  { ref: 'Psalm 146:5-10', book: 'Psalm', chapter: 146, verse: 5 },
  { ref: 'Proverbs 16:9', book: 'Proverbs', chapter: 16, verse: 9 },
  { ref: 'Colossians 1:9-14', book: 'Colossians', chapter: 1, verse: 9 },
  { ref: 'Hebrews 12:1-3', book: 'Hebrews', chapter: 12, verse: 1 },
  { ref: 'Romans 3:21-26', book: 'Romans', chapter: 3, verse: 21 },
  { ref: 'Proverbs 1:7', book: 'Proverbs', chapter: 1, verse: 7 },
];

export const getTodayVerse = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const index = (dayOfYear - 1) % DAILY_VERSES.length;
  return DAILY_VERSES[index];
};

export const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};