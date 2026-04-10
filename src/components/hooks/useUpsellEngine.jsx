/**
 * useUpsellEngine
 *
 * Centralized upsell trigger engine. Single source of truth for:
 *  - AI explain gate  (3/day free, 10/day basic, unlimited premium)
 *  - Sermon gate      (0/day free, 3/day basic, unlimited premium)
 *  - Reading session  (streak + 5th session milestone)
 *  - Cooldown (once per 24h per session)
 *  - Milestone dedup  (streak7 fires once only)
 *
 * Usage:
 *   const engine = useUpsellEngine(user, plan);
 *   // Then:
 *   const ok = await engine.checkAIExplain();   // returns true if allowed
 *   await engine.logAIExplain();
 *   const ok = await engine.checkSermon();
 *   await engine.logSermon();
 *   await engine.logReading({ minutes });
 *
 *   // Subscribe to modal open:
 *   engine.upsellOpen   // boolean
 *   engine.upsellReason // string
 *   engine.closeUpsell  // fn
 */

import { useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { shouldShowUpsells } from '@/components/lib/billing/paymentsGuard';

// ── Date helpers ──────────────────────────────────────────────────────────────
export function getLocalDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getYesterdayKey() {
  const d = new Date(); d.setDate(d.getDate()-1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── Plan limits ───────────────────────────────────────────────────────────────
const LIMITS = {
  FREE:    { explain: 3,        sermon: 0 },
  BASIC:   { explain: 10,       sermon: 3 },
  PREMIUM: { explain: Infinity, sermon: Infinity },
};

function limitsFor(plan) {
  return LIMITS[(plan||'FREE').toUpperCase()] || LIMITS.FREE;
}

// ── Entity helpers (getOrCreate pattern) ─────────────────────────────────────
const FALLBACK_TODAY = (userId, dateKey) => ({ user_id: userId, date_key: dateKey, ai_explain_count: 0, ai_sermon_attempts: 0, reading_sessions: 0, reading_minutes: 0 });
const FALLBACK_STATS = (userId) => ({ user_id: userId, current_streak: 0, longest_streak: 0, total_reading_sessions: 0, milestones_unlocked: [] });

async function getTodayDoc(userId) {
  if (!userId) return FALLBACK_TODAY(null, getLocalDateKey());
  const dateKey = getLocalDateKey();
  try {
    const rows = await base44.entities.UserDailyActivity.filter({ user_id: userId, date_key: dateKey }).catch(() => []);
    if (rows?.length) return rows[0];
    return await base44.entities.UserDailyActivity.create({
      user_id: userId, date_key: dateKey,
      reading_sessions: 0, reading_minutes: 0,
      listening_minutes: 0, ai_explain_count: 0, ai_sermon_attempts: 0,
    }).catch(() => FALLBACK_TODAY(userId, dateKey));
  } catch {
    return FALLBACK_TODAY(userId, dateKey);
  }
}

async function getStatsDoc(userId) {
  if (!userId) return FALLBACK_STATS(null);
  try {
    const rows = await base44.entities.UserStats.filter({ user_id: userId }).catch(() => []);
    if (rows?.length) return rows[0];
    return await base44.entities.UserStats.create({
      user_id: userId, current_streak: 0, longest_streak: 0,
      total_reading_sessions: 0, milestones_unlocked: [],
    }).catch(() => FALLBACK_STATS(userId));
  } catch {
    return FALLBACK_STATS(userId);
  }
}

async function pushNotification(userId, { type, title, message, link }) {
  await base44.entities.Notification.create({
    user_id: userId, type, title, message, link: link || '/upgrade-premium', is_read: false,
  }).catch(() => {});
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useUpsellEngine(user, plan = 'FREE') {
  const userId = user?.id;
  const normalizedPlan = (plan || 'FREE').toUpperCase();
  const isPremium = normalizedPlan === 'PREMIUM';
  const showUpsells = shouldShowUpsells();

  const [upsellOpen, setUpsellOpen]     = useState(false);
  const [upsellReason, setUpsellReason] = useState('DEFAULT');

  // Reader-app model: no upsells inside native wrapper — checked after hooks
  // (hooks must not be called conditionally)
  
  // In-memory cooldown (24h) — persisted via UserStats.lastUpsellAt for cross-session
  const lastShownAt = useRef(null);

  const canShowUpsell = useCallback((statsDoc) => {
    if (isPremium) return false;
    // In-memory check first (same session)
    if (lastShownAt.current && Date.now() - lastShownAt.current < 24 * 60 * 60 * 1000) return false;
    // Cross-session check from DB
    if (statsDoc?.last_upsell_at) {
      if (Date.now() - new Date(statsDoc.last_upsell_at).getTime() < 24 * 60 * 60 * 1000) return false;
    }
    return true;
  }, [isPremium]);

  const fireUpsell = useCallback(async (reason, statsDoc) => {
    if (!canShowUpsell(statsDoc)) return;
    lastShownAt.current = Date.now();
    // Persist last_upsell_at
    if (statsDoc?.id) {
      base44.entities.UserStats.update(statsDoc.id, {
        last_upsell_at: new Date().toISOString(),
        last_upsell_reason: reason,
      }).catch(() => {});
    }
    setUpsellReason(reason);
    setUpsellOpen(true);
  }, [canShowUpsell]);

  // ── checkAIExplain ─────────────────────────────────────────────────────────
  const checkAIExplain = useCallback(async () => {
    if (!userId || isPremium) return true;
    const limits   = limitsFor(normalizedPlan);
    const today    = await getTodayDoc(userId);
    const used     = today?.ai_explain_count || 0;
    const allowed  = used < limits.explain;
    if (!allowed) {
      const stats = await getStatsDoc(userId);
      await pushNotification(userId, {
        type: 'LIMIT', title: 'AI limit reached',
        message: "You've reached today's AI explanation limit. Upgrade for more.",
        link: '/upgrade-premium',
      });
      await fireUpsell('AI_LIMIT', stats);
    }
    return allowed;
  }, [userId, normalizedPlan, isPremium, fireUpsell]);

  const logAIExplain = useCallback(async () => {
    if (!userId) return;
    const today = await getTodayDoc(userId);
    if (today?.id) {
      base44.entities.UserDailyActivity.update(today.id, {
        ai_explain_count: (today.ai_explain_count || 0) + 1,
      }).catch(() => {});
    }
  }, [userId]);

  // ── checkSermon ────────────────────────────────────────────────────────────
  const checkSermon = useCallback(async () => {
    if (!userId) return !isPremium ? false : true;
    const limits  = limitsFor(normalizedPlan);
    const stats   = await getStatsDoc(userId);

    // Free users: always block + fire upsell
    if (normalizedPlan === 'FREE') {
      await fireUpsell('SERMON_ATTEMPT', stats);
      return false;
    }

    const today   = await getTodayDoc(userId);
    const used    = today?.ai_sermon_attempts || 0;
    const allowed = used < limits.sermon;

    // Nudge non-premium users even if allowed (soft trigger)
    if (!isPremium && allowed) {
      await fireUpsell('SERMON_ATTEMPT', stats);
    }

    if (!allowed) {
      await pushNotification(userId, {
        type: 'LIMIT', title: 'Sermon limit reached',
        message: "You've reached today's sermon generation limit. Upgrade for unlimited.",
        link: '/upgrade-premium',
      });
      await fireUpsell('AI_LIMIT', stats);
    }

    return allowed;
  }, [userId, normalizedPlan, isPremium, fireUpsell]);

  const logSermon = useCallback(async () => {
    if (!userId) return;
    const today = await getTodayDoc(userId);
    if (today?.id) {
      base44.entities.UserDailyActivity.update(today.id, {
        ai_sermon_attempts: (today.ai_sermon_attempts || 0) + 1,
      }).catch(() => {});
    }
  }, [userId]);

  // ── logReading ─────────────────────────────────────────────────────────────
  const logReading = useCallback(async ({ minutes = 0 } = {}) => {
    if (!userId) return;
    const dateKey      = getLocalDateKey();
    const yesterdayKey = getYesterdayKey();

    // Daily activity
    const today = await getTodayDoc(userId);
    if (today?.id) {
      base44.entities.UserDailyActivity.update(today.id, {
        reading_sessions: (today.reading_sessions || 0) + 1,
        reading_minutes:  (today.reading_minutes  || 0) + minutes,
      }).catch(() => {});
    }

    // Stats + streak
    const stats = await getStatsDoc(userId);
    const alreadyCounted = stats.last_active_date_key === dateKey;
    let newStreak = stats.current_streak || 0;

    if (!alreadyCounted) {
      newStreak = stats.last_active_date_key === yesterdayKey
        ? (stats.current_streak || 0) + 1
        : 1;
      const newLongest = Math.max(stats.longest_streak || 0, newStreak);
      const newTotal   = (stats.total_reading_sessions || 0) + 1;

      if (stats?.id) {
        base44.entities.UserStats.update(stats.id, {
          current_streak:         newStreak,
          longest_streak:         newLongest,
          last_active_date_key:   dateKey,
          total_reading_sessions: newTotal,
        }).catch(() => {});
      }

      // 7-day streak milestone (once only)
      if (newStreak === 7 && !stats.milestones_unlocked?.includes('streak7')) {
        base44.entities.UserStats.update(stats.id, {
          milestones_unlocked: [...(stats.milestones_unlocked || []), 'streak7'],
        }).catch(() => {});
        await pushNotification(userId, {
          type: 'MILESTONE', title: '🔥 7-Day Streak!',
          message: "You've read 7 days in a row. Keep going!",
          link: '/home',
        });
        await fireUpsell('STREAK_7', stats);
      }

      // 5th session milestone
      const newTotal2 = (stats.total_reading_sessions || 0) + 1;
      if (newTotal2 === 5) {
        await fireUpsell('READING_5', stats);
      }
    } else {
      // Still count total even if streak already updated today
      if (stats?.id) {
        const newTotal = (stats.total_reading_sessions || 0) + 1;
        base44.entities.UserStats.update(stats.id, {
          total_reading_sessions: newTotal,
        }).catch(() => {});
        if (newTotal === 5) await fireUpsell('READING_5', stats);
      }
    }
  }, [userId, fireUpsell]);

  if (!showUpsells) {
    return {
      upsellOpen: false,
      upsellReason: 'DEFAULT',
      closeUpsell: () => {},
      checkAIExplain: async () => true,
      logAIExplain: async () => {},
      checkSermon: async () => true,
      logSermon: async () => {},
      logReading: async () => {},
    };
  }

  return {
    upsellOpen,
    upsellReason,
    closeUpsell: () => setUpsellOpen(false),
    checkAIExplain,
    logAIExplain,
    checkSermon,
    logSermon,
    logReading,
  };
}