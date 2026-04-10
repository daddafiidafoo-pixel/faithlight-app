import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate personalized course/lesson recommendations
 * Uses user progress, interests, and engagement patterns
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { user_id } = body;

    if (!user_id) {
      return Response.json({ success: true, recommendations: [], generatedAt: new Date().toISOString() });
    }

    // Get user data in parallel
    const [userProgress, userInterests, engagementPattern] = await Promise.all([
      base44.asServiceRole.entities.UserProgress.filter({ user_id }),
      base44.asServiceRole.entities.UserInterests.filter({ user_id }),
      base44.asServiceRole.entities.UserEngagementPattern.filter({ user_id }),
    ]);

    const progress = userProgress[0];
    const interests = userInterests[0];
    const engagement = engagementPattern[0];

    if (!progress) {
      return Response.json({ success: true, recommendations: [], generatedAt: new Date().toISOString() });
    }

    // Get all courses and lessons
    const [courses, lessons, userCourseProgress] = await Promise.all([
      base44.asServiceRole.entities.Course.filter({ is_published: true }, '-created_at', 50),
      base44.asServiceRole.entities.Lesson.filter({}, '-created_at', 100),
      base44.asServiceRole.entities.UserCourseProgress.filter({ user_id }),
    ]);

    const completedCourseIds = userCourseProgress.map(c => c.course_id);

    // Build recommendation prompt
    const prompt = `
You are an AI discipleship mentor. Generate personalized course recommendations for a user with the following profile:

**Spiritual Profile:**
- Current Level: ${progress.current_level} (on scale 1-4)
- Progress: ${progress.current_level_progress_percent}% through current level
- Lessons Completed: ${progress.completed_lesson_count}
- Learning Streak: ${progress.learning_streak_current} days

**User Interests:**
${interests ? `- Topics: ${interests.interests?.join(', ') || 'Not specified'}
- Focus Area: ${interests.spiritual_focus}
- Learning Style: ${interests.preferred_learning_style}
- Struggle Areas: ${interests.struggle_areas?.join(', ') || 'None noted'}` : '- No interests specified yet'}

**Engagement Pattern:**
${engagement ? `- Engagement Score: ${engagement.engagement_score}/100
- Most Active Time: ${engagement.most_active_time}
- Preferred Content: ${engagement.preferred_content_type}
- Churn Risk: ${engagement.churn_risk}` : '- Not analyzed yet'}

**Available Courses:**
${courses.map((c, i) => `${i + 1}. "${c.title}" (Level ${c.level}, ${c.duration_hours}h)`).join('\n')}

Based on this profile, recommend the top 3-5 courses that would best serve this user's discipleship journey. For each recommendation:
1. Course title
2. Why it's recommended specifically for this user
3. How it addresses their interests/struggles
4. Expected impact on their spiritual growth

Format as JSON array with objects: { title, reason, alignment, expectedImpact, level, estimatedHours }`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                reason: { type: 'string' },
                alignment: { type: 'string' },
                expectedImpact: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json({
      success: true,
      recommendations: response.recommendations || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recommendation generation error:', error);
    return Response.json({ success: true, recommendations: [], generatedAt: new Date().toISOString() });
  }
});