/**
 * Bible Reader Service
 * Handles:
 * - Fetching chapter text
 * - Verse search
 * - Reading state persistence
 */

import { base44 } from '@/api/base44Client';
import { getChapter } from '@/components/lib/BibleCatalogProvider';

/**
 * Fetch chapter verses with graceful fallback
 * @param {string} translation - Bible version code
 * @param {string} apiCode - Book code (e.g. "JHN")
 * @param {number} chapter - Chapter number
 * @returns {Promise<{verses, audioUrl}>}
 */
export const fetchChapterWithFallback = async (translation, apiCode, chapter) => {
  try {
    // Try primary provider
    const result = await getChapter(translation, apiCode, chapter);
    
    if (result && result.verses?.length > 0) {
      return result;
    }

    // Try offline storage as fallback
    try {
      const { getChapterOffline } = await import('@/components/lib/offlineBibleManager');
      const offlineChapter = await getChapterOffline(translation, apiCode, chapter);
      if (offlineChapter?.verses?.length > 0) {
        return { ...offlineChapter, isOffline: true };
      }
    } catch (e) {
      console.debug('Offline fallback unavailable:', e.message);
    }

    return { verses: [], audioUrl: null };
  } catch (error) {
    console.error('Fetch chapter error:', error);
    return { verses: [], audioUrl: null, error: error.message };
  }
};

/**
 * Save reading position
 */
export const saveReadingPosition = async (userId, position) => {
  if (!userId) return;

  try {
    localStorage.setItem(`reading_position_${userId}`, JSON.stringify({
      api_code: position.api_code,
      chapter: position.chapter,
      verse: position.verse || 1,
      language: position.language || 'en',
      translation: position.translation || 'WEB',
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.warn('Failed to save reading position:', e);
  }
};

/**
 * Load last reading position
 */
export const loadReadingPosition = (userId) => {
  if (!userId) return null;

  try {
    const saved = localStorage.getItem(`reading_position_${userId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Search verses by text
 * (Placeholder — integrate with actual search service)
 */
export const searchVerses = async (query, translation = 'WEB') => {
  try {
    // This would call a verse search API or backend function
    console.log('Search:', query, 'in', translation);
    return [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

export default {
  fetchChapterWithFallback,
  saveReadingPosition,
  loadReadingPosition,
  searchVerses,
};