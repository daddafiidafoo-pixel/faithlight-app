import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userId, courseId, lessonId, pathId, pointsValue, badgeId } = await req.json();

    if (action === 'award_lesson_completion') {
      // Award points for lesson completion (10-25 points based on difficulty)
      const points = pointsValue || 15;
      
      // Get or create user points record
      const userPoints = await base44.entities.UserPoints.filter(
        { user_id: userId },
        '-created_date',
        1
      );

      if (userPoints.length > 0) {
        await base44.entities.UserPoints.update(userPoints[0].id, {
          total_points: userPoints[0].total_points + points,
          last_updated: new Date().toISOString(),
        });
      } else {
        await base44.entities.UserPoints.create({
          user_id: userId,
          total_points: points,
        });
      }

      // Log event
      await base44.entities.GamificationEvent.create({
        user_id: userId,
        event_type: 'lesson_completed',
        points_awarded: points,
        related_course_id: courseId,
        related_lesson_id: lessonId,
        description: `Completed lesson and earned ${points} points`,
      });

      // Check streak
      await updateStreak(base44, userId, 'lesson_completion');

      return Response.json({ success: true, points });
    }

    if (action === 'award_course_completion') {
      // Award points for course completion (100-500 points)
      const points = pointsValue || 250;

      const userPoints = await base44.entities.UserPoints.filter(
        { user_id: userId },
        '-created_date',
        1
      );

      if (userPoints.length > 0) {
        await base44.entities.UserPoints.update(userPoints[0].id, {
          total_points: userPoints[0].total_points + points,
          courses_completed: userPoints[0].courses_completed + 1,
          last_updated: new Date().toISOString(),
        });
      } else {
        await base44.entities.UserPoints.create({
          user_id: userId,
          total_points: points,
          courses_completed: 1,
        });
      }

      // Log event
      await base44.entities.GamificationEvent.create({
        user_id: userId,
        event_type: 'course_completed',
        points_awarded: points,
        related_course_id: courseId,
        description: `Completed course and earned ${points} points`,
      });

      // Check for course master badge (5 courses)
      const updatedPoints = await base44.entities.UserPoints.filter(
        { user_id: userId },
        '-created_date',
        1
      );

      if (updatedPoints[0]?.courses_completed === 5) {
        await awardBadge(base44, userId, 'course_master');
      }

      return Response.json({ success: true, points });
    }

    if (action === 'award_path_completion') {
      // Award points for path completion (200 points)
      const points = pointsValue || 200;

      const userPoints = await base44.entities.UserPoints.filter(
        { user_id: userId },
        '-created_date',
        1
      );

      if (userPoints.length > 0) {
        await base44.entities.UserPoints.update(userPoints[0].id, {
          total_points: userPoints[0].total_points + points,
          tracks_completed: userPoints[0].tracks_completed + 1,
          last_updated: new Date().toISOString(),
        });
      } else {
        await base44.entities.UserPoints.create({
          user_id: userId,
          total_points: points,
          tracks_completed: 1,
        });
      }

      // Log event
      await base44.entities.GamificationEvent.create({
        user_id: userId,
        event_type: 'path_completed',
        points_awarded: points,
        description: `Completed learning path and earned ${points} points`,
      });

      // Award pathfinder badge
      await awardBadge(base44, userId, 'pathfinder');

      return Response.json({ success: true, points });
    }

    if (action === 'check_daily_learning') {
      // Award daily learner badge and streak bonus
      const streak = await updateStreak(base44, userId, 'daily_learning');
      
      if (streak.current_streak === 7) {
        await awardBadge(base44, userId, 'daily_learner_week');
        return Response.json({ success: true, badge: 'daily_learner_week', streak: 7 });
      }

      if (streak.current_streak === 30) {
        await awardBadge(base44, userId, 'dedicated_learner');
        return Response.json({ success: true, badge: 'dedicated_learner', streak: 30 });
      }

      return Response.json({ success: true, streak: streak.current_streak });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Gamification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function updateStreak(base44, userId, streakType) {
  const today = new Date().toDateString();
  const lastStreak = await base44.entities.UserStreak.filter(
    { user_id: userId, streak_type: streakType },
    '-created_date',
    1
  );

  if (lastStreak.length === 0) {
    // Create new streak
    const newStreak = await base44.entities.UserStreak.create({
      user_id: userId,
      streak_type: streakType,
      current_streak: 1,
      longest_streak: 1,
      started_at: new Date().toISOString(),
      last_activity_date: new Date().toISOString(),
    });
    return newStreak;
  }

  const streak = lastStreak[0];
  const lastDate = new Date(streak.last_activity_date).toDateString();

  if (lastDate === today) {
    // Already updated today
    return streak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastDate === yesterday.toDateString()) {
    // Streak continues
    const newStreak = streak.current_streak + 1;
    const newLongest = Math.max(newStreak, streak.longest_streak);

    await base44.entities.UserStreak.update(streak.id, {
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: new Date().toISOString(),
    });

    return { ...streak, current_streak: newStreak, longest_streak: newLongest };
  } else {
    // Streak broken, restart
    await base44.entities.UserStreak.update(streak.id, {
      current_streak: 1,
      started_at: new Date().toISOString(),
      last_activity_date: new Date().toISOString(),
    });

    return { ...streak, current_streak: 1 };
  }
}

async function awardBadge(base44, userId, badgeType) {
  // Get badge definition
  const badges = await base44.entities.BadgeDefinition.filter(
    { trigger_value: badgeType },
    '-created_date',
    1
  );

  if (badges.length === 0) return;

  const badge = badges[0];

  // Check if user already has this badge
  const existingBadge = await base44.entities.UserBadge.filter(
    { user_id: userId, badge_id: badge.id },
    '-created_date',
    1
  );

  if (existingBadge.length > 0) return; // Already has badge

  // Award badge
  const userBadge = await base44.entities.UserBadge.create({
    user_id: userId,
    badge_id: badge.id,
    badge_name: badge.name,
    badge_icon: badge.icon_emoji,
    badge_description: badge.description,
    earned_at: new Date().toISOString(),
    points_awarded: badge.points_value || 10,
  });

  // Add badge points to user points
  const userPoints = await base44.entities.UserPoints.filter(
    { user_id: userId },
    '-created_date',
    1
  );

  if (userPoints.length > 0) {
    await base44.entities.UserPoints.update(userPoints[0].id, {
      total_points: userPoints[0].total_points + (badge.points_value || 10),
      badges_earned: userPoints[0].badges_earned + 1,
    });
  }

  // Log event
  await base44.entities.GamificationEvent.create({
    user_id: userId,
    event_type: 'badge_earned',
    badge_id: badge.id,
    points_awarded: badge.points_value || 10,
    description: `Earned ${badge.name} badge`,
  });

  return userBadge;
}