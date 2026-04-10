/**
 * Bible Data Validation Utilities
 * Validates Bible book structure and references
 */

import manifest from '../bible-data/manifest.json';

/**
 * Validate that a book file matches the schema
 */
export function validateBook(bookData) {
  const errors = [];

  // Check required top-level fields
  if (!bookData.meta) errors.push('Missing required field: meta');
  if (!bookData.book_id) errors.push('Missing required field: book_id');
  if (!bookData.book_name) errors.push('Missing required field: book_name');
  if (!bookData.chapters) errors.push('Missing required field: chapters');

  // Validate meta
  if (bookData.meta) {
    if (!bookData.meta.language) errors.push('meta: Missing language');
    if (!bookData.meta.version_id) errors.push('meta: Missing version_id');
    if (![' om', 'am', 'sw', 'ti', 'ar', 'en'].includes(bookData.meta.language)) {
      errors.push(`meta: Invalid language code: ${bookData.meta.language}`);
    }
  }

  // Validate chapters array
  if (Array.isArray(bookData.chapters)) {
    bookData.chapters.forEach((chapter, idx) => {
      if (!Number.isInteger(chapter.chapter) || chapter.chapter < 1) {
        errors.push(`chapters[${idx}]: Invalid chapter number`);
      }
      if (!Array.isArray(chapter.verses) || chapter.verses.length === 0) {
        errors.push(`chapters[${idx}]: Missing or empty verses array`);
      }
      chapter.verses?.forEach((verse, vIdx) => {
        if (!Number.isInteger(verse.verse) || verse.verse < 1) {
          errors.push(`chapters[${idx}].verses[${vIdx}]: Invalid verse number`);
        }
        if (!verse.text || typeof verse.text !== 'string') {
          errors.push(`chapters[${idx}].verses[${vIdx}]: Missing or invalid verse text`);
        }
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get display name for a book in a specific language
 */
export function getBookDisplayName(bookId, languageCode) {
  const bookMapping = manifest.book_mapping.find((b) => b.book_id === bookId);
  if (!bookMapping) return null;
  return bookMapping.display_names[languageCode] || bookMapping.display_names.en;
}

/**
 * Check if a language is available
 */
export function isLanguageAvailable(languageCode) {
  return manifest.languages.some((l) => l.code === languageCode);
}

/**
 * Get fallback language for a given language
 */
export function getFallbackLanguage(languageCode) {
  const lang = manifest.languages.find((l) => l.code === languageCode);
  return lang?.fallback_language || 'en';
}

/**
 * Parse a scripture reference (e.g., "John 3:16" or "Yohannis 3:16")
 * Returns { book_id, chapter, verse } or null if invalid
 */
export function parseScriptureReference(reference, languageCode = 'en') {
  if (!reference || typeof reference !== 'string') return null;

  // Split on chapter:verse pattern (e.g., "3:16" or just "3")
  const match = reference.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
  if (!match) return null;

  const [, bookName, chapter, verse] = match;
  const chapterNum = parseInt(chapter, 10);
  const verseNum = verse ? parseInt(verse, 10) : null;

  // Find book ID by display name in this language or English
  const bookMapping = manifest.book_mapping.find(
    (b) =>
      b.display_names[languageCode]?.toLowerCase() === bookName.toLowerCase() ||
      b.display_names.en?.toLowerCase() === bookName.toLowerCase() ||
      b.book_id.toLowerCase() === bookName.toLowerCase()
  );

  if (!bookMapping) return null;

  return {
    book_id: bookMapping.book_id,
    chapter: chapterNum,
    verse: verseNum,
    book_name: bookMapping.display_names[languageCode] || bookMapping.display_names.en,
  };
}

/**
 * Validate a scripture reference exists (requires book data)
 */
export function validateScriptureExists(bookData, chapter, verse = null) {
  if (!bookData || !bookData.chapters) return false;

  const chapterObj = bookData.chapters.find((c) => c.chapter === chapter);
  if (!chapterObj) return false;

  if (verse === null) return true; // Chapter exists
  return chapterObj.verses.some((v) => v.verse === verse);
}

/**
 * Build a formatted reference string
 */
export function buildReference(bookName, chapter, verse = null) {
  if (verse === null) {
    return `${bookName} ${chapter}`;
  }
  return `${bookName} ${chapter}:${verse}`;
}

/**
 * Get language fallback chain (e.g., om → am → en)
 */
export function getFallbackChain(languageCode) {
  const chain = [languageCode];
  let current = languageCode;

  while (current) {
    const fallback = getFallbackLanguage(current);
    if (!fallback || chain.includes(fallback)) break;
    chain.push(fallback);
    current = fallback;
  }

  return chain;
}

/**
 * Check if a language uses RTL (right-to-left)
 */
export function isRTL(languageCode) {
  const lang = manifest.languages.find((l) => l.code === languageCode);
  return lang?.direction === 'rtl';
}

export default {
  validateBook,
  getBookDisplayName,
  isLanguageAvailable,
  getFallbackLanguage,
  parseScriptureReference,
  validateScriptureExists,
  buildReference,
  getFallbackChain,
  isRTL,
};