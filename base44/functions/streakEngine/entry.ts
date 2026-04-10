import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, engagementType } = await req.json();

    if (!userEmail || !engagementType) {
      return Response.json(
        { error: 'userEmail and engagementType required' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Record daily engagement
    const engagementData = { userEmail, engagementDate: today };
    engagementData[`engagedWith${engagementType.charAt(0).toUpperCase() + engagementType.slice(1)}`] = true;

    let engagement = await base44.entities.UserDailyEngagement.filter({
      userEmail,
      engagementDate: today,
    });

    if (engagement && engagement.length > 0) {
      await base44.entities.UserDailyEngagement.update(engagement[0].id, engagementData);
    } else {
      await base44.entities.UserDailyEngagement.create(engagementData);
    }

    // Get or create streak record
    const streakType = engagementType === 'plan' ? 'plan_completion' : 'bible_reading';
    let streaks = await base44.entities.Streak.filter({
      userEmail,
      streakType,
    });

    let streak = streaks && streaks.length > 0 ? streaks[0] : null;
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split('T')[0];

    if (!streak) {
      // New streak
      streak = await base44.entities.Streak.create({
        userEmail,
        streakType,
        currentCount: 1,
        longestCount: 1,
        lastEngagementDate: today,
      });
    } else if (streak.lastEngagementDate === yesterday) {
      // Continue streak
      const newCount = (streak.currentCount || 0) + 1;
      const newLongest = Math.max(newCount, streak.longestCount || 0);
      streak = await base44.entities.Streak.update(streak.id, {
        currentCount: newCount,
        longestCount: newLongest,
        lastEngagementDate: today,
      });

      // Check for badge awards
      if (newCount === 3 || newCount === 7 || newCount === 30) {
        await awardStreakBadge(base44, userEmail, newCount, streakType);
      }
    } else if (streak.lastEngagementDate !== today) {
      // Streak broken, reset
      streak = await base44.entities.Streak.update(streak.id, {
        currentCount: 1,
        lastEngagementDate: today,
      });
    }

    return Response.json({
      success: true,
      streak: {
        currentCount: streak.currentCount,
        longestCount: streak.longestCount,
        type: streakType,
      },
    });
  } catch (error) {
    console.error('Streak engine error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});

async function awardStreakBadge(base44, userEmail, count, streakType) {
  const badgeCodes = {
    3: `${streakType}_3_day`,
    7: `${streakType}_7_day`,
    30: `${streakType}_30_day`,
  };

  const badgeCode = badgeCodes[count];
  if (!badgeCode) return;

  // Check if already awarded
  const existing = await base44.entities.UserBadge.filter({
    userEmail,
    badgeCode,
  });

  if (!existing || existing.length === 0) {
    await base44.entities.UserBadge.create({
      userEmail,
      badgeCode,
      awardedAt: new Date().toISOString(),
      metadataJson: { streakCount: count, streakType },
    });
  }
}