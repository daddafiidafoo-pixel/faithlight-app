// Core Bible reading engine — no UI, just state & logic
// Handles: book/chapter selection, verse fetching, offline fallback, reading history

import { getChapter } from '../lib/BibleCatalogProvider';

// Helper: get chapter data from API or offline storage
export const fetchChapterVersesWithFallback = async (translation, book, chapter) => {
  try {
    // Try API first
    const result = await getChapter(translation, book, chapter);
    if (result?.verses?.length > 0) {
      return { verses: result.verses, source: 'api' };
    }

    // Fallback to offline storage
    const { getChapterOffline } = await import('../lib/offlineBibleManager');
    const offlineChapter = await getChapterOffline(translation, book, chapter);
    if (offlineChapter?.verses?.length > 0) {
      return { verses: offlineChapter.verses, source: 'offline' };
    }

    return { verses: [], source: null };
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return { verses: [], source: null };
  }
};

// Helper: auto-cache verses to offline storage (fire & forget)
export const autoCacheChapterToOffline = async (translation, book, chapter, verses) => {
  try {
    const { autoCacheChapter } = await import('./CacheAsYouReadManager');
    await autoCacheChapter(translation, book, chapter, verses);
  } catch (err) {
    // Silently fail — caching is optional
  }
};

// Helper: validate chapter number based on book
export const validateChapter = (book, chapterNum, bibleBooks) => {
  if (!book || !chapterNum) return null;
  const bookData = bibleBooks.find(b => b.name === book);
  const maxChapters = bookData?.chapters_count || 1;
  const validNum = Math.min(Math.max(parseInt(chapterNum), 1), maxChapters);
  return validNum;
};

// Helper: navigate to next/previous chapter
export const getAdjacentChapter = (currentBook, currentChapter, direction, bibleBooks) => {
  const currentBookIdx = bibleBooks.findIndex(b => b.name === currentBook);
  if (currentBookIdx === -1) return null;

  const bookData = bibleBooks[currentBookIdx];
  const maxChapters = bookData.chapters_count || 1;

  if (direction === 'next') {
    if (currentChapter < maxChapters) {
      return { book: currentBook, chapter: currentChapter + 1 };
    }
    // Move to next book
    if (currentBookIdx < bibleBooks.length - 1) {
      return { book: bibleBooks[currentBookIdx + 1].name, chapter: 1 };
    }
  } else if (direction === 'prev') {
    if (currentChapter > 1) {
      return { book: currentBook, chapter: currentChapter - 1 };
    }
    // Move to previous book
    if (currentBookIdx > 0) {
      const prevBook = bibleBooks[currentBookIdx - 1];
      return { book: prevBook.name, chapter: prevBook.chapters_count || 1 };
    }
  }

  return null;
};