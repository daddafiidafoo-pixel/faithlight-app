import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ recommendations: [], context_summary: '' });
    }

    // Gather user context in parallel (all with .catch to avoid failures)
    const [readingHistory, savedVerses] = await Promise.all([
      base44.entities.ReadingHistory.filter({ user_id: user.id }, '-reading_date', 15).catch(() => []),
      base44.entities.SavedVerse.filter({ user_id: user.id }, '-created_date', 10).catch(() => []),
    ]);

    const recentBooks = [...new Set(readingHistory.map(r => r.book).filter(Boolean))].slice(0, 6).join(', ') || 'None yet';
    const savedBooks = [...new Set(savedVerses.map(s => s.book).filter(Boolean))].slice(0, 5).join(', ') || 'None yet';
    const spiritualLevel = user.spiritual_level || 1;
    const levelLabel = ['', 'New to faith', 'Growing', 'Deep study', 'Leadership'][spiritualLevel] || 'Growing';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Bible study assistant. Generate 4 personalized Bible study recommendations for this user.

User: spiritual level ${spiritualLevel}/4 (${levelLabel}), recently read: ${recentBooks}, saved verses from: ${savedBooks}.

Return JSON with exactly this shape:
{
  "context_summary": "one short sentence about the user's reading pattern",
  "recommendations": [
    { "type": "verse", "title": "short title", "reference": "Book X:Y", "description": "1-2 sentences", "reason": "why recommended", "book": "BookName", "chapter": 1 },
    { "type": "topic", "title": "short title", "reference": "", "description": "1-2 sentences", "reason": "why recommended", "book": "", "chapter": 0 },
    { "type": "theme", "title": "short title", "reference": "Book X:Y", "description": "1-2 sentences", "reason": "why recommended", "book": "BookName", "chapter": 1 },
    { "type": "study_plan", "title": "short title", "reference": "", "description": "1-2 sentences", "reason": "why recommended", "book": "", "chapter": 0 }
  ]
}

Keep each field short. Return ONLY valid JSON, no extra text.`,
      response_json_schema: {
        type: 'object',
        properties: {
          context_summary: { type: 'string' },
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                title: { type: 'string' },
                reference: { type: 'string' },
                description: { type: 'string' },
                reason: { type: 'string' },
                book: { type: 'string' },
                chapter: { type: 'number' }
              }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('[getBibleRecommendations] Error:', error.message);
    // Return empty gracefully instead of 500
    return Response.json({ recommendations: [], context_summary: '' });
  }
});