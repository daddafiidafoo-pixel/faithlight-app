/**
 * bibleReaderServiceV2.js
 * Cache-first chapter loading with background refresh and adjacent prefetch.
 *
 * Flow:
 *  1. Check cache → return instantly if found
 *  2. Trigger background refresh so cache stays fresh
 *  3. On cache miss → fetch from source, cache result, return
 *  4. After any successful load → prefetch adjacent chapters silently
 */

import {
  buildCacheKey,
  getCachedChapter,
  setCachedChapter,
  trimCacheIfNeeded,
} from './bibleCacheService';

import {
  getNextChapterRef,
  getPreviousChapterRef,
} from './bibleNavigationService';

import { base44 } from '@/api/base44Client';

// ─── Core API ────────────────────────────────────────────────────────────────

/**
 * Load a chapter using cache-first logic.
 *
 * @param {string}  bookId
 * @param {number}  chapterNumber
 * @param {string}  language        "en" | "om"
 * @param {Array}   books           full ordered book list (for prefetch nav)
 * @returns {Promise<ChapterData>}
 */
export async function getChapter({ bookId, chapterNumber, language, books = [] }) {
  const cacheKey = buildCacheKey(bookId, chapterNumber, language);

  // 1 — Cache hit → return immediately, refresh silently
  const cached = getCachedChapter(cacheKey);
  if (cached) {
    _refreshChapterInBackground({ bookId, chapterNumber, language, cacheKey });
    _prefetchAdjacentChapters({ bookId, chapterNumber, language, books });
    return cached;
  }

  // 2 — Cache miss → fetch, store, return
  const fresh = await fetchChapterFromSource({ bookId, chapterNumber, language });
  setCachedChapter(cacheKey, fresh);
  trimCacheIfNeeded();

  _prefetchAdjacentChapters({ bookId, chapterNumber, language, books });
  return fresh;
}

/**
 * Fetch chapter data from the Base44 database.
 * Returns a structured ChapterData object.
 *
 * @returns {Promise<ChapterData>}
 */
export async function fetchChapterFromSource({ bookId, chapterNumber, language }) {
  const textField = language === 'om' ? 'text_om' : 'text_en';

  // Fetch verses for this chapter
  const verses = await base44.entities.BibleVerse.filter(
    { book_id: bookId, chapter_number: chapterNumber },
    'verse_number',
    200
  );

  if (!verses || verses.length === 0) {
    throw new Error(`No verses found for ${bookId} ${chapterNumber} (${language})`);
  }

  // Fetch chapter metadata (audio URL etc.)
  const chapterId = `${bookId}-${chapterNumber}`;
  let chapterMeta = null;
  try {
    const metas = await base44.entities.BibleChapter.filter({ id: chapterId }, 'chapter_number', 1);
    chapterMeta = metas?.[0] || null;
  } catch {
    // audio metadata is optional — don't fail the load
  }

  return {
    bookId,
    chapterNumber,
    language,
    reference: `${bookId} ${chapterNumber}`,
    verses: verses.map(v => ({
      verse: v.verse_number,
      text:  v[textField] || v.text_en || '',
      id:    v.id,
    })),
    audioUrl:         chapterMeta?.audio_url_en  || null,
    audioUrlOm:       chapterMeta?.audio_url_om  || null,
    durationSeconds:  chapterMeta?.duration_seconds || null,
    versesCount:      verses.length,
  };
}

// ─── Internal helpers (not exported — used internally) ───────────────────────

/**
 * Silently re-fetch a chapter in the background to keep cache fresh.
 * Never throws — never blocks the UI.
 */
async function _refreshChapterInBackground({ bookId, chapterNumber, language, cacheKey }) {
  try {
    const fresh = await fetchChapterFromSource({ bookId, chapterNumber, language });
    setCachedChapter(cacheKey, fresh);
  } catch {
    // silent — cached version is still good
  }
}

/**
 * Prefetch previous and next chapters without blocking anything.
 */
async function _prefetchAdjacentChapters({ bookId, chapterNumber, language, books }) {
  if (!books.length) return;

  const prevRef = getPreviousChapterRef({ bookId, chapterNumber, books });
  const nextRef = getNextChapterRef({ bookId, chapterNumber, books });

  const tasks = [];
  if (prevRef) tasks.push(_prefetchSingleChapter({ ...prevRef, language }));
  if (nextRef) tasks.push(_prefetchSingleChapter({ ...nextRef, language }));

  // Fire-and-forget — don't await
  Promise.allSettled(tasks);
}

/**
 * Fetch a single chapter only if it isn't already cached.
 */
async function _prefetchSingleChapter({ bookId, chapterNumber, language }) {
  const cacheKey = buildCacheKey(bookId, chapterNumber, language);
  if (getCachedChapter(cacheKey)) return; // already warm

  try {
    const data = await fetchChapterFromSource({ bookId, chapterNumber, language });
    setCachedChapter(cacheKey, data);
  } catch {
    // prefetch failures are silent
  }
}

// ─── Offline helpers (UI-friendly) ───────────────────────────────────────────

/**
 * Try to load a chapter from cache only (no network).
 * Returns the chapter or null — never throws.
 */
export function getChapterOffline({ bookId, chapterNumber, language }) {
  const cacheKey = buildCacheKey(bookId, chapterNumber, language);
  return getCachedChapter(cacheKey);
}

/**
 * Friendly offline message for the reader UI.
 */
export function getOfflineMessage(language) {
  return language === 'om'
    ? 'Boqonnaan kun ammaaf offline keessatti hin argamu.'
    : 'This chapter is not available offline yet.';
}