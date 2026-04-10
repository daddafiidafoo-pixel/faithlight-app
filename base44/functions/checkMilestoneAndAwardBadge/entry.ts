import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Check if user has reached badge milestone and award badge
 * Called after lessons/courses completed, achievements reached
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, milestone_type, milestone_value } = await req.json();

    if (!user_id || !milestone_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all badge definitions matching this milestone type
    const badges = await base44.asServiceRole.entities.BadgeDefinition.filter({
      criteria_type: milestone_type,
      is_active: true,
    });

    const applicableBadges = badges.filter(b => {
      if (milestone_value === undefined) return false;
      return milestone_value >= (b.criteria_value || 0);
    });

    if (applicableBadges.length === 0) {
      return Response.json({
        success: true,
        badges_awarded: [],
        message: 'No badges earned for this milestone',
      });
    }

    // Check which badges user already has
    const userBadges = await base44.asServiceRole.entities.UserBadge.filter({
      user_id,
    });
    const userBadgeIds = new Set(userBadges.map(b => b.badge_id));

    const newBadges = [];

    // Award new badges
    for (const badge of applicableBadges) {
      if (!userBadgeIds.has(badge.id)) {
        const userBadge = await base44.asServiceRole.entities.UserBadge.create({
          user_id,
          badge_id: badge.id,
          badge_name: badge.name,
          badge_emoji: badge.emoji,
        });

        // Award bonus points
        if (badge.reward_points > 0) {
          await base44.functions.invoke('awardPoints', {
            user_id,
            event_type: 'badge_earned',
            points: badge.reward_points,
            related_id: badge.id,
          });
        }

        // Create notification
        await base44.functions.invoke('createCommunityNotification', {
          user_id,
          type: 'progress_milestone',
          actor_id: 'system',
          actor_name: 'FaithLight',
          title: `🏆 New Badge: ${badge.emoji} ${badge.name}`,
          message: badge.description,
          related_id: userBadge.id,
          related_type: 'badge',
        });

        newBadges.push(userBadge);
      }
    }

    return Response.json({
      success: true,
      badges_awarded: newBadges,
      total_badges_earned: newBadges.length,
    });
  } catch (error) {
    console.error('Badge milestone error:', error);
    return Response.json(
      { error: 'Failed to check milestone', details: error.message },
      { status: 500 }
    );
  }
});