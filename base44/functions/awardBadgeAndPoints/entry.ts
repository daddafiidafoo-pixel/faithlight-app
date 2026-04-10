import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, course_id, track_level, badge_type } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'user_id required' }, { status: 400 });
    }

    // Get or create user points record
    const userPointsRecords = await base44.asServiceRole.entities.UserPoints.filter(
      { user_id },
      null,
      1
    );

    let userPoints = userPointsRecords?.[0];
    if (!userPoints) {
      userPoints = await base44.asServiceRole.entities.UserPoints.create({
        user_id,
        total_points: 0,
        courses_completed: 0,
        tracks_completed: 0,
        badges_earned: 0,
      });
    }

    const badgesToAward = [];

    // Award course completion badge
    if (course_id && badge_type === 'course') {
      const badgeDefinitions = await base44.asServiceRole.entities.BadgeDefinition.filter(
        { trigger_type: 'course_id', trigger_value: course_id, is_active: true },
        null,
        1
      );

      if (badgeDefinitions?.length > 0) {
        badgesToAward.push({
          badge: badgeDefinitions[0],
          relatedCourseId: course_id,
        });
      }

      // General "course completion" badge
      const generalBadge = await base44.asServiceRole.entities.BadgeDefinition.filter(
        { badge_type: 'course_completion', trigger_type: 'manual' },
        null,
        1
      );
      if (generalBadge?.length > 0) {
        badgesToAward.push({
          badge: generalBadge[0],
          relatedCourseId: course_id,
        });
      }
    }

    // Award track completion badge
    if (track_level && badge_type === 'track') {
      const trackBadge = await base44.asServiceRole.entities.BadgeDefinition.filter(
        { trigger_type: 'track_level', trigger_value: track_level, is_active: true },
        null,
        1
      );

      if (trackBadge?.length > 0) {
        badgesToAward.push({
          badge: trackBadge[0],
          relatedTrack: track_level,
        });
      }
    }

    // Avoid duplicates - check if user already has these badges
    const existingBadges = await base44.asServiceRole.entities.UserBadge.filter(
      { user_id },
      null,
      1000
    );

    let pointsEarned = 0;
    const awardedBadges = [];

    for (const badgeToAward of badgesToAward) {
      const badge = badgeToAward.badge;

      // Check if already earned
      const alreadyEarned = existingBadges?.some((ub) => ub.badge_id === badge.id);
      if (alreadyEarned) continue;

      // Award the badge
      const userBadge = await base44.asServiceRole.entities.UserBadge.create({
        user_id,
        badge_id: badge.id,
        badge_name: badge.name,
        badge_icon: badge.icon_emoji,
        badge_description: badge.description,
        earned_at: new Date().toISOString(),
        points_awarded: badge.points_value || 10,
        related_course_id: badgeToAward.relatedCourseId,
        related_track: badgeToAward.relatedTrack,
      });

      pointsEarned += badge.points_value || 10;
      awardedBadges.push(userBadge);
    }

    // Update user points
    if (pointsEarned > 0 || badge_type) {
      const updates = {
        total_points: (userPoints.total_points || 0) + pointsEarned,
        badges_earned: (userPoints.badges_earned || 0) + awardedBadges.length,
        last_updated: new Date().toISOString(),
      };

      if (badge_type === 'course') {
        updates.courses_completed = (userPoints.courses_completed || 0) + 1;
      }
      if (badge_type === 'track') {
        updates.tracks_completed = (userPoints.tracks_completed || 0) + 1;
      }

      await base44.asServiceRole.entities.UserPoints.update(userPoints.id, updates);
    }

    return Response.json({
      success: true,
      badges_awarded: awardedBadges,
      points_earned: pointsEarned,
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    return Response.json(
      { error: error.message || 'Failed to award badge' },
      { status: 500 }
    );
  }
});