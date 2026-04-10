/**
 * Service Cache
 * ─────────────
 * A lightweight TTL-aware in-memory cache for service layer data.
 * Use this for data that is:
 *   - Fetched frequently (Bible books, translations, verse of day)
 *   - Unlikely to change within a session
 *   - Safe to serve slightly stale
 *
 * NOT suitable for:
 *   - User-specific personalised data that must always be fresh
 *   - AI-generated answers (always fetch fresh)
 *   - Sensitive / payment data
 *
 * Usage:
 *   import { serviceCache } from '@/components/services/cache/serviceCache';
 *
 *   const cached = serviceCache.get('bible_books:en');
 *   if (cached) return cached;
 *
 *   const data = await fetchFromDB();
 *   serviceCache.set('bible_books:en', data, 5 * 60 * 1000); // 5 min TTL
 *   return data;
 *
 * Cache key conventions:
 *   bible_books:<lang>
 *   bible_chapter:<lang>:<book>:<chapter>
 *   verse_of_day:<dateKey>:<lang>
 *   ui_translations:<lang>
 *   audio_tracks:<lang>:<book>
 */

const _store = new Map(); // key → { value, expiresAt }

export const serviceCache = {
  /**
   * Retrieve a cached value, or null if missing / expired.
   */
  get(key) {
    const entry = _store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      _store.delete(key);
      return null;
    }
    return entry.value;
  },

  /**
   * Store a value with a TTL in milliseconds.
   * Default TTL: 5 minutes.
   */
  set(key, value, ttlMs = 5 * 60 * 1000) {
    _store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  /** Remove a specific key. */
  invalidate(key) {
    _store.delete(key);
  },

  /** Remove all keys matching a prefix (e.g. 'bible_books:'). */
  invalidatePrefix(prefix) {
    for (const key of _store.keys()) {
      if (key.startsWith(prefix)) _store.delete(key);
    }
  },

  /** Wipe everything — use on language change or logout. */
  clear() {
    _store.clear();
  },

  /** Debug: list all live cache keys. */
  keys() {
    const now = Date.now();
    return [..._store.entries()]
      .filter(([, v]) => v.expiresAt > now)
      .map(([k]) => k);
  },
};

// ── Cache TTL constants ──────────────────────────────────────
// Import these in services to keep TTLs consistent.

export const TTL = {
  BIBLE_BOOKS:     10 * 60 * 1000, // 10 min — rarely changes
  BIBLE_CHAPTER:    5 * 60 * 1000, // 5 min  — stable content
  VERSE_OF_DAY:    60 * 60 * 1000, // 1 hour — changes once a day
  UI_TRANSLATIONS: 10 * 60 * 1000, // 10 min — stable within session
  AUDIO_METADATA:   5 * 60 * 1000, // 5 min  — stable
  USER_SETTINGS:    2 * 60 * 1000, // 2 min  — user can change
};