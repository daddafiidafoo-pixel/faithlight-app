import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate AI summary and key takeaways for a course/lesson
 * Customized based on user's spiritual level
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { lesson_id, course_id, user_id } = await req.json();

    if (!lesson_id && !course_id) {
      return Response.json(
        { error: 'lesson_id or course_id required' },
        { status: 400 }
      );
    }

    // Get content and user data
    const [lesson, course, userProgress] = await Promise.all([
      lesson_id
        ? base44.asServiceRole.entities.Lesson.filter({ id: lesson_id }).then(r => r[0])
        : null,
      course_id
        ? base44.asServiceRole.entities.Course.filter({ id: course_id }).then(r => r[0])
        : null,
      user_id
        ? base44.asServiceRole.entities.UserProgress.filter({ user_id }).then(r => r[0])
        : null,
    ]);

    if (!lesson && !course) {
      return Response.json({ error: 'Content not found' }, { status: 404 });
    }

    const content = lesson || course;
    const levelNames = {
      1: 'New Believer',
      2: 'Growing Believer',
      3: 'Mature Believer',
      4: 'Leader/Teacher',
    };

    // Build summary prompt
    const prompt = `
Generate an AI summary and key takeaways for this discipleship content:

**Content:** "${content.title}"
**Description:** ${content.description || 'N/A'}

${userProgress ? `**For:** ${levelNames[userProgress.current_level]}` : ''}

Create a comprehensive summary with:
1. Main thesis (1 sentence)
2. 3-5 key takeaways
3. How this applies to daily life
4. Questions for reflection
5. Related next steps

Format as JSON:
{
  "mainThesis": "string",
  "keyTakeaways": ["point1", "point2", "point3"],
  "dailyApplication": "string",
  "reflectionQuestions": ["q1", "q2", "q3"],
  "nextSteps": ["step1", "step2"]
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          mainThesis: { type: 'string' },
          keyTakeaways: { type: 'array', items: { type: 'string' } },
          dailyApplication: { type: 'string' },
          reflectionQuestions: { type: 'array', items: { type: 'string' } },
          nextSteps: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return Response.json({
      success: true,
      summary: response,
      contentType: lesson ? 'lesson' : 'course',
      contentTitle: content.title,
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    return Response.json(
      { error: 'Failed to generate summary', details: error.message },
      { status: 500 }
    );
  }
});