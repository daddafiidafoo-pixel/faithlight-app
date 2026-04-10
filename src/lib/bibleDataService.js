/**
 * Bible Data Service
 * Loads and serves Bible data with fallback language support
 */

import { getFallbackChain, isLanguageAvailable } from './bibleDataValidator';

// Cache for loaded books
const bookCache = {};

/**
 * Load a book from Bible data folder
 * Returns null if not found
 */
export async function loadBook(bookId, languageCode) {
  const cacheKey = `${languageCode}_${bookId}`;

  // Return from cache if available
  if (bookCache[cacheKey]) {
    return bookCache[cacheKey];
  }

  try {
    const response = await fetch(`/bible-data/${languageCode}/${bookId}.json`);
    if (!response.ok) {
      console.warn(`Book not found: ${languageCode}/${bookId}`);
      return null;
    }

    const data = await response.json();
    bookCache[cacheKey] = data;
    return data;
  } catch (err) {
    console.error(`Error loading book ${languageCode}/${bookId}:`, err);
    return null;
  }
}

/**
 * Get a verse with automatic fallback to other languages
 * Returns { verse_text, language_used, fallback_used }
 */
export async function getVerse(bookId, chapter, verse, preferredLanguage = 'en') {
  if (!isLanguageAvailable(preferredLanguage)) {
    preferredLanguage = 'en';
  }

  const fallbackChain = getFallbackChain(preferredLanguage);

  for (const lang of fallbackChain) {
    const book = await loadBook(bookId, lang);
    if (!book) continue;

    const chapterObj = book.chapters.find((c) => c.chapter === chapter);
    if (!chapterObj) continue;

    const verseObj = chapterObj.verses.find((v) => v.verse === verse);
    if (!verseObj) continue;

    return {
      verse_text: verseObj.text,
      language_used: lang,
      fallback_used: lang !== preferredLanguage,
      reference: verseObj.reference || `${book.book_name} ${chapter}:${verse}`,
    };
  }

  return {
    verse_text: null,
    language_used: null,
    fallback_used: false,
    error: `Verse not found: ${bookId} ${chapter}:${verse}`,
  };
}

/**
 * Get all verses in a chapter
 */
export async function getChapter(bookId, chapter, languageCode = 'en') {
  const book = await loadBook(bookId, languageCode);
  if (!book) {
    return {
      verses: [],
      error: `Book not found: ${bookId} in ${languageCode}`,
    };
  }

  const chapterObj = book.chapters.find((c) => c.chapter === chapter);
  if (!chapterObj) {
    return {
      verses: [],
      error: `Chapter not found: ${bookId} ${chapter}`,
    };
  }

  return {
    book_id: book.book_id,
    book_name: book.book_name,
    chapter: chapterObj.chapter,
    verses: chapterObj.verses,
    language: book.meta.language,
  };
}

/**
 * Get all chapters in a book
 */
export async function getBookMetadata(bookId, languageCode = 'en') {
  const book = await loadBook(bookId, languageCode);
  if (!book) {
    return null;
  }

  return {
    book_id: book.book_id,
    book_name: book.book_name,
    book_abbr: book.book_abbr,
    chapter_count: book.chapters.length,
    language: book.meta.language,
    version_id: book.meta.version_id,
  };
}

/**
 * Search verses by text (basic substring search)
 * Returns array of matching verses
 */
export async function searchVerses(query, bookId = null, languageCode = 'en') {
  if (!query || query.length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const results = [];

  try {
    // Try to load the book
    const book = await loadBook(bookId, languageCode);
    if (!book) {
      console.warn(`Could not load book for search: ${bookId} in ${languageCode}`);
      return [];
    }

    book.chapters.forEach((chapter) => {
      chapter.verses.forEach((verse) => {
        if (verse.text.toLowerCase().includes(queryLower)) {
          results.push({
            book_id: book.book_id,
            book_name: book.book_name,
            chapter: chapter.chapter,
            verse: verse.verse,
            text: verse.text,
            reference: `${book.book_name} ${chapter.chapter}:${verse.verse}`,
          });
        }
      });
    });
  } catch (err) {
    console.error(`Error searching verses:`, err);
  }

  return results;
}

/**
 * Preload multiple books for faster access
 */
export async function preloadBooks(bookIds, languageCode = 'en') {
  const results = await Promise.all(
    bookIds.map((id) => loadBook(id, languageCode))
  );
  return results.filter((r) => r !== null);
}

/**
 * Clear cache (useful for testing or memory management)
 */
export function clearCache() {
  Object.keys(bookCache).forEach((key) => delete bookCache[key]);
}

/**
 * Get cache stats (for debugging)
 */
export function getCacheStats() {
  return {
    cached_books: Object.keys(bookCache).length,
    memory_estimate: Object.keys(bookCache).length * 500, // rough estimate
  };
}

export default {
  loadBook,
  getVerse,
  getChapter,
  getBookMetadata,
  searchVerses,
  preloadBooks,
  clearCache,
  getCacheStats,
};