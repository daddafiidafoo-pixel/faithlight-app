import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const BADGE_CRITERIA = [
  {
    id: 'streak_7',
    name: '7-Day Streak',
    icon: '🔥',
    description: 'Pray for 7 days straight',
    check: async (base44, user) => {
      const streaks = await base44.entities.UserStreak.filter({ userEmail: user.email });
      return streaks.length > 0 && streaks[0].currentStreak >= 7;
    },
  },
  {
    id: 'streak_30',
    name: '30-Day Streak',
    icon: '🌟',
    description: 'Pray for 30 days straight',
    check: async (base44, user) => {
      const streaks = await base44.entities.UserStreak.filter({ userEmail: user.email });
      return streaks.length > 0 && streaks[0].currentStreak >= 30;
    },
  },
  {
    id: 'prayers_10',
    name: 'Dedicated Pray-er',
    icon: '🙏',
    description: 'Post 10 prayer requests',
    check: async (base44, user) => {
      const prayers = await base44.entities.PrayerRequest.filter({ userEmail: user.email });
      return prayers.length >= 10;
    },
  },
  {
    id: 'prayers_50',
    name: 'Prayer Warrior',
    icon: '⚔️',
    description: 'Post 50 prayer requests',
    check: async (base44, user) => {
      const prayers = await base44.entities.PrayerRequest.filter({ userEmail: user.email });
      return prayers.length >= 50;
    },
  },
  {
    id: 'reading_plan_1',
    name: 'Plan Starter',
    icon: '📖',
    description: 'Complete 1 reading plan',
    check: async (base44, user) => {
      const progress = await base44.entities.ReadingPlanProgress.filter({ userEmail: user.email });
      return progress.filter(p => p.completedAt).length >= 1;
    },
  },
  {
    id: 'reading_plan_5',
    name: 'Plan Master',
    icon: '🏆',
    description: 'Complete 5 reading plans',
    check: async (base44, user) => {
      const progress = await base44.entities.ReadingPlanProgress.filter({ userEmail: user.email });
      return progress.filter(p => p.completedAt).length >= 5;
    },
  },
  {
    id: 'verses_100',
    name: 'Verse Explorer',
    icon: '🔍',
    description: 'Listen to 100 verses',
    check: async (base44, user) => {
      const sessions = await base44.entities.ReadingSessionLog.filter({ userEmail: user.email });
      const total = sessions.reduce((sum, s) => sum + (s.chaptersRead || 0) * 30, 0);
      return total >= 100;
    },
  },
  {
    id: 'verses_500',
    name: 'Scripture Scholar',
    icon: '📚',
    description: 'Listen to 500 verses',
    check: async (base44, user) => {
      const sessions = await base44.entities.ReadingSessionLog.filter({ userEmail: user.email });
      const total = sessions.reduce((sum, s) => sum + (s.chaptersRead || 0) * 30, 0);
      return total >= 500;
    },
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    icon: '🧠',
    description: 'Score 90%+ on 10 quizzes',
    check: async (base44, user) => {
      const quizzes = await base44.entities.DailyQuizAttempt.filter({
        userEmail: user.email,
      });
      const highScore = quizzes.filter(q => q.score >= 90);
      return highScore.length >= 10;
    },
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check all badge criteria
    const newBadges = [];
    const existingBadges = await base44.entities.UserBadge.filter({ userEmail: user.email });
    const existingIds = new Set(existingBadges.map(b => b.badgeId));

    for (const badge of BADGE_CRITERIA) {
      // Skip if already awarded
      if (existingIds.has(badge.id)) continue;

      try {
        const earned = await badge.check(base44, user);
        if (earned) {
          await base44.entities.UserBadge.create({
            userEmail: user.email,
            badgeId: badge.id,
            badgeName: badge.name,
            badgeIcon: badge.icon,
            description: badge.description,
            unlockedAt: new Date().toISOString(),
          });
          newBadges.push(badge);
        }
      } catch (e) {
        console.error(`Error checking badge ${badge.id}:`, e);
      }
    }

    return Response.json({
      success: true,
      newBadges: newBadges.map(b => ({ id: b.id, name: b.name })),
      totalBadges: existingBadges.length + newBadges.length,
    });
  } catch (error) {
    console.error('Badge award error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});