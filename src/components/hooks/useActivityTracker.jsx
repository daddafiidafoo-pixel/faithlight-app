/**
 * useActivityTracker
 * 
 * Central hook for tracking reading sessions, AI usage,
 * streak logic, and triggering contextual upsells.
 *
 * Usage:
 *   const { logReading, checkAI, logAIExplain, logSermonAttempt } = useActivityTracker(user, plan, onUpsell);
 */

import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// ─── Date helpers ────────────────────────────────────────────────────────────
export function getLocalDateKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getYesterdayDateKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Plan limits ──────────────────────────────────────────────────────────────
export function getAiLimitsForPlan(plan) {
  if (plan === 'PREMIUM') return { explain: Infinity, sermonAttempts: Infinity };
  if (plan === 'BASIC')   return { explain: 10, sermonAttempts: 3 };
  return { explain: 3, sermonAttempts: 0 }; // FREE
}

// ─── Cooldown check ───────────────────────────────────────────────────────────
function canShowUpsell(stats) {
  if (!stats?.last_upsell_at) return true;
  return Date.now() - new Date(stats.last_upsell_at).getTime() > 24 * 60 * 60 * 1000;
}

// ─── Get or create today's activity doc ──────────────────────────────────────
async function getTodayActivity(userId, dateKey) {
  const existing = await base44.entities.UserDailyActivity.filter(
    { user_id: userId, date_key: dateKey }, '-created_date', 1
  ).catch(() => []);
  if (existing.length > 0) return existing[0];
  return base44.entities.UserDailyActivity.create({
    user_id: userId,
    date_key: dateKey,
    reading_sessions: 0,
    reading_minutes: 0,
    listening_minutes: 0,
    ai_explain_count: 0,
    ai_sermon_attempts: 0,
  });
}

// ─── Get or create user stats doc ────────────────────────────────────────────
async function getUserStats(userId) {
  const existing = await base44.entities.UserStats.filter(
    { user_id: userId }, '-created_date', 1
  ).catch(() => []);
  if (existing.length > 0) return existing[0];
  return base44.entities.UserStats.create({
    user_id: userId,
    current_streak: 0,
    longest_streak: 0,
    last_active_date_key: null,
    total_reading_sessions: 0,
    milestones_unlocked: [],
  });
}

// ─── Create notification ──────────────────────────────────────────────────────
async function createNotification(userId, { type, title, message, link }) {
  await base44.entities.Notification.create({
    user_id: userId,
    type,
    title,
    message,
    link: link || '/upgrade',
    is_read: false,
  }).catch(() => {});
}

