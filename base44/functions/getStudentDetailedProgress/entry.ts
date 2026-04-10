import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, course_id } = await req.json();

    if (!user_id || !course_id) {
      return Response.json(
        { error: 'user_id and course_id required' },
        { status: 400 }
      );
    }

    const user = await base44.auth.me();
    if (!user || !['teacher', 'admin'].includes(user.user_role)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get student info
    const students = await base44.entities.User.filter(
      { id: user_id },
      null,
      1
    );
    const student = students[0];

    // Get course progress
    const courseProgress = await base44.entities.UserCourseProgress.filter(
      { user_id, course_id },
      null,
      1
    );

    // Get lesson progress
    const lessonProgress = await base44.entities.UserLessonProgress.filter(
      { user_id, course_id },
      null,
      200
    );

    // Get all lessons for this course
    const lessons = await base44.entities.Lesson.filter(
      { course_id },
      null,
      200
    );

    // Build detailed progress by lesson
    const lessonBreakdown = lessons.map((lesson) => {
      const progress = lessonProgress.find((p) => p.lesson_id === lesson.id);
      return {
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        status: progress?.status || 'not_started',
        progress_percentage: progress?.progress_percentage || 0,
        time_spent_minutes: progress ? Math.round((progress.time_spent_seconds || 0) / 60) : 0,
        started_at: progress?.started_at,
        completed_at: progress?.completed_at,
      };
    });

    // Get quiz scores if available
    const quizAttempts = await base44.entities.QuizAttempt.filter(
      { user_id },
      '-created_date',
      100
    );

    // Filter quiz attempts for lessons in this course
    const courseQuizAttempts = quizAttempts.filter((qa) => {
      const lesson = lessons.find((l) => l.id === qa.lesson_id);
      return lesson !== undefined;
    });

    const quizPerformance = courseQuizAttempts.map((qa) => ({
      lesson_id: qa.lesson_id,
      quiz_id: qa.id,
      score: qa.score,
      max_score: qa.max_score,
      percentage: qa.max_score > 0
        ? Math.round((qa.score / qa.max_score) * 100)
        : 0,
      attempt_date: qa.created_date,
    }));

    return Response.json({
      student: {
        id: student?.id,
        name: student?.full_name,
        email: student?.email,
      },
      course_progress: courseProgress[0] || {
        status: 'not_started',
        progress_percentage: 0,
      },
      lesson_breakdown: lessonBreakdown,
      quiz_performance: quizPerformance,
      summary: {
        total_lessons: lessons.length,
        completed_lessons: lessonBreakdown.filter(
          (l) => l.status === 'completed'
        ).length,
        avg_progress: Math.round(
          lessonBreakdown.reduce(
            (sum, l) => sum + l.progress_percentage,
            0
          ) / lessons.length
        ),
        total_time_minutes: Math.round(
          lessonBreakdown.reduce(
            (sum, l) => sum + l.time_spent_minutes,
            0
          )
        ),
        avg_quiz_score: quizPerformance.length > 0
          ? Math.round(
              quizPerformance.reduce(
                (sum, q) => sum + q.percentage,
                0
              ) / quizPerformance.length
            )
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch student progress' },
      { status: 500 }
    );
  }
});