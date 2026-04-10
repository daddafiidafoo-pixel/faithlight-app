/**
 * Shared Bible verse fetcher with chapter-level caching.
 *
 * ✅ Allowed server-side filters on BibleVerse:
 *   { translation_id, book }
 *   { translation_id, book, chapter }   ← preferred (most precise safe filter)
 *
 * ❌ Never:
 *   { translation_id, book, chapter, verse }   — use getVerse() instead
 *
 * Usage:
 *   import { getVerse, getChapter, makeRefKey, saveVerse, unsaveVerse } from '@/components/bibleVerseCache';
 */

import { base44 } from '@/api/base44Client';

// In-memory chapter cache: "translationId|book|chapter" → verse[]
const chapterCache = new Map();

// ─── Key helpers ─────────────────────────────────────────────────────────────

/** "John|3|16" — stable, collision-free ref key */
export function makeRefKey(book, chapter, verse) {
  return `${book}|${chapter}|${verse}`;
}

/** Legacy alias so old imports don't break */
export const makeVerseRefKey = makeRefKey;

// ─── Fetching ────────────────────────────────────────────────────────────────

/**
 * Fetch all verses in a chapter (cached).
 * Server filter: translation_id + book + chapter (3 fields max — safe).
 */
export async function getChapter(translationId, book, chapter) {
  const key = `${translationId}|${book}|${chapter}`;
  if (!chapterCache.has(key)) {
    let rows = [];
    try {
      rows = await base44.entities.BibleVerse.filter(
        { version: translationId, book_code: book, chapter_number: chapter },
        'verse_number',
        200
      ) || [];
    } catch {
      rows = [];
    }
    const normalized = rows.map(v => ({ ...v, verse: v.verse_number ?? v.verse, text: v.verse_text ?? v.text }));
    normalized.sort((a, b) => (a.verse ?? 0) - (b.verse ?? 0));
    chapterCache.set(key, normalized);
  }
  return chapterCache.get(key) || [];
}

/**
 * Fetch a single verse (chapter cached, verse matched client-side).
 */
export async function getVerse(translationId, book, chapter, verse) {
  const rows = await getChapter(translationId, book, chapter);
  return rows.find(v => v.verse === verse) || rows[0] || null;
}

/** Invalidate cache for a specific chapter (e.g., after translation switch). */
export function clearVerseCache(translationId, book, chapter) {
  if (translationId && book && chapter != null) {
    chapterCache.delete(`${translationId}|${book}|${chapter}`);
  } else {
    chapterCache.clear();
  }
}

// ─── SavedVerse helpers ───────────────────────────────────────────────────────

/**
 * Check if a verse is saved.
 * Server filter: user_id + book (2 fields — safe).
 * ref_key matched client-side.
 */
export async function isVerseSaved(userId, book, chapter, verse) {
  const refKey = makeRefKey(book, chapter, verse);
  const saved = await base44.entities.SavedVerse.filter(
    { user_id: userId, book },
    '-created_date',
    200
  ).catch(() => []);
  return { isSaved: saved.some(s => s.ref_key === refKey || s.verse_ref_key === refKey), saved };
}

/**
 * Save a verse with optimistic update.
 * Returns optimistic data immediately, then syncs with server.
 */
export async function saveVerse({ userId, translationId, book, chapter, verse, text, reference }) {
  const refKey = makeRefKey(book, chapter, verse);

  // Optimistic data (instant feedback)
  const optimisticData = {
    id: `opt_${Date.now()}`,
    user_id: userId,
    translation_id: translationId || null,
    book,
    chapter,
    verse,
    ref_key: refKey,
    verse_ref_key: refKey,
    verse_text: text || '',
    reference: reference || `${book} ${chapter}:${verse}`,
    day_of_week: new Date().getDay() + 1,
    created_date: new Date().toISOString()
  };

  // Fire and forget server sync
  base44.entities.SavedVerse.filter(
    { user_id: userId, book },
    '-created_date',
    200
  )
    .then(existing => {
      const duplicate = existing.find(s => s.ref_key === refKey || s.verse_ref_key === refKey);
      if (!duplicate) {
        return base44.entities.SavedVerse.create(optimisticData);
      }
      return duplicate;
    })
    .catch(err => console.error('Error saving verse:', err));

  return optimisticData;
}

/**
 * Unsave a verse with optimistic update.
 * Removes verse immediately, syncs deletion with server.
 */
export async function unsaveVerse(userId, book, chapter, verse) {
  const refKey = makeRefKey(book, chapter, verse);

  // Fire and forget server delete
  base44.entities.SavedVerse.filter(
    { user_id: userId, book },
    '-created_date',
    200
  )
    .then(existing => {
      const matches = existing.filter(s => s.ref_key === refKey || s.verse_ref_key === refKey);
      return Promise.all(matches.map(m => base44.entities.SavedVerse.delete(m.id).catch(() => {})));
    })
    .catch(err => console.error('Error unsaving verse:', err));

  return true; // Optimistic confirmation
}