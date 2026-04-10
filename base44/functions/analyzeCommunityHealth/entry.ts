import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Analyze community health metrics
 * Sentiment analysis, violation trends, engagement metrics
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { course_id } = await req.json();

    // Get recent posts and messages
    const [posts, messages, flaggedContent, users] = await Promise.all([
      base44.asServiceRole.entities.CommunityPost.filter({}, '-created_at', 100),
      base44.asServiceRole.entities.ChatMessage.filter({}, '-created_at', 100),
      base44.asServiceRole.entities.FlaggedContent.filter({}, '-created_at', 50),
      base44.asServiceRole.entities.User.filter({}, '-created_at', 500),
    ]);

    const allContent = [
      ...posts.map(p => ({ text: p.content, type: 'post' })),
      ...messages.map(m => ({ text: m.content, type: 'message' })),
    ];

    if (allContent.length === 0) {
      return Response.json({
        success: true,
        health_score: 100,
        message: 'Not enough data for analysis',
      });
    }

    // Analyze with LLM
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze community health based on these recent posts/messages:

${allContent.slice(0, 20).map(c => c.text).join('\n---\n')}

Key metrics to analyze:
- Overall sentiment (positive, neutral, negative)
- Dominant discussion topics
- Potential toxicity or guideline violations
- Engagement quality
- Constructive vs non-constructive content

Return JSON:
{
  "avg_sentiment": -1 to 1,
  "sentiment_distribution": {"positive": %, "neutral": %, "negative": %},
  "top_topics": ["topic1", "topic2", "topic3"],
  "violation_rate": 0-100,
  "engagement_quality": "low|medium|high",
  "health_assessment": "healthy|concerning|critical",
  "recommendations": ["rec1", "rec2"]
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          avg_sentiment: { type: 'number' },
          sentiment_distribution: {
            type: 'object',
            properties: {
              positive: { type: 'number' },
              neutral: { type: 'number' },
              negative: { type: 'number' },
            },
          },
          top_topics: { type: 'array', items: { type: 'string' } },
          violation_rate: { type: 'number' },
          engagement_quality: { type: 'string' },
          health_assessment: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Calculate health score
    const violationPenalty = response.violation_rate;
    const sentimentBoost = (response.avg_sentiment + 1) / 2 * 30; // -1 to 1 -> 0-30
    const engagementBoost = response.engagement_quality === 'high' ? 30 : response.engagement_quality === 'medium' ? 15 : 0;
    const healthScore = Math.max(0, Math.min(100, 100 - violationPenalty + sentimentBoost + engagementBoost - 35));

    // Create metrics record
    const metrics = await base44.asServiceRole.entities.CommunityHealthMetrics.create({
      metric_date: new Date().toISOString().split('T')[0],
      course_id: course_id || '',
      total_posts: posts.length,
      total_messages: messages.length,
      flagged_count: flaggedContent.length,
      avg_sentiment_score: response.avg_sentiment,
      engagement_rate: (allContent.length / Math.max(users.length, 1)) * 100,
      violation_rate: response.violation_rate,
      top_topics: response.top_topics.map((topic, i) => ({
        topic,
        frequency: Math.floor((20 - i) / 20 * 100),
        sentiment: response.avg_sentiment,
      })),
      health_score: Math.round(healthScore),
    });

    return Response.json({
      success: true,
      metrics,
      analysis: response,
      health_score: Math.round(healthScore),
    });
  } catch (error) {
    console.error('Community health analysis error:', error);
    return Response.json(
      { error: 'Failed to analyze community health', details: error.message },
      { status: 500 }
    );
  }
});