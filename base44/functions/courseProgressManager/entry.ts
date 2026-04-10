import { base44 } from '@/api/base44Client';

/**
 * Get or create user lesson progress record
 */
export async function getOrCreateLessonProgress(userId, lessonId, courseId) {
  try {
    const existing = await base44.entities.UserLessonProgress.filter(
      { user_id: userId, lesson_id: lessonId },
      null,
      1
    );

    if (existing?.length > 0) {
      return existing[0];
    }

    return await base44.entities.UserLessonProgress.create({
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      status: 'not_started',
      progress_percentage: 0,
      started_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting/creating lesson progress:', error);
    return null;
  }
}

/**
 * Mark a lesson as started
 */
export async function startLesson(userId, lessonId, courseId) {
  try {
    const progress = await getOrCreateLessonProgress(userId, lessonId, courseId);
    if (!progress) return null;

    if (progress.status === 'not_started') {
      return await base44.entities.UserLessonProgress.update(progress.id, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      });
    }

    // Update last accessed
    return await base44.entities.UserLessonProgress.update(progress.id, {
      last_accessed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error starting lesson:', error);
    return null;
  }
}

/**
 * Update lesson progress (e.g., video timestamp, section completed)
 */
export async function updateLessonProgress(progressId, position, percentage) {
  try {
    return await base44.entities.UserLessonProgress.update(progressId, {
      last_position: position,
      progress_percentage: percentage,
      last_accessed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return null;
  }
}

/**
 * Mark a lesson as completed
 */
export async function completeLessonProgress(progressId) {
  try {
    return await base44.entities.UserLessonProgress.update(progressId, {
      status: 'completed',
      progress_percentage: 100,
      completed_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    return null;
  }
}

/**
 * Get overall course progress for a user
 */
export async function getCourseProgress(userId, courseId) {
  try {
    // Get or create course progress
    const existing = await base44.entities.UserCourseProgress.filter(
      { user_id: userId, course_id: courseId },
      null,
      1
    );

    let courseProgress = existing?.[0];
    if (!courseProgress) {
      courseProgress = await base44.entities.UserCourseProgress.create({
        user_id: userId,
        course_id: courseId,
        status: 'not_started',
        progress_percentage: 0,
        lessons_completed: 0,
        enrolled_at: new Date().toISOString(),
      });
    }

    // Fetch all lesson progress for this course
    const lessonProgresses = await base44.entities.UserLessonProgress.filter({
      user_id: userId,
      course_id: courseId,
    });

    const completedCount = lessonProgresses.filter((lp) => lp.status === 'completed').length;
    const totalLessons = lessonProgresses.length;
    const percentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    return {
      ...courseProgress,
      lessons_completed: completedCount,
      total_lessons: totalLessons,
      progress_percentage: Math.round(percentage),
    };
  } catch (error) {
    console.error('Error getting course progress:', error);
    return null;
  }
}

/**
 * Update overall course progress based on lesson completion
 */
export async function updateCourseProgress(userId, courseId) {
  try {
    const progress = await getCourseProgress(userId, courseId);

    if (!progress) return null;

    const status =
      progress.progress_percentage === 0
        ? 'not_started'
        : progress.progress_percentage === 100
          ? 'completed'
          : 'in_progress';

    return await base44.entities.UserCourseProgress.update(progress.id, {
      status,
      progress_percentage: progress.progress_percentage,
      lessons_completed: progress.lessons_completed,
      total_lessons: progress.total_lessons,
      started_at: progress.started_at || new Date().toISOString(),
      completed_at: status === 'completed' ? new Date().toISOString() : null,
      last_accessed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating course progress:', error);
    return null;
  }
}

/**
 * Get user's course enrollments with progress
 */
export async function getUserEnrolledCoursesWithProgress(userId) {
  try {
    const progressRecords = await base44.entities.UserCourseProgress.filter({
      user_id: userId,
    });

    return progressRecords || [];
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
}

/**
 * Get all lesson progress for a course
 */
export async function getCourseLessonProgress(userId, courseId) {
  try {
    return await base44.entities.UserLessonProgress.filter({
      user_id: userId,
      course_id: courseId,
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return [];
  }
}