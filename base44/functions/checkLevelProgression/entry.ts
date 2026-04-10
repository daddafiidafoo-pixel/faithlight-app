import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();

    // Only allow users to check their own progress, or admins can check anyone
    if (userId !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch user's spiritual progress
    const progressRecords = await base44.entities.UserSpiritualProgress.filter({
      user_id: userId,
    });
    const progress = progressRecords?.[0];

    if (!progress) {
      return Response.json({ progression: 'none' }, { status: 200 });
    }

    // If there's a manual override, respect it
    if (progress.level_override) {
      return Response.json({
        currentLevel: progress.level_override,
        isOverride: true,
        overrideReason: progress.override_reason,
      });
    }

    // Check if level 1 is complete
    if (!progress.level_1_completed && progress.current_level === 1) {
      // Check if milestones are met for Level 1
      // For now, simple check: 5 lessons completed
      if (progress.completed_lesson_count >= 5) {
        // Auto-unlock Level 2
        await base44.entities.UserSpiritualProgress.update(progress.id, {
          level_1_completed: true,
          current_level: 2,
          completed_levels: [1],
          last_level_completed_at: new Date().toISOString(),
        });
        return Response.json({
          progression: 'unlocked',
          newLevel: 2,
          message: 'Congratulations! You unlocked Level 2: Growing Believer',
        });
      }
    }

    // Check if level 2 is complete
    if (
      progress.level_1_completed &&
      !progress.level_2_completed &&
      progress.current_level === 2
    ) {
      // Milestone: 15 lessons
      if (progress.completed_lesson_count >= 15) {
        await base44.entities.UserSpiritualProgress.update(progress.id, {
          level_2_completed: true,
          current_level: 3,
          completed_levels: [1, 2],
          last_level_completed_at: new Date().toISOString(),
        });
        return Response.json({
          progression: 'unlocked',
          newLevel: 3,
          message: 'Congratulations! You unlocked Level 3: Deep Study',
        });
      }
    }

    // Check if level 3 is complete
    if (
      progress.level_2_completed &&
      !progress.level_3_completed &&
      progress.current_level === 3
    ) {
      // Milestone: 25 lessons
      if (progress.completed_lesson_count >= 25) {
        await base44.entities.UserSpiritualProgress.update(progress.id, {
          level_3_completed: true,
          leader_eligible: true,
          last_level_completed_at: new Date().toISOString(),
        });
        return Response.json({
          progression: 'eligible',
          leadershipEligible: true,
          message:
            'You completed Level 3! You are now eligible for leadership approval.',
        });
      }
    }

    return Response.json({
      currentLevel: progress.current_level,
      progression: 'no_change',
    });
  } catch (error) {
    console.error('Error checking level progression:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});