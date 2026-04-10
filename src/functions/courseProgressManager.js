// Stub: course progress manager used by MyEnrolledCourses
import { base44 } from '@/api/base44Client';

export async function getUserEnrolledCoursesWithProgress(userId) {
  try {
    const enrollments = await base44.entities.CourseEnrollment.filter({ user_id: userId });
    return enrollments.map((e) => ({
      ...e,
      progress_percentage: e.progress_percentage || 0,
      lessons_completed: e.lessons_completed || 0,
      total_lessons: e.total_lessons || 0,
      status: e.status || 'not_started',
    }));
  } catch {
    return [];
  }
}

export async function getCourseLessonProgress(userId, courseId) {
  try {
    return await base44.entities.UserLessonProgress.filter({ user_id: userId, course_id: courseId });
  } catch {
    return [];
  }
}