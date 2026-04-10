import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.email;
    const today = new Date().toISOString().split('T')[0];

    // Get or create user streak record
    const streaks = await base44.entities.UserStreak.filter({ userEmail });
    let streak = streaks.length > 0 ? streaks[0] : null;

    if (!streak) {
      // Create new streak
      await base44.entities.UserStreak.create({
        userEmail,
        currentStreak: 1,
        longestStreak: 1,
        lastStreakDate: today,
        totalPrayerDays: 1,
      });
      return Response.json({ currentStreak: 1, isNewMilestone: false });
    }

    // Check if already counted today
    if (streak.lastStreakDate === today) {
      return Response.json({ currentStreak: streak.currentStreak, isNewMilestone: false });
    }

    // Check if consecutive day
    const lastDate = new Date(streak.lastStreakDate);
    const today_date = new Date(today);
    const dayDiff = Math.floor((today_date - lastDate) / (1000 * 60 * 60 * 24));

    let newCurrentStreak = dayDiff === 1 ? streak.currentStreak + 1 : 1;
    const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak || 0);
    const isNewMilestone = [7, 30, 100].includes(newCurrentStreak);

    // Update streak
    await base44.entities.UserStreak.update(streak.id, {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastStreakDate: today,
      totalPrayerDays: (streak.totalPrayerDays || 0) + 1,
      lastCelebrationStreak: isNewMilestone ? newCurrentStreak : streak.lastCelebrationStreak,
    });

    return Response.json({
      currentStreak: newCurrentStreak,
      isNewMilestone,
      milestone: isNewMilestone ? newCurrentStreak : null,
    });
  } catch (error) {
    console.error('Streak tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});