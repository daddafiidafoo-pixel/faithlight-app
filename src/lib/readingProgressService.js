/**
 * Reading Progress Service - localStorage-based tracking for reading plans
 * Tracks completed chapters for each plan per user
 */

const STORAGE_PREFIX = 'fl_reading_progress_';

/**
 * Get progress for a specific plan
 * @param {string} planId - The reading plan ID
 * @param {string} userEmail - User's email (optional, uses sessionStorage if not provided)
 * @returns {Object} Progress object with completed days, current day, etc.
 */
export function getReadingProgress(planId, userEmail = null) {
  const key = userEmail ? `${STORAGE_PREFIX}${userEmail}_${planId}` : `${STORAGE_PREFIX}${planId}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : {
    planId,
    completedDays: [],
    currentDay: 1,
    startedAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
  };
}

/**
 * Mark a day as completed
 * @param {string} planId - The reading plan ID
 * @param {number} day - Day number to mark as complete
 * @param {string} userEmail - User's email
 * @returns {Object} Updated progress
 */
export function markDayComplete(planId, day, userEmail = null) {
  const progress = getReadingProgress(planId, userEmail);
  if (!progress.completedDays.includes(day)) {
    progress.completedDays.push(day);
    progress.completedDays.sort((a, b) => a - b);
  }
  progress.currentDay = Math.max(progress.currentDay, day + 1);
  progress.lastAccessed = new Date().toISOString();
  
  const key = userEmail ? `${STORAGE_PREFIX}${userEmail}_${planId}` : `${STORAGE_PREFIX}${planId}`;
  localStorage.setItem(key, JSON.stringify(progress));
  
  // Dispatch event for cross-tab sync
  window.dispatchEvent(new CustomEvent('readingProgressUpdated', { detail: { planId, progress } }));
  
  return progress;
}

/**
 * Get all reading plans user has started
 * @param {string} userEmail - User's email
 * @returns {Array} Array of plan IDs with progress
 */
export function getAllReadingProgress(userEmail = null) {
  const plans = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      const data = JSON.parse(localStorage.getItem(key));
      plans.push(data);
    }
  }
  return plans;
}

/**
 * Clear progress for a specific plan
 * @param {string} planId - The reading plan ID
 * @param {string} userEmail - User's email
 */
export function clearReadingProgress(planId, userEmail = null) {
  const key = userEmail ? `${STORAGE_PREFIX}${userEmail}_${planId}` : `${STORAGE_PREFIX}${planId}`;
  localStorage.removeItem(key);
}

/**
 * Hook to sync progress to backend (optional)
 * Call this to save localStorage progress to database
 */
export async function syncProgressToBackend(planId, userEmail, base44) {
  if (!base44) return;
  
  try {
    const progress = getReadingProgress(planId, userEmail);
    await base44.entities.ReadingPlanProgress.update(planId, {
      completed_days: progress.completedDays,
      current_day: progress.currentDay,
      last_accessed: progress.lastAccessed,
    });
  } catch (error) {
    console.error('Failed to sync progress:', error);
  }
}