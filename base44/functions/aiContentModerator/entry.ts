import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered content moderation
 * Screens posts/messages for violations and flags for review
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { content, content_type, content_id, user_id, author_name } = await req.json();

    if (!content) {
      return Response.json({ error: 'content required' }, { status: 400 });
    }

    // Call LLM for content analysis
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a community guidelines moderator. Analyze this ${content_type} for violations:

"${content}"

Check for:
- Hate speech, discrimination
- Spam or promotional content
- Misinformation or false claims
- Harassment or bullying
- Inappropriate content
- Off-topic disruption

Provide JSON response with:
{
  "is_violation": boolean,
  "violation_types": ["type1", "type2"],
  "confidence": 0-1,
  "severity": "low|medium|high|critical",
  "explanation": "why this is a violation",
  "should_auto_flag": boolean,
  "suggested_action": "remove|hide|warn_user|review"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          is_violation: { type: 'boolean' },
          violation_types: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' },
          severity: { type: 'string' },
          explanation: { type: 'string' },
          should_auto_flag: { type: 'boolean' },
          suggested_action: { type: 'string' },
        },
      },
    });

    // If violation detected, create flag record
    if (response.is_violation && response.should_auto_flag) {
      const flaggedContent = await base44.asServiceRole.entities.FlaggedContent.create({
        content_type,
        content_id,
        content_preview: content.substring(0, 500),
        author_id: user_id,
        author_name,
        flagging_method: 'ai_filter',
        ai_confidence: response.confidence,
        ai_categories: response.violation_types,
        priority: response.severity === 'critical' ? 'critical' : response.severity === 'high' ? 'high' : 'medium',
      });

      // Create moderation action record
      const moderationAction = await base44.asServiceRole.entities.ModerationAction.create({
        user_id,
        user_name: author_name,
        content_type,
        content_id,
        violation_category: response.violation_types[0] || 'other',
        severity: response.severity,
        ai_flagged: true,
        reason: response.explanation,
        status: 'flagged',
      });

      // Notify user about potential violation
      if (response.severity === 'critical') {
        // Auto-action for critical violations
        await base44.asServiceRole.entities.ModerationAction.update(moderationAction.id, {
          action_taken: 'content_removed',
          status: 'actioned',
        });
      }

      return Response.json({
        success: true,
        is_violation: true,
        flagged: true,
        flagged_content_id: flaggedContent.id,
        moderation_action_id: moderationAction.id,
        ...response,
      });
    }

    return Response.json({
      success: true,
      is_violation: response.is_violation,
      flagged: false,
      confidence: response.confidence,
      severity: response.severity,
    });
  } catch (error) {
    console.error('Content moderation error:', error);
    return Response.json(
      { error: 'Failed to moderate content', details: error.message },
      { status: 500 }
    );
  }
});