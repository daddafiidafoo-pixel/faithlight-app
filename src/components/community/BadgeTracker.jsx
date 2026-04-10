import { base44 } from '@/api/base44Client';

const BADGE_DEFINITIONS = {
  first_public_note: { name: 'First Steps', description: 'Shared your first public note' },
  first_public_highlight: { name: 'Highlighter', description: 'Highlighted your first verse publicly' },
  first_discussion: { name: 'Conversation Starter', description: 'Started your first discussion' },
  top_contributor: { name: 'Top Contributor', description: 'Ranked in top 10 contributors' },
  daily_engagement_7: { name: '7-Day Streak', description: 'Engaged 7 days in a row' },
  daily_engagement_30: { name: '30-Day Warrior', description: 'Engaged 30 days in a row' },
  helpful_100: { name: 'Helper', description: '100+ helpful contributions' },
  scholar: { name: 'Scholar', description: 'Deep engagement with Scripture' },
  community_leader: { name: 'Community Leader', description: 'Outstanding community leadership' },
  verse_master: { name: 'Verse Master', description: 'Mastered many Bible passages' }
};

export async function checkAndAwardBadge(userId, badgeType) {
  try {
    // Check if user already has this badge
    const existing = await base44.entities.UserBadge.filter({
      user_id: userId,
      badge_type: badgeType
    });
    
    if (existing.length > 0) return null;

    // Award the badge
    const badge = BADGE_DEFINITIONS[badgeType];
    if (!badge) return null;

    const newBadge = await base44.entities.UserBadge.create({
      user_id: userId,
      badge_type: badgeType,
      badge_name: badge.name,
      badge_description: badge.description,
      earned_at: new Date().toISOString()
    });

    return newBadge;
  } catch (error) {
    console.error('Failed to award badge:', error);
    return null;
  }
}

export async function trackActivity(userId, activityType, points = 1) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get or create today's activity record
    const existing = await base44.entities.UserActivity.filter({
      user_id: userId,
      activity_date: today
    });

    const updates = {
      total_points: points
    };

    if (activityType === 'public_note') updates.public_notes_count = 1;
    if (activityType === 'public_highlight') updates.public_highlights_count = 1;
    if (activityType === 'discussion') updates.discussions_started = 1;
    if (activityType === 'reply') updates.discussion_replies = 1;

    if (existing.length > 0) {
      const current = existing[0];
      await base44.entities.UserActivity.update(current.id, {
        public_notes_count: (current.public_notes_count || 0) + (updates.public_notes_count || 0),
        public_highlights_count: (current.public_highlights_count || 0) + (updates.public_highlights_count || 0),
        discussions_started: (current.discussions_started || 0) + (updates.discussions_started || 0),
        discussion_replies: (current.discussion_replies || 0) + (updates.discussion_replies || 0),
        total_points: (current.total_points || 0) + points
      });
    } else {
      await base44.entities.UserActivity.create({
        user_id: userId,
        activity_date: today,
        ...updates
      });
    }

    // Check for badge achievements
    await checkBadgeAchievements(userId, activityType);
  } catch (error) {
    console.error('Failed to track activity:', error);
  }
}

async function checkBadgeAchievements(userId, activityType) {
  try {
    // Check first-time badges
    if (activityType === 'public_note') {
      await checkAndAwardBadge(userId, 'first_public_note');
    }
    if (activityType === 'public_highlight') {
      await checkAndAwardBadge(userId, 'first_public_highlight');
    }
    if (activityType === 'discussion') {
      await checkAndAwardBadge(userId, 'first_discussion');
    }

    // Check streak badges
    const activities = await base44.entities.UserActivity.filter({ user_id: userId }, '-activity_date', 100);
    const consecutiveDays = calculateStreak(activities);
    
    if (consecutiveDays >= 7) {
      await checkAndAwardBadge(userId, 'daily_engagement_7');
    }
    if (consecutiveDays >= 30) {
      await checkAndAwardBadge(userId, 'daily_engagement_30');
    }

    // Check total contribution badges
    const totalPoints = activities.reduce((sum, a) => sum + (a.total_points || 0), 0);
    if (totalPoints >= 100) {
      await checkAndAwardBadge(userId, 'helpful_100');
    }
  } catch (error) {
    console.error('Failed to check achievements:', error);
  }
}

function calculateStreak(activities) {
  if (activities.length === 0) return 0;
  
  activities.sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const activity of activities) {
    const activityDate = new Date(activity.activity_date);
    activityDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff > streak) {
      break;
    }
  }
  
  return streak;
}

export { BADGE_DEFINITIONS };