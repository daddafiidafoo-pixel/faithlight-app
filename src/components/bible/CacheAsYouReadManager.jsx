/**
 * Cache-as-You-Read Manager
 * Automatically saves chapters to offline storage as user reads them online
 */

import { saveChapterOffline } from '@/components/lib/offlineBibleManager';

/**
 * Auto-cache chapter when fetched
 * Call this after fetching verses from the API
 */
export async function autoCacheChapter(versionId, book, chapter, verses) {
  try {
    // Only save if online and verses exist
    if (!verses || verses.length === 0) return false;

    // Save to IndexedDB silently (user doesn't need to know)
    await saveChapterOffline(versionId, book, chapter, verses);
    
    console.log(`Auto-cached: ${versionId} ${book} ${chapter}`);
    return true;
  } catch (error) {
    // Silent fail - caching should never interrupt reading
    console.warn('Cache-as-you-read error:', error);
    return false;
  }
}

/**
 * Dispatch event when cache completes (optional, for UI feedback)
 */
export function notifyCacheComplete(versionId, book, chapter) {
  const event = new CustomEvent('chapter-cached', {
    detail: { versionId, book, chapter },
  });
  window.dispatchEvent(event);
}