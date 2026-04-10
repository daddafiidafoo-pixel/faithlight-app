/**
 * Offline Bible Pack Loader
 * Loads Bible chapters from public/bibles/{versionId}/{bookId}.json
 * Caches in localStorage for faster access
 */

const PACK_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
const CACHE_PREFIX = 'offline-bible-pack:';

/**
 * Load a Bible chapter from offline pack
 * Prioritizes local JSON files over API
 */
export async function loadBiblePackChapter(versionId, bookId, chapter) {
  try {
    // Check localStorage cache first
    const cacheKey = `${CACHE_PREFIX}${versionId}:${bookId}:${chapter}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < PACK_CACHE_TTL) {
        return data.content;
      }
    }

    // Try loading from public/bibles/{versionId}/{bookId}.json
    const packPath = `/bibles/${versionId}/${bookId}.json`;
    const response = await fetch(packPath);

    if (!response.ok) {
      return null; // Pack not available
    }

    const packData = await response.json();
    
    // Extract chapter from pack
    const chapterData = packData.chapters?.[chapter];
    if (!chapterData) {
      return null;
    }

    // Cache the result
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        content: chapterData,
        timestamp: Date.now(),
      }));
    } catch (e) {
      // Cache failed, but we still have the data
      console.warn('[offlineBiblePack] Failed to cache chapter:', e);
    }

    return chapterData;
  } catch (error) {
    console.warn(`[offlineBiblePack] Failed to load ${versionId}/${bookId}:`, error);
    return null;
  }
}

/**
 * Check if an offline pack is available for a version
 */
export async function checkOfflinePackAvailable(versionId) {
  try {
    // Try to fetch the pack manifest or a sample chapter
    const response = await fetch(`/bibles/${versionId}/manifest.json`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get list of available offline packs
 */
export async function getAvailableOfflinePacks() {
  const supportedVersions = ['en_kjv', 'en_web', 'om_oromoo', 'sw_suv', 'am_amharic'];
  const available = [];

  for (const version of supportedVersions) {
    const isAvailable = await checkOfflinePackAvailable(version);
    if (isAvailable) {
      available.push(version);
    }
  }

  return available;
}

/**
 * Sample offline pack structure for reference:
 * /public/bibles/en_kjv/genesis.json
 * {
 *   "versionId": "en_kjv",
 *   "bookId": "GEN",
 *   "bookName": "Genesis",
 *   "chapters": {
 *     "1": {
 *       "chapterNum": 1,
 *       "verses": [
 *         {
 *           "verseNum": 1,
 *           "text": "In the beginning God created the heaven and the earth."
 *         },
 *         ...
 *       ]
 *     },
 *     "2": { ... },
 *     ...
 *   }
 * }
 */