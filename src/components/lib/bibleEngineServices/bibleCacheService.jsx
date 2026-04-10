/**
 * bibleCacheService.js
 * Handles all local caching for Bible chapters.
 * Cache key format: BOOKID-CHAPTER-LANGUAGE  (e.g. JHN-3-en)
 */

const CACHE_PREFIX = 'fl_ch_';          // fl = FaithLight, ch = chapter
const MAX_CACHED_CHAPTERS = 60;         // keep memory reasonable
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── helpers ─────────────────────────────────────────────────────────────────

function storageKey(cacheKey) {
  return `${CACHE_PREFIX}${cacheKey}`;
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // Storage full — evict oldest and retry once
    evictOldestChapters(10);
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ─── public API ──────────────────────────────────────────────────────────────

/**
 * Build the canonical cache key.
 * @param {string} bookId       e.g. "JHN"
 * @param {number} chapterNumber
 * @param {string} language     "en" | "om"
 */
export function buildCacheKey(bookId, chapterNumber, language) {
  return `${bookId}-${chapterNumber}-${language}`;
}

/**
 * Return cached chapter data, or null if missing / expired.
 */
export function getCachedChapter(cacheKey) {
  const raw = safeGet(storageKey(cacheKey));
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);

    // Expire stale entries
    if (data.cachedAt) {
      const age = Date.now() - new Date(data.cachedAt).getTime();
      if (age > CACHE_TTL_MS) {
        safeRemove(storageKey(cacheKey));
        return null;
      }
    }

    return data;
  } catch {
    safeRemove(storageKey(cacheKey));
    return null;
  }
}

/**
 * Save chapter data locally with a timestamp.
 */
export function setCachedChapter(cacheKey, chapterData) {
  const payload = {
    ...chapterData,
    cachedAt: new Date().toISOString(),
  };
  safeSet(storageKey(cacheKey), JSON.stringify(payload));
}

/**
 * Check whether a chapter is already cached (without returning data).
 */
export function isChapterCached(bookId, chapterNumber, language) {
  const key = buildCacheKey(bookId, chapterNumber, language);
  return getCachedChapter(key) !== null;
}

/**
 * Remove all cached chapters for a given book.
 */
export function clearBookCache(bookId) {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(`${CACHE_PREFIX}${bookId}-`))
      .forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/**
 * Remove all FaithLight chapter cache entries.
 */
export function clearAllChapterCache() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/**
 * Evict the N oldest cached chapters (by cachedAt timestamp).
 */
export function evictOldestChapters(n = 10) {
  try {
    const entries = Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX))
      .map(k => {
        try {
          const d = JSON.parse(localStorage.getItem(k));
          return { key: k, cachedAt: d?.cachedAt || '1970-01-01' };
        } catch {
          return { key: k, cachedAt: '1970-01-01' };
        }
      })
      .sort((a, b) => new Date(a.cachedAt) - new Date(b.cachedAt));

    entries.slice(0, n).forEach(e => localStorage.removeItem(e.key));
  } catch {
    // ignore
  }
}

/**
 * Trim cache to MAX_CACHED_CHAPTERS if needed.
 */
export function trimCacheIfNeeded() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    if (keys.length > MAX_CACHED_CHAPTERS) {
      evictOldestChapters(keys.length - MAX_CACHED_CHAPTERS + 5);
    }
  } catch {
    // ignore
  }
}

/**
 * Return a summary of current cache usage.
 */
export function getCacheStats() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    let totalBytes = 0;
    keys.forEach(k => {
      totalBytes += (localStorage.getItem(k) || '').length * 2; // rough UTF-16 estimate
    });
    return {
      count: keys.length,
      estimatedKB: Math.round(totalBytes / 1024),
    };
  } catch {
    return { count: 0, estimatedKB: 0 };
  }
}