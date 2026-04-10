import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { activity_type } = await req.json();
    const today = new Date().toISOString().split('T')[0];

    // Check if activity already logged today
    const existing = await base44.entities.StreakActivity.filter({
      userId: user.email,
      date: today,
      activityType: activity_type,
    });

    if (existing && existing.length > 0) {
      return Response.json({
        success: true,
        message: 'Activity already logged today',
      });
    }

    // Log activity
    await base44.entities.StreakActivity.create({
      userId: user.email,
      date: today,
      activityType: activity_type,
    });

    // Update or create streak
    const streaks = await base44.entities.UserStreak.filter({
      userId: user.email,
    });

    let streak = streaks ? streaks[0] : null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = streak?.lastCompletedDate === yesterday;

    if (streak) {
      const newCurrentStreak = isConsecutive ? streak.currentStreak + 1 : 1;
      const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak || 0);

      await base44.entities.UserStreak.update(streak.id, {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: today,
        totalActiveDays: (streak.totalActiveDays || 0) + 1,
      });
    } else {
      await base44.entities.UserStreak.create({
        userId: user.email,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: today,
        totalActiveDays: 1,
      });
    }

    return Response.json({
      success: true,
      streak_updated: true,
    });
  } catch (error) {
    console.error('Error logging reading activity:', error);
    return Response.json(
      { error: error.message || 'Failed to log activity' },
      { status: 500 }
    );
  }
});