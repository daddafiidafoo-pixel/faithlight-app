import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['teacher', 'pastor', 'admin'].includes(user.user_role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action, courseId } = await req.json();

    if (action === 'get_course_analytics') {
      // Get course details
      const course = await base44.entities.Course.filter(
        { id: courseId },
        '-created_date',
        1
      );

      if (!course.length) {
        return Response.json({ error: 'Course not found' }, { status: 404 });
      }

      // Get enrollment stats
      const enrollments = await base44.entities.UserCourseProgress.filter(
        { course_id: courseId }
      );

      const completedCount = enrollments.filter(e => e.status === 'completed').length;
      const inProgressCount = enrollments.filter(e => e.status === 'in_progress').length;
      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
        : 0;

      // Get lesson performance
      const lessons = await base44.entities.Lesson.filter(
        { course_id: courseId }
      );

      const lessonStats = await Promise.all(
        lessons.map(async (lesson) => {
          const lessonProgress = await base44.entities.UserLessonProgress.filter(
            { lesson_id: lesson.id }
          );

          const completedLessons = lessonProgress.filter(l => l.status === 'completed').length;
          const completionRate = lessonProgress.length > 0
            ? Math.round((completedLessons / lessonProgress.length) * 100)
            : 0;

          const avgTimeSpent = lessonProgress.length > 0
            ? Math.round(lessonProgress.reduce((sum, l) => sum + (l.time_spent_seconds || 0), 0) / lessonProgress.length)
            : 0;

          return {
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            completion_rate: completionRate,
            avg_time_spent_seconds: avgTimeSpent,
            total_attempts: lessonProgress.length,
            is_low_performing: completionRate < 50,
          };
        })
      );

      // Get reviews
      const reviews = await base44.entities.CourseReview.filter(
        { course_id: courseId, status: 'approved' }
      );

      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      };

      // Get student progress details
      const topStudents = enrollments
        .sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0))
        .slice(0, 5)
        .map(e => ({
          user_id: e.user_id,
          progress_percentage: e.progress_percentage,
          status: e.status,
          enrolled_at: e.enrolled_at,
        }));

      return Response.json({
        course: course[0],
        enrollment: {
          total: enrollments.length,
          completed: completedCount,
          in_progress: inProgressCount,
          not_started: enrollments.length - completedCount - inProgressCount,
          avg_progress: avgProgress,
        },
        lessons: lessonStats,
        low_performing_lessons: lessonStats.filter(l => l.is_low_performing),
        reviews: {
          total: reviews.length,
          avg_rating: avgRating,
          distribution: ratingDistribution,
        },
        top_students: topStudents,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});