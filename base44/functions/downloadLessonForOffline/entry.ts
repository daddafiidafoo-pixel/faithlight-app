import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Download single lesson with all materials for offline access
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, lesson_id } = await req.json();

    if (!user_id || !lesson_id) {
      return Response.json({ error: 'user_id and lesson_id required' }, { status: 400 });
    }

    // Verify entities exist
    if (!base44.asServiceRole.entities.Lesson) {
      return Response.json({ error: 'Lesson system not initialized' }, { status: 500 });
    }

    // Get lesson details
    const lessons = await base44.asServiceRole.entities.Lesson.filter(
      { id: lesson_id }
    );

    if (!lessons || lessons.length === 0) {
      return Response.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const lesson = lessons[0];

    // Get course for context
    const courses = await base44.asServiceRole.entities.Course.filter(
      { id: lesson.course_id }
    );
    const course = courses[0];

    // Get lesson materials (videos, PDFs, etc.)
    const materials = await base44.asServiceRole.entities.CourseMaterial.filter(
      { lesson_id: lesson_id }
    );

    // Get quiz if exists
    const quizzes = await base44.asServiceRole.entities.Quiz.filter(
      { lesson_id: lesson_id }
    );

    const quiz = quizzes[0] || null;

    // Get quiz questions if quiz exists
    let quizQuestions = [];
    if (quiz) {
      quizQuestions = await base44.asServiceRole.entities.QuizQuestion.filter(
        { quiz_id: quiz.id }
      );
    }

    // Get user's lesson progress
    const lessonProgress = await base44.asServiceRole.entities.UserLessonProgress.filter(
      { user_id, lesson_id }
    );

    const estimatedSize = JSON.stringify({
      lesson,
      materials,
      quiz,
      quizQuestions,
    }).length;

    // Create offline library record
    const offlineRecord = await base44.asServiceRole.entities.OfflineLibrary.create({
      user_id,
      content_type: 'lesson',
      content_id: lesson_id,
      content_title: lesson.title,
      file_size_bytes: estimatedSize,
      is_pinned: false,
    });

    // Award points
    await base44.asServiceRole.entities.GamificationEvent.create({
      user_id,
      event_type: 'offline_download',
      points_awarded: 5,
      related_id: lesson_id,
      metadata: { content_type: 'lesson', title: lesson.title },
    });

    return Response.json({
      success: true,
      offline_record: offlineRecord,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        duration_minutes: lesson.duration_minutes,
        position: lesson.position,
      },
      course: {
        id: course.id,
        title: course.title,
        level: course.level,
      },
      materials: materials.map(m => ({
        id: m.id,
        title: m.title,
        type: m.material_type,
        url: m.file_url,
      })),
      quiz: quiz ? {
        id: quiz.id,
        title: quiz.title,
        questions: quizQuestions,
      } : null,
      user_progress: lessonProgress[0] || null,
      estimated_size_bytes: estimatedSize,
      download_timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Lesson download error:', error);
    return Response.json(
      { error: 'Failed to download lesson', details: error.message },
      { status: 500 }
    );
  }
});