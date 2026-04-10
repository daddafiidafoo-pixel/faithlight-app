import * as bibleBrainProvider  from './providers/bibleBrainProvider';
import { normalizeVerse, normalizeChapter, normalizeSearchResults } from './utils/normalizeScripture';

/**
 * BibleService
 * Central scripture access layer for the entire app.
 * All UI screens call this service, never the provider directly.
 *
 * This design allows us to:
 * - Swap providers (BibleBrain → API.Bible, ESV, etc) in one place
 * - Manage caching centrally
 * - Handle translation support consistently
 * - Normalize all scripture responses
 */

const DEFAULT_TRANSLATION = 'ENGKJV';
const memoryCache = new Map();

/**
 * Get value from cache if not expired
 */
function getFromCache(key) {
  const cached = memoryCache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() > cached.expiresAt;
  if (isExpired) {
    memoryCache.delete(key);
    return null;
  }

  return cached.value;
}

/**
 * Store value in cache with TTL
 */
function setCache(key, value, ttlMs) {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * BibleService public API
 */
export const bibleService = {
  /**
   * Get verse of the day
   * TTL: 24 hours (expires at midnight)
   */
  async getVerseOfDay(translation = DEFAULT_TRANSLATION) {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `verse_of_day:${translation}:${today}`;

    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const raw = await bibleBrainProvider.getVerseOfDay(translation);
      const normalized = normalizeVerse(raw, translation);

      if (normalized) {
        setCache(cacheKey, normalized, 24 * 60 * 60 * 1000); // 24 hours
      }

      return normalized;
    } catch (error) {
      console.error('Error fetching verse of day:', error);
      return null;
    }
  },

  /**
   * Get verse by reference (e.g., "John 3:16")
   * TTL: 7 days
   */
  async getVerseByReference(reference, translation = DEFAULT_TRANSLATION) {
    const cacheKey = `verse_ref:${translation}:${reference}`;

    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const raw = await bibleBrainProvider.getVerseByReference(reference, translation);
      const normalized = normalizeVerse(raw, translation);

      if (normalized) {
        setCache(cacheKey, normalized, 7 * 24 * 60 * 60 * 1000); // 7 days
      }

      return normalized;
    } catch (error) {
      console.error(`Error fetching verse ${reference}:`, error);
      return null;
    }
  },

  /**
   * Get entire chapter
   * TTL: 7 days
   */
  async getChapter(book, chapter, translation = DEFAULT_TRANSLATION) {
    const cacheKey = `chapter:${translation}:${book}:${chapter}`;

    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const raw = await bibleBrainProvider.getChapter(book, chapter, translation);
      const normalized = normalizeChapter(raw, book, chapter, translation);

      if (normalized) {
        setCache(cacheKey, normalized, 7 * 24 * 60 * 60 * 1000); // 7 days
      }

      return normalized;
    } catch (error) {
      console.error(`Error fetching chapter ${book} ${chapter}:`, error);
      return null;
    }
  },

  /**
   * Search verses by query
   * TTL: 7 days
   */
  async searchVerses(query, translation = DEFAULT_TRANSLATION) {
    const cacheKey = `search:${translation}:${query}`;

    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const raw = await bibleBrainProvider.searchVerses(query, translation);
      const normalized = normalizeSearchResults(raw, translation);

      if (normalized.length > 0) {
        setCache(cacheKey, normalized, 7 * 24 * 60 * 60 * 1000); // 7 days
      }

      return normalized;
    } catch (error) {
      console.error(`Error searching verses for "${query}":`, error);
      return [];
    }
  },

  /**
   * Clear all cache
   */
  clearCache() {
    memoryCache.clear();
  },

  /**
   * Clear specific cache key
   */
  clearCacheKey(key) {
    memoryCache.delete(key);
  },
};
