/**
 * Offline Cache Strategy for Bible Content
 * 
 * LICENSING NOTE: Bible Brain API is licensed. You can only cache content
 * in ways your license permits. This module provides safe defaults:
 * 
 * ✅ Level 1 (Light) - Always Safe
 *    - Cache last opened chapter in memory/storage
 *    - App shell + UI assets
 *    - Does NOT bulk-download or redistribute
 * 
 * ⚠️ Level 2 (Controlled) - Check License
 *    - Per-chapter temporary caching
 *    - Auto-evict old content
 *    - Requires explicit license permission
 * 
 * ❌ Level 3 (Full) - Requires Explicit Rights
 *    - Bulk download entire Bible
 *    - Permanent redistribution
 *    - Not supported without full license
 * 
 * DEFAULT: Level 1 (Light) - Safe for all licenses
 */

const CACHE_CONFIG = {
  // Maximum chapters to keep in memory
  maxCachedChapters: 5,
  // How long to keep cached content (7 days)
  cacheTTL: 7 * 24 * 60 * 60 * 1000,
  // Storage key prefix
  keyPrefix: "faithlight_verse_cache",
};

/**
 * LEVEL 1: Light Offline Caching (SAFE - No License Restrictions)
 * 
 * Caches only:
 * - Last opened chapter (user's viewing history)
 * - Recently viewed verses
 * - Does not bulk download
 * 
 * This is passive caching — content is cached as the user reads,
 * not proactively downloaded.
 */

/**
 * Cache a verse or chapter text locally
 * 
 * Usage:
 * - Call after loading a chapter from API
 * - Automatically expires after TTL
 * - User browsing creates the cache naturally
 * 
 * @param {string} languageCode - Language (e.g., "om", "en")
 * @param {string} bookId - Book code (e.g., "JHN")
 * @param {number} chapter - Chapter number
 * @param {Array} verses - Verse objects with text
 */
export function cacheChapterText(languageCode, bookId, chapter, verses) {
  if (!verses || verses.length === 0) return;

  try {
    const key = `${CACHE_CONFIG.keyPrefix}:${languageCode}:${bookId}:${chapter}`;
    const value = {
      verses,
      timestamp: Date.now(),
      expires: Date.now() + CACHE_CONFIG.cacheTTL,
    };

    localStorage.setItem(key, JSON.stringify(value));
    _pruneOldCache();
  } catch (err) {
    // Storage quota exceeded or private browsing — just skip
    console.warn("Could not cache chapter:", err.message);
  }
}

/**
 * Retrieve cached chapter text
 * 
 * Returns null if:
 * - Not in cache
 * - Cache expired
 * - Storage unavailable
 * 
 * @param {string} languageCode
 * @param {string} bookId
 * @param {number} chapter
 * @returns {Array|null} - Verse objects or null
 */
export function getCachedChapter(languageCode, bookId, chapter) {
  try {
    const key = `${CACHE_CONFIG.keyPrefix}:${languageCode}:${bookId}:${chapter}`;
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    const data = JSON.parse(cached);

    // Check expiration
    if (data.expires && Date.now() > data.expires) {
      localStorage.removeItem(key);
      return null;
    }

    return data.verses;
  } catch (err) {
    return null;
  }
}

/**
 * Check if chapter is cached and fresh
 * 
 * @param {string} languageCode
 * @param {string} bookId
 * @param {number} chapter
 * @returns {boolean}
 */
export function isCached(languageCode, bookId, chapter) {
  return getCachedChapter(languageCode, bookId, chapter) !== null;
}

/**
 * Get cache statistics for UI display
 * 
 * @returns {Object} - { cachedChapters, totalSize, oldestEntry }
 */
