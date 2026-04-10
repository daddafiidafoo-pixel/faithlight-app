import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { book, chapter, listeningMinutes, playbackPosition, completed, translation } = await req.json();

    if (!book || !chapter || listeningMinutes === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Create listening session
    const session = await base44.entities.ListeningSessions.create({
      userId: user.id,
      book,
      chapter,
      listeningMinutes,
      playbackPosition: playbackPosition || 0,
      completed: !!completed,
      completedAt: completed ? new Date().toISOString() : null,
      date: today,
      translation: translation || 'WEB',
    });

    // Recalculate user stats
    await recalculateUserStats(base44, user.id);

    return Response.json({ success: true, session });
  } catch (error) {
    console.error('logListeningSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function recalculateUserStats(base44, userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const readingSessions = await base44.entities.ReadingSessions.filter({ user_id: userId });
    const listeningSessions = await base44.entities.ListeningSessions.filter({ user_id: userId });
    const planCompletions = await base44.entities.StudyPlanDayCompletions.filter({ user_id: userId });

    const totalReadingMinutes = readingSessions.reduce((sum, s) => sum + (s.readingMinutes || 0), 0);
    const totalListeningMinutes = listeningSessions.reduce((sum, s) => sum + (s.listeningMinutes || 0), 0);
    const weeklyReadingMinutes = readingSessions
      .filter(s => s.date >= sevenDaysAgo)
      .reduce((sum, s) => sum + (s.readingMinutes || 0), 0);
    const weeklyListeningMinutes = listeningSessions
      .filter(s => s.date >= sevenDaysAgo)
      .reduce((sum, s) => sum + (s.listeningMinutes || 0), 0);

    const chaptersCompletedCount = readingSessions.filter(s => s.completed).length +
      listeningSessions.filter(s => s.completed).length;
    const plansCompletedCount = new Set(planCompletions.map(p => p.planId)).size;

    const activeDates = new Set([
      ...readingSessions.map(s => s.date),
      ...listeningSessions.map(s => s.date),
      ...planCompletions.map(p => p.date),
    ]);
    const daysCompletedCount = activeDates.size;

    const { currentStreak, longestStreak, lastActiveDate } = calculateStreaks(activeDates);

    let userStats = await base44.entities.UserStats.filter({ user_id: userId });
    
    if (userStats.length === 0) {
      await base44.entities.UserStats.create({
        userId,
        currentStreak,
        longestStreak,
        lastActiveDate,
        totalReadingMinutes,
        totalListeningMinutes,
        weeklyReadingMinutes,
        weeklyListeningMinutes,
        chaptersCompletedCount,
        plansCompletedCount,
        daysCompletedCount,
      });
    } else {
      await base44.entities.UserStats.update(userStats[0].id, {
        currentStreak,
        longestStreak,
        lastActiveDate,
        totalReadingMinutes,
        totalListeningMinutes,
        weeklyReadingMinutes,
        weeklyListeningMinutes,
        chaptersCompletedCount,
        plansCompletedCount,
        daysCompletedCount,
      });
    }
  } catch (error) {
    console.error('recalculateUserStats error:', error);
  }
}

function calculateStreaks(activeDates) {
  const sortedDates = Array.from(activeDates).sort().reverse();
  
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }

  const today = new Date().toISOString().split('T')[0];
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let lastActiveDate = sortedDates[0];

  if (sortedDates[0] !== today && sortedDates[0] !== getYesterdayDate()) {
    currentStreak = 0;
  } else {
    currentStreak = 1;
  }

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    const dayDiff = (current - next) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  if (currentStreak > 0) {
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) continue;
      const current = new Date(sortedDates[i - 1]);
      const next = new Date(sortedDates[i]);
      const dayDiff = (current - next) / (1000 * 60 * 60 * 24);
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak, lastActiveDate };
}

function getYesterdayDate() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return yesterday.toISOString().split('T')[0];
}