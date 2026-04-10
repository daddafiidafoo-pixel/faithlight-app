import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin only
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { report, content, reportedUser, moderationStatus, moderationHistory } = await req.json();

    if (!report) {
      return Response.json({ error: 'report is required' }, { status: 400 });
    }

    const historyText = (moderationHistory || []).length > 0
      ? moderationHistory.map(h => `- ${h.type || h.action} on ${h.date || h.created_date}: ${h.reason || h.note || ''}`).join('\n')
      : 'No prior moderation history.';

    const contentText = content
      ? `Title: ${content.title || '(none)'}\nBody: ${content.body || content.comment_text || '(no text)'}`
      : '(Content unavailable — may have already been removed)';

    const prompt = `You are a moderation assistant for FaithLight, a Christian Bible study community app.

COMMUNITY GUIDELINES (what you enforce):
1. Be respectful: no harassment, bullying, hate, threats, or targeted insults.
2. Keep it safe: no encouragement of dangerous activities, self-harm, or violence.
3. Protect minors: no sexual content involving minors or exploitation.
4. No spam or scams: no phishing, misleading links, repetitive promotions, or fraud.
5. No illegal activity: no content enabling illegal wrongdoing.
6. Respect privacy: don't share personal info (addresses, phone numbers, IDs).
7. Stay constructive: no trolling, brigading, or derailing discussions.
8. Report responsibly: false or malicious reports may lead to action.

AVAILABLE ACTIONS (choose exactly one):
- REMOVE_CONTENT: Remove the post/comment but do not punish the user further
- WARN_USER: Issue a formal warning and optionally remove content
- SUSPEND_USER: Temporary suspension for repeated or severe violations
- DISMISS_REPORT: No violation found; dismiss the report
- NEEDS_HUMAN_REVIEW: Unclear case; flag for senior review

REPORT DETAILS:
- Reason: ${report.reason || 'other'}
- Reporter notes: ${report.details || 'None'}
- Content type: ${report.target_type || 'unknown'}

REPORTED CONTENT:
${contentText}

REPORTED USER STATUS:
- Current status: ${moderationStatus?.status || 'none'}
- Warnings count: ${moderationStatus?.warnings || 0}
- User ID: ${reportedUser?.id || report.target_owner_user_id || 'unknown'}

MODERATION HISTORY:
${historyText}

INSTRUCTIONS:
- Be conservative: if unsure, choose DISMISS_REPORT or NEEDS_HUMAN_REVIEW
- Never invent facts; base reasoning only on provided info
- Draft user-facing messages that are respectful and non-shaming
- Keep draft messages under 100 words each
- Produce a confidence score between 0.0 and 1.0

Respond with a valid JSON object (no markdown):
{
  "suggestedAction": "WARN_USER",
  "confidence": 0.82,
  "rationale": "...",
  "draftWarning": "Hi, we noticed your recent post...",
  "draftRemovalNotice": "We removed your content because...",
  "historySummary": "User has received 1 warning in the past 30 days..."
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestedAction: { type: 'string' },
          confidence: { type: 'number' },
          rationale: { type: 'string' },
          draftWarning: { type: 'string' },
          draftRemovalNotice: { type: 'string' },
          historySummary: { type: 'string' },
        },
        required: ['suggestedAction', 'confidence', 'rationale'],
      },
    });

    return Response.json(result);
  } catch (err) {
    console.error('aiModerationAssist error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});