/**
 * Bible Service — centralized API layer for all Bible data operations.
 * All Bible entity/API calls go through here.
 * Cache-enabled for stable content (books, chapters, verse of day).
 */
import { base44 } from '@/api/base44Client';
import { getChapter } from '@/components/lib/BibleCatalogProvider';
import { serviceCache, TTL } from '@/components/services/cache/serviceCache';

// ── Verses ──────────────────────────────────────────────────

export async function fetchVerses(translation, book, chapter) {
  if (!book || !chapter) return [];

  const result = await getChapter(translation, book, chapter);
  if (result?.verses?.length) {
    // Auto-cache (fire & forget)
    import('@/components/bible/CacheAsYouReadManager')
      .then(m => m.autoCacheChapter(translation, book, chapter, result.verses))
      .catch(() => {});
    return result.verses;
  }

  // Offline fallback
  const { getChapterOffline } = await import('@/components/lib/offlineBibleManager');
  const offline = await getChapterOffline(translation, book, chapter);
  return offline?.verses?.length ? offline.verses : [];
}

// ── Bible Books ─────────────────────────────────────────────

export async function fetchBibleBooks(language = 'en', limit = 70) {
  const cacheKey = `bible_books:${language}`;
  const cached = serviceCache.get(cacheKey);
  if (cached) return cached;

  const data = await base44.entities.BibleBook.filter({ language }, 'sort_order', limit).catch(() => []);
  serviceCache.set(cacheKey, data || [], TTL.BIBLE_BOOKS);
  return data || [];
}

// ── Highlights ──────────────────────────────────────────────

export async function fetchHighlights(userId, book, chapter) {
  if (!userId || !book || !chapter) return [];
  const all = await base44.entities.VerseHighlight.filter(
    { user_id: userId, book }, '-created_date', 500
  ).catch(() => []);
  return all.filter(h => h.chapter === chapter);
}

export async function saveHighlight(userId, data) {
  const existing = await base44.entities.VerseHighlight.filter({
    user_id: userId, book: data.book, chapter: data.chapter, verse: data.verse
  }, null, 1).catch(() => []);

  if (existing?.[0]) {
    return base44.entities.VerseHighlight.update(existing[0].id, { color: data.color });
  }
  return base44.entities.VerseHighlight.create({ user_id: userId, ...data });
}

export async function deleteHighlight(userId, book, chapter, verse) {
  const existing = await base44.entities.VerseHighlight.filter(
    { user_id: userId, book, chapter, verse }, null, 1
  ).catch(() => []);
  if (existing?.[0]) return base44.entities.VerseHighlight.delete(existing[0].id);
}

// ── Notes ───────────────────────────────────────────────────

export async function fetchNotes(userId, book, chapter) {
  if (!userId || !book || !chapter) return [];
  const all = await base44.entities.VerseNote.filter(
    { user_id: userId, book }, '-created_date', 500
  ).catch(() => []);
  return all.filter(n => n.chapter === chapter);
}

export async function saveNote(userId, data) {
  const existing = await base44.entities.VerseNote.filter({
    user_id: userId, book: data.book, chapter: data.chapter, verse: data.verse
  }, null, 1).catch(() => []);

  if (existing?.[0]) {
    return base44.entities.VerseNote.update(existing[0].id, {
      note_text: data.note_text, is_public: data.is_public
    });
  }
  return base44.entities.VerseNote.create({ user_id: userId, ...data });
}

export async function deleteNote(userId, book, chapter, verse) {
  const existing = await base44.entities.VerseNote.filter(
    { user_id: userId, book, chapter, verse }, null, 1
  ).catch(() => []);
  if (existing?.[0]) return base44.entities.VerseNote.delete(existing[0].id);
}

// ── Bookmarks / Saved Verses ────────────────────────────────

export async function fetchSavedVerses(userId, book, chapter) {
  if (!userId || !book || !chapter) return [];
  const all = await base44.entities.SavedVerse.filter(
    { user_id: userId, book }, '-created_date', 200
  ).catch(() => []);
  return all.filter(s => s.chapter === chapter);
}

// ── Reading Progress ────────────────────────────────────────

export async function saveReadingProgress(userId, book, chapter, translation) {
  const existing = await base44.entities.ReadingProgress.filter(
    { user_id: userId, book, chapter }, 'chapter', 1
  ).catch(() => []);

  if (!existing?.length) {
    return base44.entities.ReadingProgress.create({
      user_id: userId, book, chapter, translation,
      completed_date: new Date().toISOString().split('T')[0]
    });
  }
}

// ── Verse of Day ─────────────────────────────────────────────

export async function fetchVerseOfDay(dateKey, language = 'en') {
  const cacheKey = `verse_of_day:${dateKey}:${language}`;
  const cached = serviceCache.get(cacheKey);
  if (cached) return cached;

  const results = await base44.entities.DailyVerse.filter(
    { dateKey, language }, null, 1
  ).catch(() => []);
  const entry = results?.[0] || null;
  if (entry) serviceCache.set(cacheKey, entry, TTL.VERSE_OF_DAY);
  return entry;
}

// ── Reading Goals ───────────────────────────────────────────

export async function fetchActiveReadingGoal(userId) {
  if (!userId) return null;
  const goals = await base44.entities.ReadingGoal.filter(
    { user_id: userId, is_active: true }, '-created_date', 1
  ).catch(() => []);
  return goals?.[0] || null;
}

// ── Offline Index ───────────────────────────────────────────

export async function fetchOfflineIndex(userId, translation, book, chapter) {
  if (!userId || !book || !chapter) return null;
  const results = await base44.entities.OfflineIndex.filter(
    { user_id: userId, translation, book, chapter }, null, 1
  ).catch(() => []);
  return results?.[0] || null;
}