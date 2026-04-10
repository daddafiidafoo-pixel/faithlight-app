/**
 * Bible Catalog Service
 * Single source of truth for:
 * - Book codes (GEN, JHN, ROM, etc.)
 * - English & Afaan Oromoo names
 * - Chapter counts
 */

import { BOOK_MAPPING, API_CODE_TO_BOOK, BOOK_ID_TO_API_CODE, getBookName } from '@/components/bibleBookMapping';

/**
 * Get full catalog with localized names
 * @param {string} lang - 'en' or 'om'
 * @returns {Array}
 */
export const getBibleCatalog = (lang = 'en') => {
  return BOOK_MAPPING.map(book => ({
    api_code: book.api_code,
    name: getBookName(book.api_code, lang),
    chapters: book.chapters,
  }));
};

/**
 * Get book by api_code
 * @param {string} apiCode - e.g. "JHN"
 * @returns {Object|null}
 */
export const getBook = (apiCode) => {
  const normalized = apiCode?.toUpperCase();
  return API_CODE_TO_BOOK[normalized] || null;
};

/**
 * Get api_code from book_id
 * @param {number} bookId - 1-66
 * @returns {string|null}
 */
export const getApiCodeFromId = (bookId) => BOOK_ID_TO_API_CODE[bookId] || null;

/**
 * Get chapter count for a book
 * @param {string} apiCode
 * @returns {number}
 */
export const getChapterCount = (apiCode) => {
  const book = getBook(apiCode);
  return book ? book.chapters : 0;
};

/**
 * Get localized book name
 * @param {string} apiCode
 * @param {string} lang
 * @returns {string}
 */
export const getLocalizedBookName = (apiCode, lang = 'en') => {
  return getBookName(apiCode, lang);
};

/**
 * Check if book/chapter combo is valid
 * @param {string} apiCode
 * @param {number} chapter
 * @returns {boolean}
 */
export const isValidChapter = (apiCode, chapter) => {
  const count = getChapterCount(apiCode);
  return chapter >= 1 && chapter <= count && Number.isInteger(chapter);
};

/**
 * Get next chapter in canonical order
 * Returns { api_code, chapter } or null if at end
 */
export const getNextChapter = (apiCode, chapter) => {
  const book = getBook(apiCode);
  if (!book) return null;

  if (chapter < book.chapters) {
    return { api_code: apiCode, chapter: chapter + 1 };
  }

  const index = BOOK_MAPPING.findIndex(b => b.api_code === apiCode);
  const nextBook = BOOK_MAPPING[index + 1];
  
  return nextBook ? { api_code: nextBook.api_code, chapter: 1 } : null;
};

/**
 * Get previous chapter in canonical order
 * Returns { api_code, chapter } or null if at start
 */
export const getPreviousChapter = (apiCode, chapter) => {
  if (chapter > 1) {
    return { api_code: apiCode, chapter: chapter - 1 };
  }

  const index = BOOK_MAPPING.findIndex(b => b.api_code === apiCode);
  if (index === 0) return null;

  const prevBook = BOOK_MAPPING[index - 1];
  return { api_code: prevBook.api_code, chapter: prevBook.chapters };
};

export default {
  getBibleCatalog,
  getBook,
  getApiCodeFromId,
  getChapterCount,
  getLocalizedBookName,
  isValidChapter,
  getNextChapter,
  getPreviousChapter,
};