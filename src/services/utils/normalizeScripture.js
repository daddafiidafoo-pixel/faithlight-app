/**
 * Scripture normalization utilities
 * Converts provider responses into a consistent format used throughout the app
 */

const DEFAULT_TRANSLATION = 'ENGKJV';

/**
 * Normalize a single verse to app standard format
 */
export function normalizeVerse(rawVerse, translation = DEFAULT_TRANSLATION) {
  if (!rawVerse) return null;

  // Safely handle missing fields with fallback
  const book = rawVerse.book || 'Unknown';
  const chapter = rawVerse.chapter || 0;
  const verse = rawVerse.verse || 0;

  return {
    reference: rawVerse.reference || `${book} ${chapter}:${verse}`.trim(),
    book,
    chapter: Number(chapter),
    verse: Number(verse),
    text: rawVerse.text || rawVerse.verseText || null,
    translation,
    available: rawVerse.available !== false, // preserve unavailability flag
    message: rawVerse.message || null,       // preserve localized unavailability message
  };
}

/**
 * Normalize a chapter response
 */
export function normalizeChapter(rawChapter, book, chapter, translation = DEFAULT_TRANSLATION) {
  if (!rawChapter) return null;

  const verses = rawChapter.verses || [];

  return {
    book,
    chapter: Number(chapter),
    translation,
    verses: verses.map((v) =>
      normalizeVerse(
        {
          book,
          chapter,
          verse: v.verse || v.verseNumber,
          text: v.text || v.verseText,
        },
        translation
      )
    ),
  };
}

/**
 * Normalize search results
 */
export function normalizeSearchResults(rawResults, translation = DEFAULT_TRANSLATION) {
  if (!Array.isArray(rawResults)) return [];

  return rawResults.map((result) => normalizeVerse(result, translation));
}