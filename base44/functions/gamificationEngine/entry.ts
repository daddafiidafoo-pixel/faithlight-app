import { base44 } from '@/api/base44Client';

const POINTS = {
  LESSON_COMPLETED: 10,
  QUIZ_COMPLETED: 25,
  QUIZ_PERFECT_SCORE: 50,
  COURSE_COMPLETED: 100,
};

const BADGE_DEFINITIONS = [
  // Learning Badges
  { id: 'first_lesson', name: 'First Step', icon: '🎯', category: 'learning', requirement: 'lessons_completed:1' },
  { id: 'lesson_master', name: 'Lesson Master', icon: '📚', category: 'learning', requirement: 'lessons_completed:10' },
  { id: 'course_graduate', name: 'Graduate', icon: '🎓', category: 'learning', requirement: 'courses_completed:1' },
  { id: 'multi_course', name: 'Scholar', icon: '👨‍🎓', category: 'learning', requirement: 'courses_completed:3' },
  
  // Quiz Badges
  { id: 'quiz_taker', name: 'Quiz Taker', icon: '✏️', category: 'achievement', requirement: 'quizzes_completed:1' },
  { id: 'perfect_score', name: 'Perfect Score', icon: '💯', category: 'achievement', requirement: 'perfect_score:1' },
  { id: 'quiz_master', name: 'Quiz Master', icon: '🧠', category: 'achievement', requirement: 'quizzes_completed:10' },
  
  // Consistency Badges
  { id: 'eager_learner', name: 'Eager Learner', icon: '⚡', category: 'consistency', requirement: 'streak_days:3' },
  { id: 'dedicated', name: 'Dedicated', icon: '🔥', category: 'consistency', requirement: 'streak_days:7' },
  { id: 'unstoppable', name: 'Unstoppable', icon: '💪', category: 'consistency', requirement: 'streak_days:30' },
  
  // Points Badges
  { id: 'rising_star', name: 'Rising Star', icon: '⭐', category: 'social', requirement: 'total_points:250' },
  { id: 'superstar', name: 'Superstar', icon: '🌟', category: 'social', requirement: 'total_points:1000' },
];

/**
 * Award points for completing a lesson
 */
export async function awardLessonPoints(userId, userName) {
  try {
    let userPoints = await getUserPoints(userId);
    
    if (!userPoints) {
      userPoints = await base44.entities.UserPoints.create({
        user_id: userId,
        user_name: userName,
        total_points: POINTS.LESSON_COMPLETED,
        points_from_lessons: POINTS.LESSON_COMPLETED,
        lessons_completed: 1,
        last_activity_date: new Date().toISOString(),
      });
    } else {
      userPoints = await base44.entities.UserPoints.update(userPoints.id, {
        total_points: (userPoints.total_points || 0) + POINTS.LESSON_COMPLETED,
        points_from_lessons: (userPoints.points_from_lessons || 0) + POINTS.LESSON_COMPLETED,
        lessons_completed: (userPoints.lessons_completed || 0) + 1,
        last_activity_date: new Date().toISOString(),
      });
    }

    // Check for earned badges
    await checkAndAwardBadges(userId, userName, userPoints);
    
    return { points: POINTS.LESSON_COMPLETED, userPoints };
  } catch (error) {
    console.error('Error awarding lesson points:', error);
    return { points: 0, error };
  }
}

/**
 * Award points for completing a quiz
 */
export async function awardQuizPoints(userId, userName, isPerfectScore = false) {
  try {
    let userPoints = await getUserPoints(userId);
    const pointsEarned = isPerfectScore ? POINTS.QUIZ_COMPLETED + POINTS.QUIZ_PERFECT_SCORE : POINTS.QUIZ_COMPLETED;
    
    if (!userPoints) {
      userPoints = await base44.entities.UserPoints.create({
        user_id: userId,
        user_name: userName,
        total_points: pointsEarned,
        points_from_quizzes: pointsEarned,
        quizzes_completed: 1,
        last_activity_date: new Date().toISOString(),
      });
    } else {
      userPoints = await base44.entities.UserPoints.update(userPoints.id, {
        total_points: (userPoints.total_points || 0) + pointsEarned,
        points_from_quizzes: (userPoints.points_from_quizzes || 0) + pointsEarned,
        quizzes_completed: (userPoints.quizzes_completed || 0) + 1,
        last_activity_date: new Date().toISOString(),
      });
    }

    // Check for earned badges
    await checkAndAwardBadges(userId, userName, userPoints);
    
    return { points: pointsEarned, userPoints };
  } catch (error) {
    console.error('Error awarding quiz points:', error);
    return { points: 0, error };
  }
}

