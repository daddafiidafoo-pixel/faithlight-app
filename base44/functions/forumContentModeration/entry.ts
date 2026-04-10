import { base44 } from '@/api/base44Client';

/**
 * Check forum content for inappropriate language using AI
 */
export async function moderateForumContent(contentText, contentId, contentType, authorId, authorName) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderator for a Christian community forum. 
      
Analyze this forum post for inappropriate content:

"${contentText}"

Categories to check for:
1. Profanity or vulgar language
2. Hate speech or discrimination
3. Spam or promotional content
4. Misinformation (especially biblical)
5. Harassment or personal attacks
6. Off-topic content

Respond in JSON format:
{
  "needs_review": boolean,
  "flags": ["flag1", "flag2"],
  "confidence": 0-1,
  "reason": "explanation"
}

If content is fine, set needs_review to false.`,
      response_json_schema: {
        type: 'object',
        properties: {
          needs_review: { type: 'boolean' },
          flags: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' },
          reason: { type: 'string' },
        },
      },
    });

    // Map AI response to moderation flags
    const flagMap = {
      profanity: 'profanity',
      'vulgar language': 'profanity',
      'hate speech': 'hate_speech',
      'discrimination': 'hate_speech',
      spam: 'spam',
      'promotional content': 'spam',
      misinformation: 'misinformation',
      'biblical misinformation': 'misinformation',
      harassment: 'harassment',
      'personal attacks': 'harassment',
      'off-topic': 'off_topic',
    };

    let flagReason = 'other';
    if (response.needs_review && response.flags?.length > 0) {
      const firstFlag = response.flags[0].toLowerCase();
      for (const [key, value] of Object.entries(flagMap)) {
        if (firstFlag.includes(key)) {
          flagReason = value;
          break;
        }
      }
    }

    // Log moderation action
    if (response.needs_review && response.confidence > 0.6) {
      const log = await base44.entities.ModerationLog.create({
        content_id: contentId,
        content_type: contentType,
        author_user_id: authorId,
        author_name: authorName,
        content_text: contentText.substring(0, 500),
        flag_reason: flagReason,
        confidence_score: response.confidence,
        flagged_by: 'ai',
        action_taken: 'reviewed',
      });

      return {
        flagged: true,
        reason: flagReason,
        confidence: response.confidence,
        logId: log.id,
      };
    }

    return {
      flagged: false,
      confidence: 1 - response.confidence,
    };
  } catch (error) {
    console.error('Moderation error:', error);
    return {
      flagged: false,
      error: true,
    };
  }
}

/**
 * Generate summary of long forum thread
 */
export async function generateThreadSummary(topicId, topicTitle, replies) {
  try {
    if (!replies || replies.length < 5) {
      return null;
    }

    const replyTexts = replies
      .slice(0, 30) // Limit to first 30 replies
      .map(r => `${r.author}: "${r.content}"`)
      .join('\n\n');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Summarize this forum discussion thread for a Christian community.

Title: "${topicTitle}"

Discussion:
${replyTexts}

Provide a JSON response with:
1. summary_text: 2-3 sentence summary of main discussion
2. key_points: array of 3-5 key discussion points
3. consensus: one sentence on what was consensus/conclusion (if any)

Focus on theological or practical insights.`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary_text: { type: 'string' },
          key_points: { type: 'array', items: { type: 'string' } },
          consensus: { type: 'string' },
        },
      },
    });

    if (!response) return null;

    // Save summary
    const summary = await base44.entities.ThreadSummary.create({
      topic_id: topicId,
      title: topicTitle,
      summary_text: response.summary_text,
      key_points: response.key_points,
      consensus: response.consensus,
      reply_count_at_summary: replies.length,
      generated_at: new Date().toISOString(),
      generated_by: 'auto',
    });

    return summary;
  } catch (error) {
    console.error('Summary generation error:', error);
    return null;
  }
}