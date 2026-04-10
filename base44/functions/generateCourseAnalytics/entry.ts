import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { course_id } = await req.json();

    if (!course_id) {
      return Response.json(
        { error: 'course_id required' },
        { status: 400 }
      );
    }

    const user = await base44.auth.me();
    if (!user || !['teacher', 'admin'].includes(user.user_role)) {
      return Response.json(
        { error: 'Unauthorized - instructor access required' },
        { status: 403 }
      );
    }

    // Get all course progress records
    const courseProgressList = await base44.entities.UserCourseProgress.filter(
      { course_id },
      null,
      1000
    );

    // Get all lesson progress records for this course
    const lessonProgressList = await base44.entities.UserLessonProgress.filter(
      { course_id },
      null,
      5000
    );

    // Get course details
    const courses = await base44.entities.Course.filter(
      { id: course_id },
      null,
      1
    );
    const course = courses[0];

    // Calculate aggregate metrics
    const totalEnrolled = courseProgressList.length;
    const completed = courseProgressList.filter(
      (p) => p.status === 'completed'
    ).length;
    const inProgress = courseProgressList.filter(
      (p) => p.status === 'in_progress'
    ).length;
    const notStarted = courseProgressList.filter(
      (p) => p.status === 'not_started'
    ).length;

    const completionRate = totalEnrolled > 0
      ? Math.round((completed / totalEnrolled) * 100)
      : 0;

    const avgProgress = totalEnrolled > 0
      ? Math.round(
          courseProgressList.reduce(
            (sum, p) => sum + (p.progress_percentage || 0),
            0
          ) / totalEnrolled
        )
      : 0;

    const avgTimeSpent = lessonProgressList.length > 0
      ? Math.round(
          lessonProgressList.reduce(
            (sum, p) => sum + (p.time_spent_seconds || 0),
            0
          ) / lessonProgressList.length
        )
      : 0;

    // Get lesson completion breakdown
    const lessons = await base44.entities.Lesson.filter(
      { course_id },
      null,
      200
    );

    const lessonStats = lessons.map((lesson) => {
      const progressForLesson = lessonProgressList.filter(
        (p) => p.lesson_id === lesson.id
      );
      const completed = progressForLesson.filter(
        (p) => p.status === 'completed'
      ).length;

      return {
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        total_students: totalEnrolled,
        completed: completed,
        completion_rate: totalEnrolled > 0
          ? Math.round((completed / totalEnrolled) * 100)
          : 0,
        avg_time_minutes: progressForLesson.length > 0
          ? Math.round(
              progressForLesson.reduce(
                (sum, p) => sum + (p.time_spent_seconds || 0),
                0
              ) / progressForLesson.length / 60
            )
          : 0,
      };
    });

    // Get student-level analytics
    const studentAnalytics = courseProgressList.map((progress) => {
      const studentLessons = lessonProgressList.filter(
        (p) => p.user_id === progress.user_id
      );
      const avgLessonProgress = studentLessons.length > 0
        ? Math.round(
            studentLessons.reduce(
              (sum, p) => sum + (p.progress_percentage || 0),
              0
            ) / studentLessons.length
          )
        : 0;

      const totalTimeMinutes = Math.round(
        studentLessons.reduce(
          (sum, p) => sum + (p.time_spent_seconds || 0),
          0
        ) / 60
      );

      return {
        user_id: progress.user_id,
        status: progress.status,
        progress_percentage: progress.progress_percentage || 0,
        lessons_completed: progress.lessons_completed || 0,
        total_lessons: progress.total_lessons || lessons.length,
        enrolled_at: progress.enrolled_at,
        last_accessed: progress.last_accessed_at,
        avg_lesson_progress: avgLessonProgress,
        total_time_minutes: totalTimeMinutes,
      };
    });

    const analytics = {
      course_id,
      course_title: course?.title,
      timestamp: new Date().toISOString(),
      summary: {
        total_enrolled: totalEnrolled,
        completed,
        in_progress: inProgress,
        not_started: notStarted,
        completion_rate: completionRate,
        avg_progress: avgProgress,
        avg_time_spent_minutes: Math.round(avgTimeSpent / 60),
      },
      lesson_statistics: lessonStats,
      student_analytics: studentAnalytics,
      struggling_students: studentAnalytics
        .filter((s) => s.progress_percentage < 30 && s.status !== 'completed')
        .sort((a, b) => a.progress_percentage - b.progress_percentage),
      at_risk_students: studentAnalytics
        .filter((s) => s.progress_percentage < 60 && s.progress_percentage >= 30 && s.status !== 'completed')
        .sort((a, b) => a.progress_percentage - b.progress_percentage),
    };

    return Response.json(analytics);
  } catch (error) {
    console.error('Error generating course analytics:', error);
    return Response.json(
      { error: error.message || 'Failed to generate analytics' },
      { status: 500 }
    );
  }
});