// ─── Main hook ────────────────────────────────────────────────────────────────
export function useActivityTracker(user, plan = 'FREE', onUpsell) {
  const userId = user?.id;
  const normalizedPlan = (plan || 'FREE').toUpperCase();

  // ── Upsell trigger (internal) ──────────────────────────────────────────────
  const triggerUpsell = useCallback(async (reason) => {
    if (normalizedPlan === 'PREMIUM') return;
    if (!userId) return;
    const stats = await getUserStats(userId).catch(() => null);
    if (!canShowUpsell(stats)) return;
    if (stats?.id) {
      await base44.entities.UserStats.update(stats.id, {
        last_upsell_at: new Date().toISOString(),
        last_upsell_reason: reason,
      }).catch(() => {});
    }
    onUpsell?.(reason);
  }, [userId, normalizedPlan, onUpsell]);

  // ── Log a reading session (call after chapter read) ───────────────────────
  const logReading = useCallback(async ({ minutes = 0 } = {}) => {
    if (!userId) return;
    const dateKey       = getLocalDateKey();
    const yesterdayKey  = getYesterdayDateKey();

    // Upsert daily activity
    let todayDoc = await getTodayActivity(userId, dateKey);
    await base44.entities.UserDailyActivity.update(todayDoc.id, {
      reading_sessions: (todayDoc.reading_sessions || 0) + 1,
      reading_minutes:  (todayDoc.reading_minutes  || 0) + minutes,
    }).catch(() => {});

    // Streak logic
    let stats = await getUserStats(userId);
    const alreadyCounted = stats.last_active_date_key === dateKey;

    if (!alreadyCounted) {
      let newStreak = 1;
      if (stats.last_active_date_key === yesterdayKey) {
        newStreak = (stats.current_streak || 0) + 1;
      }
      const newLongest = Math.max(stats.longest_streak || 0, newStreak);
      const updates = {
        current_streak:          newStreak,
        longest_streak:          newLongest,
        last_active_date_key:    dateKey,
        total_reading_sessions:  (stats.total_reading_sessions || 0) + 1,
      };
      await base44.entities.UserStats.update(stats.id, updates).catch(() => {});

      // 7-day milestone
      if (newStreak === 7) {
        const alreadyUnlocked = stats.milestones_unlocked?.includes('streak7');
        if (!alreadyUnlocked) {
          await base44.entities.UserStats.update(stats.id, {
            milestones_unlocked: [...(stats.milestones_unlocked || []), 'streak7'],
          }).catch(() => {});
          await createNotification(userId, {
            type: 'MILESTONE',
            title: '🔥 7-Day Streak!',
            message: "You've read 7 days in a row. Keep going — your growth matters!",
            link: '/home',
          });
          triggerUpsell('STREAK_7');
        }
      }

      // Refresh stats for total check
      stats = { ...stats, total_reading_sessions: (stats.total_reading_sessions || 0) + 1 };
    } else {
      // Still count session even if streak already updated today
      await base44.entities.UserStats.update(stats.id, {
        total_reading_sessions: (stats.total_reading_sessions || 0) + 1,
      }).catch(() => {});
      stats = { ...stats, total_reading_sessions: (stats.total_reading_sessions || 0) + 1 };
    }

    // 5th session upsell
    if (stats.total_reading_sessions === 5) {
      triggerUpsell('READING_5');
    }
  }, [userId, triggerUpsell]);

  // ── Check + log AI explain ────────────────────────────────────────────────
  const checkAIExplain = useCallback(async () => {
    if (!userId) return { allowed: true };
    const dateKey = getLocalDateKey();
    const limits  = getAiLimitsForPlan(normalizedPlan);
    const todayDoc = await getTodayActivity(userId, dateKey);
    const used = todayDoc?.ai_explain_count || 0;
    const allowed = used < limits.explain;
    if (!allowed) {
      await createNotification(userId, {
        type: 'LIMIT',
        title: 'AI limit reached',
        message: "You've reached today's AI explanation limit. Upgrade for more.",
        link: '/upgrade-premium',
      });
      triggerUpsell('AI_LIMIT');
    }
    return { allowed, used, limit: limits.explain };
  }, [userId, normalizedPlan, triggerUpsell]);

  const logAIExplain = useCallback(async () => {
    if (!userId) return;
    const dateKey  = getLocalDateKey();
    const todayDoc = await getTodayActivity(userId, dateKey);
    await base44.entities.UserDailyActivity.update(todayDoc.id, {
      ai_explain_count: (todayDoc.ai_explain_count || 0) + 1,
    }).catch(() => {});
  }, [userId]);

  // ── Check + log Sermon attempt ────────────────────────────────────────────
  const checkSermonAttempt = useCallback(async () => {
    if (!userId) return { allowed: normalizedPlan !== 'FREE' };
    const dateKey = getLocalDateKey();
    const limits  = getAiLimitsForPlan(normalizedPlan);

    // Sermon builder is always premium-gated for FREE users
    if (normalizedPlan === 'FREE') {
      triggerUpsell('SERMON_ATTEMPT');
      return { allowed: false, used: 0, limit: 0 };
    }

    const todayDoc = await getTodayActivity(userId, dateKey);
    const used = todayDoc?.ai_sermon_attempts || 0;
    const allowed = used < limits.sermonAttempts;
    if (!allowed) {
      await createNotification(userId, {
        type: 'LIMIT',
        title: 'Sermon limit reached',
        message: "You've reached today's sermon generation limit. Upgrade for unlimited.",
        link: '/upgrade-premium',
      });
      triggerUpsell('AI_LIMIT');
    } else {
      // Trigger upsell as a nudge even if allowed (soft trigger on every attempt for non-premium)
      if (normalizedPlan !== 'PREMIUM') triggerUpsell('SERMON_ATTEMPT');
    }
    return { allowed, used, limit: limits.sermonAttempts };
  }, [userId, normalizedPlan, triggerUpsell]);

  const logSermonAttempt = useCallback(async () => {
    if (!userId) return;
    const dateKey  = getLocalDateKey();
    const todayDoc = await getTodayActivity(userId, dateKey);
    await base44.entities.UserDailyActivity.update(todayDoc.id, {
      ai_sermon_attempts: (todayDoc.ai_sermon_attempts || 0) + 1,
    }).catch(() => {});
  }, [userId]);

  // ── Fetch today's AI usage for display ───────────────────────────────────
  const getTodayAIUsage = useCallback(async () => {
    if (!userId) return { ai_explain_count: 0, ai_sermon_attempts: 0 };
    const dateKey  = getLocalDateKey();
    const todayDoc = await getTodayActivity(userId, dateKey).catch(() => null);
    return {
      ai_explain_count:   todayDoc?.ai_explain_count   || 0,
      ai_sermon_attempts: todayDoc?.ai_sermon_attempts || 0,
    };
  }, [userId]);

  // ── Fetch streak for display ──────────────────────────────────────────────
  const getStreak = useCallback(async () => {
    if (!userId) return { current_streak: 0, longest_streak: 0 };
    const stats = await getUserStats(userId).catch(() => null);
    return {
      current_streak: stats?.current_streak || 0,
      longest_streak: stats?.longest_streak || 0,
    };
  }, [userId]);

  return {
    logReading,
    checkAIExplain,
    logAIExplain,
    checkSermonAttempt,
    logSermonAttempt,
    getTodayAIUsage,
    getStreak,
  };
}