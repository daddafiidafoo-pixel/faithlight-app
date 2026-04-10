/**
 * Reading Streak Service
 * Tracks daily interactions with content (Verse of Day, Bible reading, etc.)
 * and persists streak counts via the UserStreak entity.
 */

import { base44 } from '@/api/base44Client';

const STREAK_KEY = 'fl_streak_last_interaction';

/** Returns today's date as YYYY-MM-DD string */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Returns yesterday's date as YYYY-MM-DD string */
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Record a reading interaction and update the streak for the given user.
 * Safe to call multiple times per day — only updates the DB on the first
 * interaction of each calendar day.
 *
 * @param {string} userEmail
 * @param {string} [source='verse_of_day'] - what triggered the interaction
 * @returns {Promise<{currentStreak:number, longestStreak:number, isNewMilestone:boolean, milestone:number|null}>}
 */
export async function recordReadingInteraction(userEmail, source = 'verse_of_day') {
  if (!userEmail) return null;

  const today = todayStr();
  const cacheKey = `${STREAK_KEY}_${userEmail}`;
  const lastSeen = localStorage.getItem(cacheKey);

  // Already recorded today — return nothing to avoid duplicate DB writes
  if (lastSeen === today) {
    return null;
  }

  try {
    const results = await base44.entities.UserStreak.filter({ userEmail });
    const existing = results.length > 0 ? results[0] : null;

    const yesterday = yesterdayStr();
    let currentStreak = 1;
    let longestStreak = existing?.longestStreak || 1;

    if (existing) {
      const lastDate = existing.lastReadDate;
      if (lastDate === yesterday) {
        // Consecutive day — extend streak
        currentStreak = (existing.currentStreak || 0) + 1;
      } else if (lastDate === today) {
        // Already logged today (race condition guard)
        localStorage.setItem(cacheKey, today);
        return {
          currentStreak: existing.currentStreak,
          longestStreak: existing.longestStreak,
          isNewMilestone: false,
          milestone: null,
        };
      } else {
        // Streak broken — restart
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);

      await base44.entities.UserStreak.update(existing.id, {
        currentStreak,
        longestStreak,
        lastReadDate: today,
        lastSource: source,
      });
    } else {
      // First ever interaction
      await base44.entities.UserStreak.create({
        userEmail,
        currentStreak: 1,
        longestStreak: 1,
        lastReadDate: today,
        lastSource: source,
      });
    }

    // Cache locally so we don't re-call the DB today
    localStorage.setItem(cacheKey, today);

    // Milestone detection: 7, 30, 100 days
    const MILESTONES = [7, 30, 100];
    const hitMilestone = MILESTONES.includes(currentStreak);

    return {
      currentStreak,
      longestStreak,
      isNewMilestone: hitMilestone,
      milestone: hitMilestone ? currentStreak : null,
    };
  } catch (err) {
    console.error('[readingStreakService] Failed to update streak:', err);
    return null;
  }
}

/**
 * Fetch current streak data for a user without updating it.
 * @param {string} userEmail
 * @returns {Promise<{currentStreak:number, longestStreak:number, lastReadDate:string}|null>}
 */
export async function getStreakData(userEmail) {
  if (!userEmail) return null;
  try {
    const results = await base44.entities.UserStreak.filter({ userEmail });
    return results.length > 0 ? results[0] : null;
  } catch {
    return null;
  }
}