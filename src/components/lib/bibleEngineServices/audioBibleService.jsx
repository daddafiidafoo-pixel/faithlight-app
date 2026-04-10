/**
 * Audio Bible Service
 * Handles:
 * - Loading chapter audio URLs
 * - Playback state (play/pause/seek)
 * - Chapter navigation during playback
 */

import { base44 } from '@/api/base44Client';

/**
 * Get audio URL for a chapter
 * Route through Bible.is or other provider
 * @param {string} apiCode - Book code
 * @param {number} chapter
 * @param {string} version - Optional version/fileset ID
 * @returns {Promise<{url, duration, timings}>}
 */
export const getChapterAudioUrl = async (apiCode, chapter, version = null) => {
  try {
    // Call backend proxy to Bible.is or other provider
    const result = await base44.functions.invoke('bibleisProxy', {
      action: 'getAudio',
      book_code: apiCode,
      chapter: chapter,
      version: version,
    });

    if (result?.data?.audioUrl) {
      return {
        url: result.data.audioUrl,
        duration: result.data.duration || null,
        timings: result.data.timings || null, // Verse-level timing data (future)
      };
    }

    return { url: null, duration: null, timings: null };
  } catch (error) {
    console.error('Failed to load audio:', error);
    return { url: null, duration: null, timings: null, error: error.message };
  }
};

/**
 * Verse-level timing sync (future feature)
 * Maps current playback time to verse number
 */
export const findCurrentVerseFromTime = (currentTime, timings) => {
  if (!timings || timings.length === 0) return null;

  return timings.find(t => 
    currentTime >= t.start && currentTime < t.end
  );
};

/**
 * Save audio playback position
 */
export const saveAudioPosition = (userId, apiCode, chapter, currentTime) => {
  if (!userId) return;

  try {
    const key = `audio_position_${userId}_${apiCode}_${chapter}`;
    localStorage.setItem(key, JSON.stringify({
      currentTime,
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.warn('Failed to save audio position:', e);
  }
};

/**
 * Load audio playback position
 */
export const loadAudioPosition = (userId, apiCode, chapter) => {
  if (!userId) return 0;

  try {
    const key = `audio_position_${userId}_${apiCode}_${chapter}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved).currentTime : 0;
  } catch (e) {
    return 0;
  }
};

/**
 * Get playback speed preference
 */
export const getPlaybackSpeed = (userId) => {
  try {
    const speed = localStorage.getItem(`playback_speed_${userId}`);
    return speed ? parseFloat(speed) : 1.0;
  } catch (e) {
    return 1.0;
  }
};

/**
 * Save playback speed preference
 */
export const savePlaybackSpeed = (userId, speed) => {
  try {
    localStorage.setItem(`playback_speed_${userId}`, speed.toString());
  } catch (e) {
    console.warn('Failed to save playback speed:', e);
  }
};

export default {
  getChapterAudioUrl,
  findCurrentVerseFromTime,
  saveAudioPosition,
  loadAudioPosition,
  getPlaybackSpeed,
  savePlaybackSpeed,
};