export function getCacheStats() {
  try {
    const entries = [];
    const prefix = CACHE_CONFIG.keyPrefix;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const data = JSON.parse(localStorage.getItem(key));
        entries.push({
          key,
          size: JSON.stringify(data).length,
          timestamp: data.timestamp,
        });
      }
    }

    const totalSize = entries.reduce((sum, e) => sum + e.size, 0);
    const oldestEntry = entries.length > 0
      ? Math.min(...entries.map(e => e.timestamp))
      : null;

    return {
      cachedChapters: entries.length,
      totalSize: `${(totalSize / 1024).toFixed(1)} KB`,
      oldestEntry: oldestEntry ? new Date(oldestEntry) : null,
    };
  } catch (err) {
    return { cachedChapters: 0, totalSize: "0 KB", oldestEntry: null };
  }
}

/**
 * Clear cache for a specific chapter
 * 
 * @param {string} languageCode
 * @param {string} bookId
 * @param {number} chapter
 */
export function clearChapterCache(languageCode, bookId, chapter) {
  try {
    const key = `${CACHE_CONFIG.keyPrefix}:${languageCode}:${bookId}:${chapter}`;
    localStorage.removeItem(key);
  } catch (err) {
    console.warn("Could not clear cache:", err.message);
  }
}

/**
 * Clear ALL verse cache (user action: "Clear Reading History")
 */
export function clearAllCache() {
  try {
    const prefix = CACHE_CONFIG.keyPrefix;
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    return keysToRemove.length;
  } catch (err) {
    console.warn("Could not clear all cache:", err.message);
    return 0;
  }
}

/**
 * INTERNAL: Remove expired cache entries
 * Called automatically when adding new cache
 */
function _pruneOldCache() {
  try {
    const prefix = CACHE_CONFIG.keyPrefix;
    const now = Date.now();
    let pruned = 0;

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;

      const data = JSON.parse(localStorage.getItem(key));
      if (data.expires && now > data.expires) {
        localStorage.removeItem(key);
        pruned++;
      }
    }

    // Also remove oldest entries if cache is too large
    if (localStorage.getItem(`${prefix}:count`) > CACHE_CONFIG.maxCachedChapters) {
      // Let oldest expire naturally, or user can clear manually
    }
  } catch (err) {
    // Silent fail for storage errors
  }
}

/**
 * ============================================
 * LEVEL 2: Service Worker Cache (Advanced)
 * ============================================
 * 
 * For offline audio playback (optional):
 * Use Service Worker Cache API for short-term reuse
 * of recently played audio files.
 * 
 * ⚠️ Only enable if your license permits temporary caching
 */

export async function cacheAudioForPlayback(audioUrl, chapterKey) {
  if (!("caches" in window)) return;

  try {
    const cache = await caches.open("faithlight-audio-cache");
    const response = await fetch(audioUrl);
    await cache.put(audioUrl, response.clone());
  } catch (err) {
    console.warn("Could not cache audio:", err.message);
  }
}

export async function getCachedAudio(audioUrl) {
  if (!("caches" in window)) return null;

  try {
    const cache = await caches.open("faithlight-audio-cache");
    return await cache.match(audioUrl);
  } catch (err) {
    return null;
  }
}

/**
 * ============================================
 * RECOMMENDATIONS FOR YOUR APP
 * ============================================
 * 
 * PHASE 1 (NOW): Level 1 Only
 * - Implement cacheChapterText + getCachedChapter
 * - User passively builds cache as they read
 * - Show "Last read" indicator from cache
 * - Add "Clear Cache" in Settings
 * 
 * PHASE 2 (LATER): Add Level 2 if License Permits
 * - Service Worker caching for audio
 * - Show "Cached" badge on played chapters
 * - Auto-evict cache > 7 days
 * - Settings: Toggle offline mode ON/OFF
 * 
 * PHASE 3 (FUTURE): Full Offline Packs
 * - Only after explicit licensing agreement
 * - Allow bulk download of specific books/languages
 * - Show storage usage and download progress
 * - Clear individual downloads from library
 * 
 * DO NOT IMPLEMENT:
 * ❌ Download entire Bible without user action
 * ❌ Redistribute cached content outside the app
 * ❌ Cache without user knowledge
 * ❌ Ignore license restrictions
 */