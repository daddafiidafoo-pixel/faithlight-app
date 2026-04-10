/**
 * readingStreakService.js
 * Handles reading session recording + streak calculation + badge awards.
 */

import { base44 } from '@/api/base44Client';

const MILESTONES = [7, 30, 100, 150, 200, 365];

const BADGE_DEFINITIONS = {
  7:   { name: 'Faithful Start',    icon: '🔥' },
  30:  { name: 'Steady Disciple',   icon: '📖' },
  100: { name: 'Deep Roots',        icon: '👑' },
  150: { name: 'Devoted Heart',     icon: '✨' },
  200: { name: 'Faithful Servant',  icon: '🕊️' },
  365: { name: 'Year of the Word',  icon: '🌟' },
};

/** Return today's date string YYYY-MM-DD in local time */
export function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Return yesterday's date string */
function yesterdayLocal() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nextMilestone(streak) {
  return MILESTONES.find(m => m > streak) || MILESTONES[MILESTONES.length - 1] + 50;
}

/**
 * Record a completed chapter and update the user's streak.
 *
 * @param {string} userId
 * @param {string} bookId        e.g. "John"
 * @param {number} chapterNumber
 * @param {string} method        "scroll" | "audio" | "manual"
 * @param {string} language      "en" | "om"
 */
export async function recordChapterRead({ userId, bookId, chapterNumber, method = 'scroll', language = 'en' }) {
  const today = todayLocal();
  const chapterKey = `${bookId}-${chapterNumber}`;

  // 1 — Avoid duplicate sessions for same chapter+day
  const existing = await base44.entities.ReadingSession.filter(
    { user_id: userId, chapter_key: chapterKey, completed_date_local: today },
    '-created_date', 1
  ).catch(() => []);

  if (existing.length === 0) {
    await base44.entities.ReadingSession.create({
      user_id: userId,
      book_id: bookId,
      chapter_number: chapterNumber,
      language_code: language,
      completion_percent: 100,
      completion_method: method,
      completed_date_local: today,
      counted_for_streak: false,
      chapter_key: chapterKey,
    }).catch(() => {});
  }

  // 2 — Update streak
  await updateStreak(userId, today);
}

/**
 * Core streak update logic.
 */
async function updateStreak(userId, today) {
  const yesterday = yesterdayLocal();

  // Fetch current streak record
  const streaks = await base44.entities.UserStreak.filter({ user_id: userId }, '-created_date', 1).catch(() => []);
  const streakRecord = streaks[0] || null;

  let currentStreak = streakRecord?.current_streak || 0;
  let longestStreak = streakRecord?.longest_streak || 0;
  const lastReadDate = streakRecord?.last_read_date || null;

  // Determine new streak value
  if (!lastReadDate) {
    // First ever read
    currentStreak = 1;
  } else if (lastReadDate === today) {
    // Already counted today — nothing to change
    return;
  } else if (lastReadDate === yesterday) {
    // Consecutive day
    currentStreak = currentStreak + 1;
  } else {
    // Gap — reset
    currentStreak = 1;
  }

  longestStreak = Math.max(longestStreak, currentStreak);
  const next = nextMilestone(currentStreak);
  const daysTo = Math.max(0, next - currentStreak);

  const streakData = {
    user_id: userId,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_read_date: today,
    next_milestone: next,
    days_to_next_milestone: daysTo,
  };

  if (streakRecord) {
    await base44.entities.UserStreak.update(streakRecord.id, streakData).catch(() => {});
  } else {
    await base44.entities.UserStreak.create(streakData).catch(() => {});
  }

  // Award milestone badges
  await checkAndAwardBadges(userId, currentStreak);
}

async function checkAndAwardBadges(userId, currentStreak) {
  const earned = await base44.entities.StreakBadge.filter({ user_id: userId }, null, 20).catch(() => []);
  const earnedMilestones = new Set(earned.map(b => b.milestone));

  for (const milestone of MILESTONES) {
    if (currentStreak >= milestone && !earnedMilestones.has(milestone)) {
      const def = BADGE_DEFINITIONS[milestone];
      await base44.entities.StreakBadge.create({
        user_id: userId,
        milestone,
        badge_name: def.name,
        badge_icon: def.icon,
        earned_at: new Date().toISOString(),
      }).catch(() => {});
    }
  }
}

/**
 * Load streak data for display.
 * Returns { currentStreak, longestStreak, nextMilestone, daysToNextMilestone, badges }
 */
export async function getStreakData(userId) {
  const [streaks, badges] = await Promise.all([
    base44.entities.UserStreak.filter({ user_id: userId }, '-created_date', 1).catch(() => []),
    base44.entities.StreakBadge.filter({ user_id: userId }, 'milestone', 20).catch(() => []),
  ]);

  const s = streaks[0];
  return {
    currentStreak: s?.current_streak || 0,
    longestStreak: s?.longest_streak || 0,
    nextMilestone: s?.next_milestone || 7,
    daysToNextMilestone: s?.days_to_next_milestone || 7,
    badges,
  };
}

export { BADGE_DEFINITIONS, MILESTONES };