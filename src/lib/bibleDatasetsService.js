/**
 * Bible Dataset Service
 * 
 * Provides language-aware loading of Bible verses and chapters from local dataset files.
 * Supports graceful fallback to configured fallback language when content unavailable.
 * 
 * File structure:
 * bible-data/
 *   manifest.json
 *   en/genesis.json, en/john.json, etc.
 *   om/genesis.json, om/john.json, etc.
 *   ... (one folder per language)
 */

import manifest from '../bible-data/manifest.json';

// Cache for loaded books and chapters
const bookCache = new Map();
const languageCache = new Map();

/**
 * Fetch chapter from Bible Brain API as fallback
 * @private
 * @param {string} language - Language code
 * @param {string} bookId - Book identifier
 * @param {number} chapter - Chapter number
 * @returns {Promise<Object|null>} API response or null if failed
 */
async function fetchFromBibleBrain(language, bookId, chapter) {
  try {
    const response = await fetch("/api/functions/bibleBrainFetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, bookId, chapter }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.success ? data : null;
  } catch (err) {
    console.warn(`Bible Brain fetch failed for ${language}/${bookId}/${chapter}:`, err.message);
    return null;
  }
}

/**
 * Load manifest metadata
 * @returns {Object} Parsed manifest with language configs
 */
export function loadManifest() {
  return manifest;
}

/**
 * Get language configuration by code
 * @param {string} langCode - Language code (en, om, am, sw, ti)
 * @returns {Object|null} Language config or null if not found
 */
export function getLanguageConfig(langCode) {
  return manifest.languages[langCode] || null;
}

/**
 * Get all available languages
 * @returns {Array} Array of language configs with their codes
 */
export function getAllLanguages() {
  return Object.entries(manifest.languages).map(([code, config]) => ({
    code,
    ...config,
  }));
}

/**
 * Internal function to load a book file from a language folder
 * @private
 * @param {string} langCode - Language code
 * @param {string} bookId - Book identifier (e.g., 'genesis', 'john')
 * @returns {Promise<Object|null>} Parsed book object or null if not found
 */
async function loadBookFile(langCode, bookId) {
  const cacheKey = `${langCode}:${bookId}`;
  
  // Check cache first
  if (bookCache.has(cacheKey)) {
    return bookCache.get(cacheKey);
  }

  try {
    const response = await fetch(`/bible-data/${langCode}/${bookId}.json`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Cache the result
    bookCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.warn(`Failed to load book ${bookId} for language ${langCode}:`, error);
    return null;
  }
}

/**
 * Get a single verse with language fallback
 * @param {Object} params
 * @param {string} params.bookId - Book identifier (e.g., 'genesis', 'john')
 * @param {number} params.chapter - Chapter number
 * @param {number} params.verse - Verse number
 * @param {string} params.selectedLanguage - User-selected language code
 * @returns {Promise<Object>} Verse result object with text, metadata, and fallback info
 * 
 * @example
 * const result = await getVerse({
 *   bookId: 'john',
 *   chapter: 3,
 *   verse: 16,
 *   selectedLanguage: 'om'
 * });
 * // Returns: {
 * //   success: true,
 * //   verse: 16,
 * //   chapter: 3,
 * //   text: "Kutaa 3:16 ...",
 * //   language: "om",
 * //   languageName: "Afaan Oromoo",
 * //   fallbackUsed: false,
 * //   fallbackLanguage: null,
 * //   bookId: "john",
 * //   bookName: "Yohannis"
 * // }
 */
export async function getVerse({
  bookId,
  chapter,
  verse,
  selectedLanguage = 'en',
}) {
  // Normalize inputs
  const normalizedBookId = bookId.toLowerCase();
  const chapterNum = Number(chapter);
  const verseNum = Number(verse);

  // Validate inputs
  if (!normalizedBookId || isNaN(chapterNum) || isNaN(verseNum)) {
    return {
      success: false,
      error: 'Invalid book, chapter, or verse',
      verse: verseNum,
      chapter: chapterNum,
    };
  }

  // Get language config
  const langConfig = getLanguageConfig(selectedLanguage);
  if (!langConfig) {
    return {
      success: false,
      error: `Language ${selectedLanguage} not supported`,
      verse: verseNum,
      chapter: chapterNum,
    };
  }

  // Try selected language first
  let book = await loadBookFile(selectedLanguage, normalizedBookId);
  let usedLanguage = selectedLanguage;
  let fallbackUsed = false;

  // If not found and has fallback, try fallback language
  if (!book && langConfig.fallbackLanguage) {
    book = await loadBookFile(langConfig.fallbackLanguage, normalizedBookId);
    usedLanguage = langConfig.fallbackLanguage;
    fallbackUsed = true;
  }

  // If still not found, return error
  if (!book) {
    return {
      success: false,
      error: `Book ${bookId} not found in ${selectedLanguage} or fallback`,
      verse: verseNum,
      chapter: chapterNum,
      bookId: normalizedBookId,
    };
  }

  // Find chapter
  const chapterObj = book.chapters?.find((c) => c.chapter === chapterNum);
  if (!chapterObj) {
    return {
      success: false,
      error: `Chapter ${chapterNum} not found`,
      verse: verseNum,
      chapter: chapterNum,
      bookId: normalizedBookId,
      bookName: book.book_name,
    };
  }

  // Find verse
  const verseObj = chapterObj.verses?.find((v) => v.verse === verseNum);
  if (!verseObj) {
    return {
      success: false,
      error: `Verse ${verseNum} not found in chapter ${chapterNum}`,
      verse: verseNum,
      chapter: chapterNum,
      bookId: normalizedBookId,
      bookName: book.book_name,
    };
  }

  // Success
  return {
    success: true,
    verse: verseNum,
    chapter: chapterNum,
    text: verseObj.text,
    language: usedLanguage,
    languageName: getLanguageConfig(usedLanguage)?.language_name || usedLanguage,
    nativeName: getLanguageConfig(usedLanguage)?.native_name,
    fallbackUsed,
    fallbackLanguage: fallbackUsed ? usedLanguage : null,
    selectedLanguage,
    bookId: normalizedBookId,
    bookName: book.book_name,
    bookAbbr: book.book_abbr,
    reference: `${book.book_name} ${chapterNum}:${verseNum}`,
  };
}

/**
 * Get a full chapter with language fallback
 * @param {Object} params
 * @param {string} params.bookId - Book identifier
 * @param {number} params.chapter - Chapter number
 * @param {string} params.selectedLanguage - User-selected language code
 * @returns {Promise<Object>} Chapter result object with all verses, metadata, and fallback info
 * 
 * @example
 * const result = await getChapter({
 *   bookId: 'john',
 *   chapter: 3,
 *   selectedLanguage: 'om'
 * });
 */
export async function getChapter({
  bookId,
  chapter,
  selectedLanguage = 'en',
}) {
  // Normalize inputs
  const normalizedBookId = bookId.toLowerCase();
  const chapterNum = Number(chapter);

  // Validate inputs
  if (!normalizedBookId || isNaN(chapterNum)) {
    return {
      success: false,
      error: 'Invalid book or chapter',
      chapter: chapterNum,
    };
  }

  // Get language config
  const langConfig = getLanguageConfig(selectedLanguage);
  if (!langConfig) {
    return {
      success: false,
      error: `Language ${selectedLanguage} not supported`,
      chapter: chapterNum,
    };
  }

  // Try selected language first
  let book = await loadBookFile(selectedLanguage, normalizedBookId);
  let usedLanguage = selectedLanguage;
  let fallbackUsed = false;

  // If not found and has fallback, try fallback language
  if (!book && langConfig.fallbackLanguage) {
    book = await loadBookFile(langConfig.fallbackLanguage, normalizedBookId);
    usedLanguage = langConfig.fallbackLanguage;
    fallbackUsed = true;
  }

  // If still not found, try Bible Brain API as fallback
  if (!book) {
    try {
      const bbResult = await fetchFromBibleBrain(selectedLanguage, normalizedBookId, chapterNum);
      if (bbResult?.verses && bbResult.verses.length > 0) {
        return {
          success: true,
          chapter: chapterNum,
          verses: bbResult.verses,
          language: selectedLanguage,
          languageName: getLanguageConfig(selectedLanguage)?.language_name || selectedLanguage,
          fallbackUsed: true,
          fallbackLanguage: 'bibleBrain',
          selectedLanguage,
          bookId: normalizedBookId,
          bookName: bbResult.bookCode || normalizedBookId,
          source: 'bibleBrain',
        };
      }
    } catch (err) {
      console.warn(`Bible Brain fallback failed for ${normalizedBookId}/${chapterNum}:`, err);
    }

    return {
      success: false,
      error: `Book ${bookId} not found in ${selectedLanguage} or fallback`,
      chapter: chapterNum,
      bookId: normalizedBookId,
    };
  }

  // Find chapter
  const chapterObj = book.chapters?.find((c) => c.chapter === chapterNum);
  if (!chapterObj) {
    return {
      success: false,
      error: `Chapter ${chapterNum} not found`,
      chapter: chapterNum,
      bookId: normalizedBookId,
      bookName: book.book_name,
    };
  }

  // Success
  return {
    success: true,
    chapter: chapterNum,
    verses: chapterObj.verses || [],
    language: usedLanguage,
    languageName: getLanguageConfig(usedLanguage)?.language_name || usedLanguage,
    nativeName: getLanguageConfig(usedLanguage)?.native_name,
    fallbackUsed,
    fallbackLanguage: fallbackUsed ? usedLanguage : null,
    selectedLanguage,
    bookId: normalizedBookId,
    bookName: book.book_name,
    bookAbbr: book.book_abbr,
    totalChapters: book.chapters?.length || 0,
  };
}

/**
 * Get available books for a language
 * @param {string} langCode - Language code
 * @returns {Promise<Array>} Array of book identifiers available in that language
 */
export async function getAvailableBooks(langCode) {
  const cacheKey = `books:${langCode}`;
  
  if (languageCache.has(cacheKey)) {
    return languageCache.get(cacheKey);
  }

  const available = [];
  
  for (const bookId of manifest.bookOrder) {
    const book = await loadBookFile(langCode, bookId);
    if (book) {
      available.push({
        id: bookId,
        name: book.book_name,
        abbr: book.book_abbr,
        chapters: book.chapters?.length || 0,
      });
    }
  }

  languageCache.set(cacheKey, available);
  return available;
}

/**
 * Get language-aware display name for a book
 * @param {string} bookId - Book identifier (e.g., 'genesis', 'john')
 * @param {string} langCode - Language code
 * @returns {Promise<Object>} Object with name, abbreviation, and language info
 */
export async function getLocalizedBookName(bookId, langCode) {
  const normalizedBookId = bookId.toLowerCase();
  const book = await loadBookFile(langCode, normalizedBookId);

  if (!book) {
    // Fallback to English
    const fallbackLangConfig = getLanguageConfig(langCode);
    if (fallbackLangConfig?.fallbackLanguage) {
      return getLocalizedBookName(bookId, fallbackLangConfig.fallbackLanguage);
    }
    return {
      id: normalizedBookId,
      name: normalizedBookId,
      abbr: normalizedBookId.substring(0, 3).toUpperCase(),
      language: langCode,
    };
  }

  return {
    id: normalizedBookId,
    name: book.book_name,
    abbr: book.book_abbr,
    language: langCode,
  };
}

/**
 * Clear caches (useful for testing or when dataset files change)
 */
export function clearCaches() {
  bookCache.clear();
  languageCache.clear();
}

/**
 * Get dataset health/status
 * Provides information about what's loaded and what's missing
 * @returns {Promise<Object>} Status object with details about loaded languages and books
 */
export async function getDatasetStatus() {
  const status = {
    manifest: manifest,
    languages: {},
  };

  for (const [langCode, langConfig] of Object.entries(manifest.languages)) {
    const books = await getAvailableBooks(langCode);
    status.languages[langCode] = {
      config: langConfig,
      booksLoaded: books.length,
      books,
    };
  }

  return status;
}