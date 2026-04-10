import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate AI summary of forum discussion
 * Helps instructors understand key points and identify gaps
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { forum_topic_id, course_id, instructor_id } = await req.json();

    if (!forum_topic_id) {
      return Response.json({ error: 'forum_topic_id required' }, { status: 400 });
    }

    // Get forum topic and all replies
    const topicRecords = await base44.asServiceRole.entities.CourseForumTopic.filter(
      { id: forum_topic_id }
    );

    if (topicRecords.length === 0) {
      return Response.json({ error: 'Topic not found' }, { status: 404 });
    }

    const topic = topicRecords[0];

    const replies = await base44.asServiceRole.entities.CourseForumReply.filter(
      { topic_id: forum_topic_id },
      'created_at'
    );

    // Build discussion text
    const discussionText = `
Topic: ${topic.title}
Initial Post: ${topic.content}

Replies:
${replies.map((r, i) => `${i + 1}. ${r.content}`).join('\n')}`;

    // Call LLM for analysis
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this course discussion forum thread and provide a comprehensive summary:

${discussionText}

Generate a JSON response with:
{
  "summary": "2-3 sentence summary of the discussion",
  "key_points": ["point1", "point2", "point3"],
  "sentiment_score": -1 to 1 (overall tone),
  "unanswered_questions": ["question1", "question2"],
  "action_items": ["action1", "action2"],
  "insights": "pedagogical insights for instructor"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_points: { type: 'array', items: { type: 'string' } },
          sentiment_score: { type: 'number' },
          unanswered_questions: { type: 'array', items: { type: 'string' } },
          action_items: { type: 'array', items: { type: 'string' } },
          insights: { type: 'string' },
        },
      },
    });

    // Create summary record
    const summary = await base44.asServiceRole.entities.DiscussionSummary.create({
      forum_topic_id,
      course_id,
      instructor_id: instructor_id || '',
      summary: response.summary,
      key_points: response.key_points,
      participants_count: new Set(replies.map(r => r.user_id)).size + 1,
      sentiment_score: response.sentiment_score,
      unanswered_questions: response.unanswered_questions,
      action_items: response.action_items,
    });

    return Response.json({
      success: true,
      summary,
      analysis: response,
    });
  } catch (error) {
    console.error('Discussion summary error:', error);
    return Response.json(
      { error: 'Failed to generate summary', details: error.message },
      { status: 500 }
    );
  }
});