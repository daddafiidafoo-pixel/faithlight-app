import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { course_id, user_id } = await req.json();

    if (!course_id || !user_id) {
      return Response.json(
        { error: 'course_id and user_id required' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get course details
    const courses = await base44.entities.Course.filter(
      { id: course_id },
      null,
      1
    );
    if (!courses.length) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }
    const course = courses[0];

    // Check if user already has a certificate for this course
    const existingCerts = await base44.entities.AwardedCertificate.filter(
      { course_id, user_id },
      null,
      1
    );

    if (existingCerts.length > 0) {
      return Response.json(
        { message: 'Certificate already awarded', certificate: existingCerts[0] },
        { status: 200 }
      );
    }

    // Get user details
    const userDetails = await base44.auth.me();

    // Generate certificate number (unique ID)
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Generate verification code for verified certificates
    const verificationCode = Math.random().toString(36).substr(2, 8).toUpperCase();

    // Determine certificate tier based on course
    let certificateTier = 'foundation';
    if (course.difficulty === 'advanced') {
      certificateTier = 'theological';
    } else if (course.difficulty === 'intermediate') {
      certificateTier = 'leadership';
    }

    // Create certificate record
    const certificateData = {
      course_id,
      user_id,
      student_name: userDetails.full_name || 'Student',
      certificate_number: certificateNumber,
      certificate_tier: certificateTier,
      certificate_type: 'basic', // Default to basic, can be upgraded to verified
      program_name: course.title,
      verification_code: verificationCode,
      status: 'earned',
      is_paid: false,
      payment_status: 'completed',
      progress_percentage: 100,
      awarded_at: new Date().toISOString(),
      instructor_name: course.instructor_name || 'FaithLight Academy',
    };

    const certificate = await base44.entities.AwardedCertificate.create(
      certificateData
    );

    // Log the award
    console.log(`Certificate awarded: ${certificateNumber} to user ${user_id}`);

    return Response.json({
      message: 'Certificate awarded successfully',
      certificate,
    });
  } catch (error) {
    console.error('Error awarding certificate:', error);
    return Response.json(
      { error: error.message || 'Failed to award certificate' },
      { status: 500 }
    );
  }
});