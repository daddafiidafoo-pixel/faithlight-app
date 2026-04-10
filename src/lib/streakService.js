// Streak and XP tracking service
import { base44 } from '@/api/base44Client';

export const BADGE_DEFINITIONS = {
  first_read: { name: 'First Read', description: 'Read first verse' },
  week_streak: { name: 'One Week', description: '7 day reading streak' },
  month_streak: { name: 'One Month', description: '30 day reading streak' },
  level_5: { name: 'Devoted', description: 'Reach Level 5' },
  level_10: { name: 'Scripture Master', description: 'Reach Level 10' },
  prayer_warrior: { name: 'Prayer Warrior', description: 'Pray for 10 requests' },
};

export async function updateUserStreak(userEmail) {
  try {
    const streaks = await base44.entities.UserStreak.filter({ user_email: userEmail });
    let streak = streaks[0];

    if (!streak) {
      // Create new streak entry
      streak = await base44.entities.UserStreak.create({
        user_email: userEmail,
        current_streak: 1,
        longest_streak: 1,
        last_read_date: new Date().toISOString().split('T')[0],
        total_xp: 10,
        level: 1,
        badges: ['first_read'],
      });
      return streak;
    }

    const today = new Date().toISOString().split('T')[0];
    const lastRead = streak.last_read_date;
    const isToday = lastRead === today;

    if (isToday) {
      // Already read today
      return streak;
    }

    // Check if streak continues
    const lastDate = new Date(lastRead);
    const today_date = new Date(today);
    const diffTime = today_date - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = {
      last_read_date: today,
      total_xp: streak.total_xp + 10,
    };

    if (diffDays === 1) {
      // Streak continues
      newStreak.current_streak = streak.current_streak + 1;
      newStreak.longest_streak = Math.max(streak.longest_streak, newStreak.current_streak);
    } else {
      // Streak broken
      newStreak.current_streak = 1;
    }

    // Check for level up (100 XP per level)
    const newLevel = Math.floor(newStreak.total_xp / 100) + 1;
    if (newLevel > streak.level) {
      newStreak.level = newLevel;
    }

    // Award badges
    const badges = [...(streak.badges || [])];
    if (newStreak.current_streak === 7 && !badges.includes('week_streak')) {
      badges.push('week_streak');
    }
    if (newStreak.current_streak === 30 && !badges.includes('month_streak')) {
      badges.push('month_streak');
    }
    if (newStreak.level === 5 && !badges.includes('level_5')) {
      badges.push('level_5');
    }
    if (newStreak.level === 10 && !badges.includes('level_10')) {
      badges.push('level_10');
    }

    newStreak.badges = badges;

    // Update streak
    const updated = await base44.entities.UserStreak.update(streak.id, newStreak);
    return updated;
  } catch (error) {
    console.error('Failed to update streak:', error);
    throw error;
  }
}

export async function addXP(userEmail, amount) {
  try {
    const streaks = await base44.entities.UserStreak.filter({ user_email: userEmail });
    if (!streaks[0]) return;

    const streak = streaks[0];
    const newXP = streak.total_xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;

    await base44.entities.UserStreak.update(streak.id, {
      total_xp: newXP,
      level: Math.max(newLevel, streak.level),
    });
  } catch (error) {
    console.error('Failed to add XP:', error);
  }
}

export async function getStreakData(userEmail, streakType) {
  try {
    const streaks = await base44.entities.UserStreak.filter({ user_email: userEmail });
    const streak = streaks[0] || {
      current_streak: 0,
      longest_streak: 0,
      total_xp: 0,
      level: 1,
      badges: [],
      points_earned: 0,
      total_days_completed: 0,
    };
    return {
      streak,
      milestones: streak.badges || [],
    };
  } catch (error) {
    console.error('Failed to get streak data:', error);
    return { streak: null, milestones: [] };
  }
}

export async function updateDailyStreak(userEmail, streakType) {
  try {
    const streaks = await base44.entities.UserStreak.filter({ user_email: userEmail });
    const streak = streaks[0];

    if (!streak) {
      const newStreak = await base44.entities.UserStreak.create({
        user_email: userEmail,
        current_streak: 1,
        longest_streak: 1,
        last_read_date: new Date().toISOString().split('T')[0],
        total_xp: 10,
        level: 1,
        badges: [],
      });
      return { alreadyRecorded: false, milestone: null, streak: newStreak };
    }

    const today = new Date().toISOString().split('T')[0];
    if (streak.last_read_date === today) {
      return { alreadyRecorded: true, milestone: null, streak };
    }

    const newData = {
      last_read_date: today,
      total_xp: streak.total_xp + 10,
    };

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (streak.last_read_date === yesterday) {
      newData.current_streak = streak.current_streak + 1;
      newData.longest_streak = Math.max(streak.longest_streak, newData.current_streak);
    } else {
      newData.current_streak = 1;
    }

    const newLevel = Math.floor(newData.total_xp / 100) + 1;
    newData.level = newLevel;

    const badges = streak.badges || [];
    let milestone = null;

    if (newData.current_streak === 7 && !badges.includes('week_streak')) {
      badges.push('week_streak');
      milestone = { name: 'One Week Streak', points: 50 };
    }
    if (newData.current_streak === 30 && !badges.includes('month_streak')) {
      badges.push('month_streak');
      milestone = { name: 'One Month Streak', points: 200 };
    }

    newData.badges = badges;
    const updated = await base44.entities.UserStreak.update(streak.id, newData);
    return { alreadyRecorded: false, milestone, streak: updated };
  } catch (error) {
    console.error('Failed to update daily streak:', error);
    throw error;
  }
}