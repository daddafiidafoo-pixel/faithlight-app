import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Seed default badge definitions
 * Run once to populate badge system
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const badgeDefinitions = [
      {
        name: 'First Step',
        emoji: '👣',
        description: 'Completed your first lesson',
        criteria_type: 'lesson_count',
        criteria_value: 1,
        rarity: 'common',
        reward_points: 50,
      },
      {
        name: 'Dedicated Learner',
        emoji: '📚',
        description: 'Completed 10 lessons',
        criteria_type: 'lesson_count',
        criteria_value: 10,
        rarity: 'common',
        reward_points: 100,
      },
      {
        name: 'Persistent Scholar',
        emoji: '🎓',
        description: 'Completed 25 lessons',
        criteria_type: 'lesson_count',
        criteria_value: 25,
        rarity: 'rare',
        reward_points: 250,
      },
      {
        name: 'Master Student',
        emoji: '🏆',
        description: 'Completed 50 lessons',
        criteria_type: 'lesson_count',
        criteria_value: 50,
        rarity: 'epic',
        reward_points: 500,
      },
      {
        name: 'Flame Keeper',
        emoji: '🔥',
        description: 'Maintained a 7-day learning streak',
        criteria_type: 'streak_days',
        criteria_value: 7,
        rarity: 'rare',
        reward_points: 150,
      },
      {
        name: 'Unstoppable',
        emoji: '⚡',
        description: 'Maintained a 30-day learning streak',
        criteria_type: 'streak_days',
        criteria_value: 30,
        rarity: 'epic',
        reward_points: 500,
      },
      {
        name: 'Legendary Streak',
        emoji: '💎',
        description: 'Maintained a 100-day learning streak',
        criteria_type: 'streak_days',
        criteria_value: 100,
        rarity: 'legendary',
        reward_points: 1000,
      },
      {
        name: 'Foundation Builder',
        emoji: '🌱',
        description: 'Completed Level 1',
        criteria_type: 'level_completion',
        criteria_value: 1,
        rarity: 'common',
        reward_points: 200,
      },
      {
        name: 'Growing Faith',
        emoji: '🌿',
        description: 'Completed Level 2',
        criteria_type: 'level_completion',
        criteria_value: 2,
        rarity: 'rare',
        reward_points: 300,
      },
      {
        name: 'Spiritual Maturity',
        emoji: '🌳',
        description: 'Completed Level 3',
        criteria_type: 'level_completion',
        criteria_value: 3,
        rarity: 'epic',
        reward_points: 500,
      },
      {
        name: 'Servant Leader',
        emoji: '👑',
        description: 'Approved as Level 4 leader',
        criteria_type: 'level_completion',
        criteria_value: 4,
        rarity: 'legendary',
        reward_points: 1000,
      },
      {
        name: 'Community Voice',
        emoji: '🗣️',
        description: 'Created first community post',
        criteria_type: 'community_posts',
        criteria_value: 1,
        rarity: 'common',
        reward_points: 50,
      },
      {
        name: 'Active Contributor',
        emoji: '💬',
        description: 'Made 10 community posts or forum replies',
        criteria_type: 'community_posts',
        criteria_value: 10,
        rarity: 'rare',
        reward_points: 200,
      },
    ];

    // Check if badges already exist
    const existingBadges = await base44.asServiceRole.entities.BadgeDefinition.filter({});
    if (existingBadges.length > 0) {
      return Response.json({
        success: true,
        message: 'Badges already exist',
        count: existingBadges.length,
      });
    }

    // Seed badges
    const created = await base44.asServiceRole.entities.BadgeDefinition.bulkCreate(
      badgeDefinitions
    );

    return Response.json({
      success: true,
      message: 'Badges seeded successfully',
      count: created.length,
    });
  } catch (error) {
    console.error('Badge seeding error:', error);
    return Response.json(
      { error: 'Failed to seed badges', details: error.message },
      { status: 500 }
    );
  }
});