import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { user_id, course_id, milestone_type, progress_percentage } = body;

    if (!user_id || !course_id) {
      return Response.json(
        { error: 'Missing required fields: user_id, course_id' },
        { status: 400 }
      );
    }

    // Fetch user
    const users = await base44.asServiceRole.entities.User.filter({ id: user_id }, '-created_date', 1);
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const user = users[0];

    // Fetch course
    const courses = await base44.asServiceRole.entities.Course.filter({ id: course_id }, '-created_date', 1);
    if (!courses || courses.length === 0) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }
    const course = courses[0];

    // Determine notification content based on milestone type
    let subject, body_content;
    
    if (milestone_type === '25_percent') {
      subject = `📚 You're 25% done with ${course.title}!`;
      body_content = `Great progress! You've completed 25% of "${course.title}". Keep up the momentum!`;
    } else if (milestone_type === '50_percent') {
      subject = `💪 Halfway there! 50% of ${course.title} complete`;
      body_content = `Fantastic! You're halfway through "${course.title}". You're doing amazing!`;
    } else if (milestone_type === '75_percent') {
      subject = `🎯 Almost done! 75% of ${course.title} complete`,
      body_content = `You're on the home stretch! 75% of "${course.title}" is complete. Just a little more!`;
    } else if (milestone_type === 'completed') {
      subject = `🎉 Course Complete! You finished ${course.title}`;
      body_content = `Congratulations! You've successfully completed "${course.title}". Well done on your dedication to learning!`;
    }

    // Send email notification
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: subject,
      body: `
        <h2>${subject}</h2>
        <p>${body_content}</p>
        <p style="margin-top: 20px; color: #666;">
          Keep growing in faith,<br/>
          The FaithLight Team
        </p>
      `,
      from_name: 'FaithLight Learning'
    });

    return Response.json({ 
      success: true, 
      message: `Notification sent to ${user.email}` 
    });
  } catch (error) {
    console.error('[notifyCourseProgress] Error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});