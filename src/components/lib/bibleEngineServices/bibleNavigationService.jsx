/**
 * bibleNavigationService.js
 * Pure functions for calculating next/previous chapter references.
 * No side-effects, no async — safe to call anywhere.
 */

/**
 * Return the next chapter reference, crossing book boundaries.
 *
 * @param {string} bookId
 * @param {number} chapterNumber
 * @param {Array}  books  — ordered array with { id, chapters_count }
 * @returns {{ bookId, chapterNumber } | null}
 */
export function getNextChapterRef({ bookId, chapterNumber, books }) {
  const currentBook = books.find(b => b.id === bookId);
  if (!currentBook) return null;

  // Still within the same book
  if (chapterNumber < currentBook.chapters_count) {
    return { bookId, chapterNumber: chapterNumber + 1 };
  }

  // Cross to the next book, chapter 1
  const idx = books.findIndex(b => b.id === bookId);
  const nextBook = books[idx + 1];
  if (!nextBook) return null; // end of Bible

  return { bookId: nextBook.id, chapterNumber: 1 };
}

/**
 * Return the previous chapter reference, crossing book boundaries.
 *
 * @param {string} bookId
 * @param {number} chapterNumber
 * @param {Array}  books  — ordered array with { id, chapters_count }
 * @returns {{ bookId, chapterNumber } | null}
 */
export function getPreviousChapterRef({ bookId, chapterNumber, books }) {
  const currentBook = books.find(b => b.id === bookId);
  if (!currentBook) return null;

  // Still within the same book
  if (chapterNumber > 1) {
    return { bookId, chapterNumber: chapterNumber - 1 };
  }

  // Cross to the last chapter of the previous book
  const idx = books.findIndex(b => b.id === bookId);
  const prevBook = books[idx - 1];
  if (!prevBook) return null; // start of Bible

  return { bookId: prevBook.id, chapterNumber: prevBook.chapters_count };
}

/**
 * Build a human-readable reference string.
 * e.g. "JHN-3" → "John 3" (when bookMap is provided)
 */
export function buildReference({ bookId, chapterNumber, bookMap = {} }) {
  const name = bookMap[bookId] || bookId;
  return `${name} ${chapterNumber}`;
}

/**
 * Check if two chapter refs point to the same chapter.
 */
export function isSameChapter(refA, refB) {
  if (!refA || !refB) return false;
  return refA.bookId === refB.bookId && refA.chapterNumber === refB.chapterNumber;
}