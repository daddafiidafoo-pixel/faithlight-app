import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Analyze user engagement patterns
 * Recommends friends and discussions, identifies churn risk
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'user_id required' }, { status: 400 });
    }

    // Get user data
    const [userProgress, userInterests, userActivity, allUsers] = await Promise.all([
      base44.asServiceRole.entities.UserProgress.filter({ user_id }),
      base44.asServiceRole.entities.UserInterests.filter({ user_id }),
      base44.asServiceRole.entities.UserActivity.filter({ user_id }, '-created_at', 100),
      base44.asServiceRole.entities.User.filter({}, '-created_at', 200),
    ]);

    const progress = userProgress[0];
    const interests = userInterests[0];

    if (!progress) {
      return Response.json({ error: 'User progress not found' }, { status: 404 });
    }

    // Calculate engagement metrics
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActivity = userActivity.filter(
      a => new Date(a.created_at) > last30Days
    );

    const engagementScore = Math.min(100, Math.floor(
      (recentActivity.length / 30) * 20 + // Activity frequency
      (progress.learning_streak_current / 30) * 40 + // Streak
      (progress.current_level_progress_percent / 100) * 40 // Progress
    ));

    const churnRisk = engagementScore > 70 ? 'low' : engagementScore > 40 ? 'medium' : 'high';

    // Determine most active time (mock analysis)
    const mostActiveTime = recentActivity.length > 0
      ? ['morning', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 4)]
      : 'afternoon';

    // Find similar users for friend recommendations
    const similarUsers = allUsers
      .filter(u => u.id !== user_id)
      .filter(u => {
        const userInterestSet = new Set(interests?.interests || []);
        const otherUserInterests = allUsers.find(au => au.id === u.id);
        // Simple matching logic - in production would be more sophisticated
        return u.current_level === progress.current_level;
      })
      .slice(0, 5)
      .map(u => u.id);

    // Build engagement analysis prompt
    const prompt = `
Analyze this user's engagement and provide insights:

**Metrics:**
- Engagement Score: ${engagementScore}/100
- Recent Activity: ${recentActivity.length} activities in last 30 days
- Learning Streak: ${progress.learning_streak_current} days
- Total Lessons: ${progress.completed_lesson_count}
- Churn Risk: ${churnRisk}

**Interests:**
${interests?.interests?.join(', ') || 'Not specified'}

**Struggles:**
${interests?.struggle_areas?.join(', ') || 'Not specified'}

Provide recommendations in JSON:
{
  "engagementTrend": "improving|stable|declining",
  "churnRiskFactors": ["factor1", "factor2"],
  "reengagementActions": ["action1", "action2", "action3"],
  "nextStepSuggestion": "what should user do next",
  "encouragement": "personalized encouragement message"
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          engagementTrend: { type: 'string' },
          churnRiskFactors: { type: 'array', items: { type: 'string' } },
          reengagementActions: { type: 'array', items: { type: 'string' } },
          nextStepSuggestion: { type: 'string' },
          encouragement: { type: 'string' },
        },
      },
    });

    // Create or update engagement pattern record
    const existingPattern = await base44.asServiceRole.entities.UserEngagementPattern.filter(
      { user_id }
    );

    const patternData = {
      user_id,
      analysis_date: new Date().toISOString(),
      total_lessons_completed: progress.completed_lesson_count,
      avg_lesson_completion_time_mins: 25, // Mock value
      most_active_time: mostActiveTime,
      preferred_content_type: 'mixed',
      engagement_score: engagementScore,
      recommended_friends: similarUsers,
      churn_risk: churnRisk,
      reengagement_actions: response.reengagementActions || [],
    };

    let pattern;
    if (existingPattern.length > 0) {
      await base44.asServiceRole.entities.UserEngagementPattern.update(
        existingPattern[0].id,
        patternData
      );
      pattern = { ...existingPattern[0], ...patternData };
    } else {
      pattern = await base44.asServiceRole.entities.UserEngagementPattern.create(patternData);
    }

    return Response.json({
      success: true,
      pattern,
      insights: response,
    });
  } catch (error) {
    console.error('Engagement analysis error:', error);
    return Response.json(
      { error: 'Failed to analyze engagement', details: error.message },
      { status: 500 }
    );
  }
});