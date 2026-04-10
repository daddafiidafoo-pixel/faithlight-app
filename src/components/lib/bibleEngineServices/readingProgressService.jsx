/**
 * Reading Progress Service
 * Tracks:
 * - Last book/chapter/verse
 * - Reading streaks
 * - Progress persistence
 */

import { base44 } from '@/api/base44Client';

/**
 * Log a reading session
 */
export const logReadingSession = async (userId, apiCode, chapter, durationSeconds) => {
  if (!userId) return;

  try {
    // Save to database via backend
    await base44.functions.invoke('logReadingSession', {
      user_id: userId,
      book_code: apiCode,
      chapter: chapter,
      duration_seconds: durationSeconds,
    });
  } catch (error) {
    console.warn('Failed to log reading session:', error);
  }
};

/**
 * Save current reading state
 */
export const saveReadingState = (userId, state) => {
  if (!userId) return;

  try {
    localStorage.setItem(`reading_state_${userId}`, JSON.stringify({
      api_code: state.api_code,
      chapter: state.chapter,
      verse: state.verse || 1,
      language: state.language || 'en',
      translation: state.translation || 'WEB',
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.warn('Failed to save reading state:', e);
  }
};

/**
 * Load reading state
 */
export const loadReadingState = (userId) => {
  if (!userId) return null;

  try {
    const saved = localStorage.getItem(`reading_state_${userId}`);
    if (!saved) return null;

    const state = JSON.parse(saved);
    
    // Check if old (>30 days) — reset to Genesis 1
    const daysSince = (Date.now() - state.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSince > 30) {
      return { api_code: 'GEN', chapter: 1, verse: 1, language: 'en', translation: 'WEB' };
    }

    return state;
  } catch (e) {
    return null;
  }
};

/**
 * Get reading streak
 */
export const getReadingStreak = async (userId) => {
  if (!userId) return { current: 0, longest: 0 };

  try {
    const result = await base44.functions.invoke('getUserStats', {
      user_id: userId,
    });

    return {
      current: result?.data?.current_streak || 0,
      longest: result?.data?.longest_streak || 0,
      lastRead: result?.data?.last_read_date,
    };
  } catch (error) {
    console.error('Failed to fetch streak:', error);
    return { current: 0, longest: 0 };
  }
};

/**
 * Track reading goal progress
 */
export const trackReadingGoal = async (userId, bookCount, chapterCount) => {
  if (!userId) return;

  try {
    await base44.entities.UserStats.create({
      user_id: userId,
      chapters_read_today: chapterCount,
      books_read_month: bookCount,
      timestamp: new Date(),
    });
  } catch (error) {
    console.warn('Failed to track goal:', error);
  }
};

export default {
  logReadingSession,
  saveReadingState,
  loadReadingState,
  getReadingStreak,
  trackReadingGoal,
};