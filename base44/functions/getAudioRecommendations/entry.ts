import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Fetch user's listening history
    const listeningHistory = await base44.entities.UserAudioProgress.filter(
      { user_id: user.email },
      '-updated_date',
      20
    );

    // Fetch current study plan
    const studyPlans = await base44.entities.StudyPlan.filter(
      { user_id: user.email, status: 'active' },
      '-created_date',
      1
    );

    // Fetch available Bible books
    const bibleBooks = await base44.entities.BibleBook.list('-order', 20);

    const listeningBooks = listeningHistory
      .map(h => h.book)
      .filter(Boolean);

    const studyBooks = studyPlans
      .flatMap(p => p.plan_items || [])
      .map(item => item.book)
      .filter(Boolean);

    const prompt = `Based on user listening and study patterns, recommend 8 Bible audio chapters.

User listening history (books):
${listeningBooks.join(', ') || 'No history yet'}

Current study plan includes:
${studyBooks.join(', ') || 'No active plan'}

Available books:
${bibleBooks.map(b => b.name).slice(0, 20).join(', ')}

Provide recommendations in this JSON format:
{
  "recommendations": [
    {
      "book": "Book name",
      "chapter": 1,
      "reason": "listening_history|study_plan_alignment|progression_level|similar_content",
      "confidence": 85
    }
  ]
}

Consider:
- Related books (if user listens to John, recommend 1 John)
- Study plan alignment
- Logical progression through Bible
- User's learning level

Return exactly 8 recommendations.`;

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
                book: { type: 'string' },
                chapter: { type: 'number' },
                reason: { type: 'string' },
                confidence: { type: 'number' },
              },
            },
          },
        },
      },
    });

    // Save recommendations to database
    const recommendationsToSave = (response.recommendations || []).map(rec => ({
      user_id: user.email,
      audio_book: rec.book,
      audio_chapter: rec.chapter,
      reason: rec.reason,
      confidence_score: rec.confidence,
    }));

    if (recommendationsToSave.length > 0) {
      await base44.entities.AudioRecommendation.bulkCreate(recommendationsToSave);
    }

    return new Response(JSON.stringify({ recommendations: response.recommendations }), { status: 200 });
  } catch (error) {
    console.error('Audio recommendations error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});