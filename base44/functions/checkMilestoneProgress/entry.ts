import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({
        userProgress: { current_level: 1, completed_levels: [], badges_earned: [] },
        levelProgress: {},
        currentLevel: 1,
        completedLevels: [],
        leaderEligible: false,
        leaderApproved: false,
        milestoneDefinitions: {}
      });
    }

    // Get user progress
    const progress = await base44.entities.UserSpiritualProgress.filter({
      user_id: user.id
    }).catch(() => []);

    const userProgress = progress?.[0] || {
      user_id: user.id,
      current_level: 1,
      completed_levels: [],
      leader_eligible: false,
      leader_approved: false
    };

    // Define milestones for each level with unlock rules
    const milestonesMap = {
      1: {
        required: [
          'L1_COURSE_7DAY_BEGINNER_COMPLETE',
          'L1_READ_JOHN_PROGRESS_70',
          'L1_PRAYER_REFLECTIONS_5'
        ],
        optional: ['L1_JOIN_BEGINNER_GROUP_1'],
        badge: { name: 'BADGE_ROOTED', emoji: '🌱', label: 'Rooted in Christ' },
        unlockRule: 'Must complete 3 required milestones'
      },
      2: {
        required: [
          'L2_COURSE_SPIRITUAL_GROWTH_COMPLETE',
          'L2_DEVOTIONAL_STREAK_14',
          'L2_COMMUNITY_PARTICIPATION_3'
        ],
        optional: ['L2_BIBLE_STUDY_METHOD_COMPLETE'],
        badge: { name: 'BADGE_ESTABLISHED', emoji: '🌿', label: 'Established' },
        unlockRule: 'Must complete 3 required milestones'
      },
      3: {
        required: [
          'L3_COURSE_DOCTRINE_FOUNDATIONS_COMPLETE',
          'L3_QUIZ_PASS_3',
          'L3_JOIN_STUDY_GROUP_1'
        ],
        optional: ['L3_HEBREWS_OR_ACTS_PROGRESS_50'],
        badge: { name: 'BADGE_GROUNDED', emoji: '📖', label: 'Grounded in Truth' },
        unlockRule: 'Must complete 3 required milestones → leader_eligible = true'
      }
    };

    // Get user completed milestones
    const completedMilestones = userProgress.badges_earned || [];

    // Calculate progress for each level
    const levelProgress = {};
    for (let level = 1; level <= 3; level++) {
      const levelDef = milestonesMap[level];
      const allMilestones = [...levelDef.required, ...levelDef.optional];
      const requiredCompleted = levelDef.required.filter(m => completedMilestones.includes(m));
      const optionalCompleted = levelDef.optional.filter(m => completedMilestones.includes(m));
      
      // Check if level is unlocked (all required + optional recommendations met)
      const isUnlocked = requiredCompleted.length === levelDef.required.length;
      
      levelProgress[level] = {
        total: levelDef.required.length,
        completed: requiredCompleted.length,
        remaining: levelDef.required.length - requiredCompleted.length,
        isUnlocked,
        badge: levelDef.badge,
        milestones: allMilestones.map(m => ({
          key: m,
          completed: completedMilestones.includes(m),
          isRequired: levelDef.required.includes(m),
          isOptional: levelDef.optional.includes(m)
        }))
      };
    }

    return Response.json({
      userProgress,
      levelProgress,
      currentLevel: userProgress.current_level,
      completedLevels: userProgress.completed_levels,
      leaderEligible: userProgress.leader_eligible,
      leaderApproved: userProgress.leader_approved,
      milestoneDefinitions: milestonesMap
    });
  } catch (error) {
    console.error('Error checking milestone progress:', error);
    return Response.json({
      userProgress: { current_level: 1, completed_levels: [], badges_earned: [] },
      levelProgress: {},
      currentLevel: 1,
      completedLevels: [],
      leaderEligible: false,
      leaderApproved: false,
      milestoneDefinitions: {}
    });
  }
});