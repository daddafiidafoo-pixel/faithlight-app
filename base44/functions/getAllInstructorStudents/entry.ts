import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['teacher', 'admin'].includes(user.user_role)) {
      return Response.json(
        { error: 'Unauthorized - instructor access required' },
        { status: 403 }
      );
    }

    // Get all instructor's courses
    const instructorCourses = await base44.entities.Course.filter(
      { instructor_id: user.id },
      null,
      200
    );

    if (!instructorCourses.length) {
      return Response.json({ students: [] });
    }

    // Get all enrollments for these courses
    const courseIds = instructorCourses.map((c) => c.id);
    const allEnrollments = await Promise.all(
      courseIds.map((courseId) =>
        base44.entities.UserCourseProgress.filter(
          { course_id: courseId },
          null,
          1000
        )
      )
    );

    // Flatten and deduplicate by user_id
    const uniqueStudents = new Map();
    allEnrollments.forEach((enrollments, courseIdx) => {
      enrollments.forEach((enrollment) => {
        if (!uniqueStudents.has(enrollment.user_id)) {
          uniqueStudents.set(enrollment.user_id, {
            user_id: enrollment.user_id,
            courses: [],
            progress_data: [],
          });
        }
        uniqueStudents.get(enrollment.user_id).courses.push(courseIds[courseIdx]);
        uniqueStudents.get(enrollment.user_id).progress_data.push({
          course_id: courseIds[courseIdx],
          course_title: instructorCourses[courseIdx].title,
          progress_percentage: enrollment.progress_percentage || 0,
          status: enrollment.status,
          enrolled_at: enrollment.enrolled_at,
        });
      });
    });

    // Get user details for all students
    const studentDetailsPromises = Array.from(uniqueStudents.keys()).map(
      (userId) =>
        base44.entities.User.filter({ id: userId }, null, 1)
          .then((users) => ({
            user_id: userId,
            full_name: users[0]?.full_name || 'Unknown',
            email: users[0]?.email || 'Unknown',
          }))
          .catch(() => ({
            user_id: userId,
            full_name: 'Unknown',
            email: 'Unknown',
          }))
    );

    const studentDetails = await Promise.all(studentDetailsPromises);

    // Combine student info with progress
    const studentsWithDetails = studentDetails.map((details) => {
      const studentData = uniqueStudents.get(details.user_id);
      const avgProgress =
        studentData.progress_data.length > 0
          ? Math.round(
              studentData.progress_data.reduce(
                (sum, p) => sum + p.progress_percentage,
                0
              ) / studentData.progress_data.length
            )
          : 0;

      return {
        ...details,
        courses_enrolled: studentData.courses.length,
        avg_progress: avgProgress,
        course_details: studentData.progress_data,
      };
    });

    return Response.json({
      students: studentsWithDetails,
      total_unique_students: studentsWithDetails.length,
      total_courses: courseIds.length,
    });
  } catch (error) {
    console.error('Error fetching instructor students:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
});