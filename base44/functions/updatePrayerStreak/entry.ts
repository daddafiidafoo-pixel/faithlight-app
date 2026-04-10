import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Updates prayer streak for a user on prayer creation
 * Called from MyPrayerJournal when a prayer is saved
 * 
 * Uses server time (not client time) to prevent cheating
 * One credit per calendar day per user's timezone
 */

function toLocalDate(isoTimestamp, timezone) {
  try {
    const date = new Date(isoTimestamp);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date);
  } catch (e) {
    return new Date(isoTimestamp).toISOString().split('T')[0];
  }
}

function diffInDays(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const diffMs = b - a;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getCelebrationType(streak) {
  if (streak === 3) return "small";
  if (streak === 7) return "weekly";
  if (streak === 14) return "milestone";
  if (streak === 30) return "monthly";
  if (streak % 50 === 0) return "major";
  return null;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { timezone = 'UTC' } = await req.json();

    // Get server timestamp (prevent client clock manipulation)
    const serverTimestamp = new Date().toISOString();
    const localDate = toLocalDate(serverTimestamp, timezone);

    // Fetch or create user streak record
    let streakRecord = null;
    const streaks = await base44.entities.UserStreak.filter({
      userEmail: user.email
    });

    if (streaks.length > 0) {
      streakRecord = streaks[0];
    } else {
      // First prayer ever - create streak record
      streakRecord = await base44.entities.UserStreak.create({
        userEmail: user.email,
        currentStreak: 0,
        longestStreak: 0,
        totalPrayerDays: 0,
        lastCelebrationStreak: 0
      });
    }

    const lastDate = streakRecord.lastStreakDate;

    // Case 1: First prayer ever
    if (!lastDate) {
      const updated = await base44.entities.UserStreak.update(streakRecord.id, {
        currentStreak: 1,
        longestStreak: 1,
        lastStreakDate: localDate,
        lastPrayerDate: serverTimestamp,
        totalPrayerDays: 1,
        lastCelebrationStreak: 0
      });

      return Response.json({
        success: true,
        streakUpdated: true,
        currentStreak: 1,
        longestStreak: 1,
        celebration: "started"
      });
    }

    // Case 2: Same day (already earned credit today)
    if (localDate === lastDate) {
      return Response.json({
        success: true,
        streakUpdated: false,
        currentStreak: streakRecord.currentStreak,
        longestStreak: streakRecord.longestStreak,
        celebration: null,
        message: "You've already kept today's prayer streak alive. Keep praying. 🙏"
      });
    }

    // Case 3: Next day (continue streak)
    const dayDiff = diffInDays(lastDate, localDate);

    if (dayDiff === 1) {
      const newStreak = streakRecord.currentStreak + 1;
      const celebrationType = getCelebrationType(newStreak);
      const shouldCelebrate = celebrationType && newStreak !== streakRecord.lastCelebrationStreak;

      const updated = await base44.entities.UserStreak.update(streakRecord.id, {
        currentStreak: newStreak,
        longestStreak: Math.max(streakRecord.longestStreak, newStreak),
        lastStreakDate: localDate,
        lastPrayerDate: serverTimestamp,
        totalPrayerDays: (streakRecord.totalPrayerDays || 0) + 1,
        lastCelebrationStreak: shouldCelebrate ? newStreak : streakRecord.lastCelebrationStreak
      });

      return Response.json({
        success: true,
        streakUpdated: true,
        currentStreak: newStreak,
        longestStreak: Math.max(streakRecord.longestStreak, newStreak),
        celebration: shouldCelebrate ? celebrationType : null,
        streakMilestone: newStreak
      });
    }

    // Case 4: Gap of 2+ days (reset to 1)
    const updated = await base44.entities.UserStreak.update(streakRecord.id, {
      currentStreak: 1,
      longestStreak: Math.max(streakRecord.longestStreak, 1),
      lastStreakDate: localDate,
      lastPrayerDate: serverTimestamp,
      totalPrayerDays: (streakRecord.totalPrayerDays || 0) + 1,
      lastCelebrationStreak: 0
    });

    return Response.json({
      success: true,
      streakUpdated: true,
      currentStreak: 1,
      longestStreak: Math.max(streakRecord.longestStreak, 1),
      celebration: "restart",
      message: "Streak reset, but you're back on track! 💪"
    });
  } catch (error) {
    console.error('updatePrayerStreak error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});