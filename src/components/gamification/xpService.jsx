import { base44 } from '@/api/base44Client';

const XP_VALUES = {
  completed_study_day: 15,
  subscribed_to_plan: 10,
  completed_prayer_request: 20,
  completed_habit: 10,
  plan_finished: 100,
};

const BADGE_THRESHOLDS = [
  { xp: 50,   type: 'first_steps',   name: 'First Steps',    icon: '👣' },
  { xp: 200,  type: 'chapters_5',    name: 'Faithful Reader', icon: '📖' },
  { xp: 500,  type: 'dedication',    name: 'Dedicated',      icon: '🔥' },
  { xp: 1000, type: 'scholar',       name: 'Scholar',        icon: '🎓' },
  { xp: 2000, type: 'streak_100',    name: 'Bible Champion', icon: '🏆' },
];

export async function awardXP(userId, amount, reason) {
  if (!userId) return;
  try {
    // Get or create user streak (used as XP store)
    const streaks = await base44.entities.UserStreak.filter({ user_id: userId }, null, 1);
    let streak = streaks?.[0];

    if (!streak) {
      streak = await base44.entities.UserStreak.create({
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        total_chapters_read: 0,
        total_verses_read: 0,
        total_xp: amount,
      });
    } else {
      const newXP = (streak.total_xp || 0) + amount;
      await base44.entities.UserStreak.update(streak.id, { total_xp: newXP });

      // Check badge thresholds
      const oldXP = streak.total_xp || 0;
      for (const badge of BADGE_THRESHOLDS) {
        if (oldXP < badge.xp && newXP >= badge.xp) {
          // Award badge if not already awarded
          const existing = await base44.entities.UserBadge.filter(
            { user_id: userId, badge_type: badge.type }, null, 1
          );
          if (!existing?.length) {
            await base44.entities.UserBadge.create({
              user_id: userId,
              badge_type: badge.type,
              badge_name: badge.name,
              badge_icon: badge.icon,
              unlocked_date: new Date().toISOString(),
            });
          }
        }
      }
      streak.total_xp = newXP;
    }
    return streak;
  } catch (e) {
    console.error('[xpService] awardXP error:', e);
  }
}

export async function getUserXP(userId) {
  if (!userId) return { total_xp: 0, level: 1 };
  try {
    const streaks = await base44.entities.UserStreak.filter({ user_id: userId }, null, 1);
    const xp = streaks?.[0]?.total_xp || 0;
    return { total_xp: xp, level: Math.floor(xp / 200) + 1, streak: streaks?.[0] };
  } catch (e) {
    return { total_xp: 0, level: 1 };
  }
}

export { BADGE_THRESHOLDS, XP_VALUES };