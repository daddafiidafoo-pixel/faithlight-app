import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Download entire course with all lessons for offline access
 * Returns course data, lessons, and metadata for local storage
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, course_id } = await req.json();

    if (!user_id || !course_id) {
      return Response.json({ error: 'user_id and course_id required' }, { status: 400 });
    }

    // Verify Course entity exists
    if (!base44.asServiceRole.entities.Course) {
      return Response.json({ error: 'Course system not initialized' }, { status: 500 });
    }

    // Get course details
    const courses = await base44.asServiceRole.entities.Course.filter(
      { id: course_id },
      '-created_at',
      1
    );

    if (!courses || courses.length === 0) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    const course = courses[0];

    // Get all lessons in course
    if (!base44.asServiceRole.entities.Lesson) {
      return Response.json({ error: 'Lesson system not initialized' }, { status: 500 });
    }

    const lessons = await base44.asServiceRole.entities.Lesson.filter(
      { course_id: course_id },
      'position'
    ) || [];

    // Get user's progress on this course
    const userCourseProgress = await base44.asServiceRole.entities.UserCourseProgress.filter(
      { user_id, course_id }
    );

    const progress = userCourseProgress[0] || {};

    // Get lesson materials (content, quizzes, etc.)
    const lessonDetails = await Promise.all(
      lessons.map(async (lesson) => {
        const materials = await base44.asServiceRole.entities.CourseMaterial.filter(
          { lesson_id: lesson.id }
        );
        return { ...lesson, materials };
      })
    );

    // Calculate total size (estimate based on content)
    const estimatedSize = JSON.stringify(lessonDetails).length + course.duration_hours * 1000000; // Rough estimate

    // Create offline library record
    const offlineRecord = await base44.asServiceRole.entities.OfflineLibrary.create({
      user_id,
      content_type: 'course',
      content_id: course_id,
      content_title: course.title,
      file_size_bytes: estimatedSize,
      is_pinned: false,
    });

    // Log the download
    await base44.asServiceRole.entities.GamificationEvent.create({
      user_id,
      event_type: 'offline_download',
      points_awarded: 10,
      related_id: course_id,
      metadata: { content_type: 'course', title: course.title },
    });

    return Response.json({
      success: true,
      offline_record: offlineRecord,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        duration_hours: course.duration_hours,
        level: course.level,
      },
      lessons: lessonDetails.map(l => ({
        id: l.id,
        title: l.title,
        position: l.position,
        duration_minutes: l.duration_minutes,
        materials: l.materials,
      })),
      user_progress: progress,
      estimated_size_bytes: estimatedSize,
      download_timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Course download error:', error);
    return Response.json(
      { error: 'Failed to download course', details: error.message },
      { status: 500 }
    );
  }
});