/**
 * Award points for completing a course
 */
export async function awardCoursePoints(userId, userName) {
  try {
    let userPoints = await getUserPoints(userId);
    
    if (!userPoints) {
      userPoints = await base44.entities.UserPoints.create({
        user_id: userId,
        user_name: userName,
        total_points: POINTS.COURSE_COMPLETED,
        points_from_courses: POINTS.COURSE_COMPLETED,
        courses_completed: 1,
        last_activity_date: new Date().toISOString(),
      });
    } else {
      userPoints = await base44.entities.UserPoints.update(userPoints.id, {
        total_points: (userPoints.total_points || 0) + POINTS.COURSE_COMPLETED,
        points_from_courses: (userPoints.points_from_courses || 0) + POINTS.COURSE_COMPLETED,
        courses_completed: (userPoints.courses_completed || 0) + 1,
        last_activity_date: new Date().toISOString(),
      });
    }

    // Check for earned badges
    await checkAndAwardBadges(userId, userName, userPoints);
    
    return { points: POINTS.COURSE_COMPLETED, userPoints };
  } catch (error) {
    console.error('Error awarding course points:', error);
    return { points: 0, error };
  }
}

/**
 * Get user's current points
 */
export async function getUserPoints(userId) {
  try {
    const points = await base44.entities.UserPoints.filter({ user_id: userId });
    return points[0] || null;
  } catch (error) {
    console.error('Error fetching user points:', error);
    return null;
  }
}

/**
 * Check and award badges based on user progress
 */
async function checkAndAwardBadges(userId, userName, userPoints) {
  try {
    // Get user's current achievements
    const existingBadges = await base44.entities.UserAchievement.filter({ user_id: userId });
    const earnedBadgeIds = new Set(existingBadges.map(b => b.badge_id));

    for (const badge of BADGE_DEFINITIONS) {
      // Skip if already earned
      if (earnedBadgeIds.has(badge.id)) continue;

      const shouldEarn = checkBadgeRequirement(badge.requirement, userPoints);
      
      if (shouldEarn) {
        // Award the badge
        await base44.entities.UserAchievement.create({
          user_id: userId,
          badge_id: badge.id,
          badge_name: badge.name,
          points_earned: 0, // Can be customized per badge
          earned_at: new Date().toISOString(),
        });

        // Update user points with badge bonus
        const badgeBonus = 10; // Bonus points for earning a badge
        userPoints = await base44.entities.UserPoints.update(userPoints.id, {
          total_points: (userPoints.total_points || 0) + badgeBonus,
          points_from_badges: (userPoints.points_from_badges || 0) + badgeBonus,
        });
      }
    }
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
  }
}

/**
 * Check if badge requirement is met
 */
function checkBadgeRequirement(requirement, userPoints) {
  const [type, value] = requirement.split(':');
  const numValue = parseInt(value);

  switch (type) {
    case 'lessons_completed':
      return (userPoints.lessons_completed || 0) >= numValue;
    case 'quizzes_completed':
      return (userPoints.quizzes_completed || 0) >= numValue;
    case 'courses_completed':
      return (userPoints.courses_completed || 0) >= numValue;
    case 'perfect_score':
      return (userPoints.perfect_scores || 0) >= numValue;
    case 'streak_days':
      return (userPoints.current_streak || 0) >= numValue;
    case 'total_points':
      return (userPoints.total_points || 0) >= numValue;
    default:
      return false;
  }
}

/**
 * Update user's learning streak
 */
export async function updateLearningStreak(userId) {
  try {
    let userPoints = await getUserPoints(userId);
    
    if (!userPoints) return;

    const lastActivity = userPoints.last_activity_date ? new Date(userPoints.last_activity_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newStreak = userPoints.current_streak || 0;

    if (lastActivity) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      lastActivity.setHours(0, 0, 0, 0);

      if (lastActivity.getTime() === today.getTime()) {
        // Already completed today, no streak update
        return;
      } else if (lastActivity.getTime() === yesterday.getTime()) {
        // Continuing streak
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, userPoints.longest_streak || 0);

    await base44.entities.UserPoints.update(userPoints.id, {
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today.toISOString(),
    });
  } catch (error) {
    console.error('Error updating learning streak:', error);
  }
}

/**
 * Get badge definitions
 */
export function getBadgeDefinitions() {
  return BADGE_DEFINITIONS;
}

/**
 * Get points config
 */
export function getPointsConfig() {
  return POINTS;
}