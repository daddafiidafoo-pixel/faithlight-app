/**
 * Bible Chapter Audio Cache Service
 * 
 * Caches:
 * - Successful audio track metadata
 * - Signed URL responses (short-term, may expire)
 * 
 * Does NOT cache:
 * - Errors (fail open on retry)
 * - Expired or stale URLs
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

export function getCacheKey(language, bookId, chapter) {
  return `audio:${language}:${bookId}:${chapter}`;
}

/**
 * Get cached audio track if fresh
 */
export function getCachedTrack(language, bookId, chapter) {
  const key = getCacheKey(language, bookId, chapter);
  const cached = cache.get(key);

  if (!cached) return null;

  // Check if cache entry is still fresh
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return cached.track;
}

/**
 * Cache a successful audio track
 */
export function cacheTrack(language, bookId, chapter, track) {
  const key = getCacheKey(language, bookId, chapter);
  cache.set(key, {
    track,
    timestamp: Date.now(),
  });
}

/**
 * Clear a specific cache entry
 */
export function clearCacheEntry(language, bookId, chapter) {
  const key = getCacheKey(language, bookId, chapter);
  cache.delete(key);
}

/**
 * Clear all audio cache
 */
export function clearAllCache() {
  cache.clear();
}