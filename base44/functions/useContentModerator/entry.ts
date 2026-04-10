import { base44 } from '@/api/base44Client';

/**
 * AI-powered content moderation
 */
export async function moderateContent(content, type = 'chat') {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderator for a faith-based service platform.
      
Review this ${type} message and determine if it contains:
- Offensive language or hate speech
- Spam or self-promotion
- Harassment or bullying
- Explicit or sexual content
- Misinformation or false claims

Content: "${content}"

Respond with ONLY a JSON object with this structure:
{
  "isFlagged": boolean,
  "severity": "low" | "medium" | "high",
  "reason": "string explaining why it was flagged (or null if not flagged)",
  "suggestedAction": "review" | "remove" | "warn" | null
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          isFlagged: { type: 'boolean' },
          severity: { type: 'string' },
          reason: { type: 'string' },
          suggestedAction: { type: 'string' },
        },
        required: ['isFlagged', 'severity', 'reason', 'suggestedAction'],
      },
    });

    return response;
  } catch (e) {
    console.error('Moderation error:', e);
    return {
      isFlagged: false,
      severity: null,
      reason: null,
      suggestedAction: null,
    };
  }
}

/**
 * Check content before creating
 */
export async function checkBeforeCreate(content, type = 'chat') {
  const result = await moderateContent(content, type);
  return result;
}