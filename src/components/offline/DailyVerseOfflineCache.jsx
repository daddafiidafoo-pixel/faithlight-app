/**
 * DailyVerseOfflineCache
 * Lightweight offline cache for daily verses and reading plan days.
 * Uses localStorage (IndexedDB fallback not needed for this data size).
 * Called from the app on successful fetch to pre-cache content.
 */

const CACHE_KEY_VERSE = 'fl_offline_daily_verse';
const CACHE_KEY_PLAN = 'fl_offline_reading_plan';
const CACHE_KEY_CHAPTERS = 'fl_offline_chapters';
const MAX_CHAPTERS = 20;

// ── Daily Verse ──────────────────────────────────────────────────────────────

export function cacheDailyVerse(verseData) {
  try {
    localStorage.setItem(CACHE_KEY_VERSE, JSON.stringify({
      ...verseData,
      cachedAt: Date.now(),
    }));
  } catch { /* storage full */ }
}

export function getCachedDailyVerse() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_VERSE);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Valid for 24 hours
    if (Date.now() - data.cachedAt > 24 * 60 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Reading Plan ─────────────────────────────────────────────────────────────

export function cacheReadingPlan(plan) {
  try {
    localStorage.setItem(CACHE_KEY_PLAN, JSON.stringify({
      plan,
      cachedAt: Date.now(),
    }));
  } catch { /* storage full */ }
}

export function getCachedReadingPlan() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PLAN);
    if (!raw) return null;
    const { plan, cachedAt } = JSON.parse(raw);
    // Valid for 7 days
    if (Date.now() - cachedAt > 7 * 24 * 60 * 60 * 1000) return null;
    return plan;
  } catch {
    return null;
  }
}

// ── Bible Chapters ───────────────────────────────────────────────────────────

export function cacheBibleChapter(book, chapter, translation, verses) {
  try {
    const raw = localStorage.getItem(CACHE_KEY_CHAPTERS);
    const cache = raw ? JSON.parse(raw) : {};
    const key = `${book}-${chapter}-${translation}`;
    cache[key] = { verses, cachedAt: Date.now() };

    // Evict oldest if over limit
    const keys = Object.keys(cache);
    if (keys.length > MAX_CHAPTERS) {
      const oldest = keys.sort((a, b) => cache[a].cachedAt - cache[b].cachedAt)[0];
      delete cache[oldest];
    }

    localStorage.setItem(CACHE_KEY_CHAPTERS, JSON.stringify(cache));
  } catch { /* storage full */ }
}

export function getCachedBibleChapter(book, chapter, translation) {
  try {
    const raw = localStorage.getItem(CACHE_KEY_CHAPTERS);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const key = `${book}-${chapter}-${translation}`;
    const entry = cache[key];
    if (!entry) return null;
    // Valid for 30 days (Bible text never changes)
    if (Date.now() - entry.cachedAt > 30 * 24 * 60 * 60 * 1000) return null;
    return entry.verses;
  } catch {
    return null;
  }
}

export function getOfflineChapterList() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_CHAPTERS);
    if (!raw) return [];
    const cache = JSON.parse(raw);
    return Object.keys(cache).map(k => {
      const [book, chapter, translation] = k.split('-');
      return { book, chapter, translation, cachedAt: cache[k].cachedAt };
    });
  } catch {
    return [];
  }
}

export function clearOfflineCache() {
  localStorage.removeItem(CACHE_KEY_VERSE);
  localStorage.removeItem(CACHE_KEY_PLAN);
  localStorage.removeItem(CACHE_KEY_CHAPTERS);
}

export function getOfflineCacheSize() {
  let total = 0;
  [CACHE_KEY_VERSE, CACHE_KEY_PLAN, CACHE_KEY_CHAPTERS].forEach(k => {
    total += (localStorage.getItem(k) || '').length * 2; // approx bytes
  });
  return total;
}