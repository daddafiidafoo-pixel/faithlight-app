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

    const { planId, bookCode, chapter } = await req.json();
    if (!planId || !bookCode || chapter === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create reading progress record
    const existing = await base44.entities.ReadingPlanProgress.filter({
      userEmail: user.email,
      planId,
      bookCode
    }).catch(() => []);

    const today = new Date().toISOString().split('T')[0];
    let progress;

    if (existing.length > 0) {
      progress = existing[0];
      const isNewDay = progress.lastReadDate !== today;
      
      // Update completed chapters
      if (!progress.completedChapters.includes(chapter)) {
        progress.completedChapters.push(chapter);
      }

      // Update streak
      if (isNewDay) {
        const lastDate = new Date(progress.lastReadDate);
        const todayDate = new Date(today);
        const dayDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          progress.currentStreak += 1;
        } else if (dayDiff > 1) {
          progress.currentStreak = 1; // Reset streak
        }
        
        progress.longestStreak = Math.max(progress.longestStreak || 0, progress.currentStreak);
        progress.readingDates.push(today);
      }

      progress.lastReadDate = today;
      progress.completionPercentage = Math.min(100, (progress.completedChapters.length / 66) * 100);

      await base44.entities.ReadingPlanProgress.update(progress.id, progress);
    } else {
      progress = await base44.entities.ReadingPlanProgress.create({
        userEmail: user.email,
        planId,
        bookCode,
        chapter,
        completedChapters: [chapter],
        currentStreak: 1,
        longestStreak: 1,
        lastReadDate: today,
        readingDates: [today],
        startDate: new Date().toISOString(),
        completionPercentage: (1 / 66) * 100,
        milestonesAchieved: []
      });
    }

    // Check milestones
    const milestones = {
      7: 'Week Warrior',
      14: 'Fortnight Faithful',
      30: 'Month Master',
      66: 'Bible Champion'
    };

    const newMilestones = [];
    Object.entries(milestones).forEach(([days, name]) => {
      if (progress.currentStreak === parseInt(days) && !progress.milestonesAchieved.includes(name)) {
        newMilestones.push(name);
      }
    });

    if (newMilestones.length > 0) {
      progress.milestonesAchieved = [...(progress.milestonesAchieved || []), ...newMilestones];
      await base44.entities.ReadingPlanProgress.update(progress.id, progress);
    }

    return Response.json({
      success: true,
      progress,
      newMilestones
    });
  } catch (error) {
    console.error('Logging error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});