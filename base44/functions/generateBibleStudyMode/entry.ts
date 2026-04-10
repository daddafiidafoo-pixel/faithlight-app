import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { verse_reference, verse_text, language = 'en' } = await req.json();

    if (!verse_reference || !verse_text) {
      return Response.json({ error: 'verse_reference and verse_text required' }, { status: 400 });
    }

    const prompt = `Provide a deep study guide for this Bible verse in ${language}:

"${verse_reference}: ${verse_text}"

Return a JSON object with:
{
  "simple_explanation": "Explain this verse in simple, everyday language",
  "historical_context": "Brief historical/cultural context (2-3 sentences)",
  "key_words": ["word1", "word2", "word3"],
  "cross_references": ["Reference 1", "Reference 2", "Reference 3"],
  "reflection_questions": ["Question 1?", "Question 2?", "Question 3?"],
  "personalized_prayer": "A short prayer based on meditating on this verse"
}

Make explanations clear and accessible. Focus on transformational insights.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          simple_explanation: { type: 'string' },
          historical_context: { type: 'string' },
          key_words: { type: 'array', items: { type: 'string' } },
          cross_references: { type: 'array', items: { type: 'string' } },
          reflection_questions: { type: 'array', items: { type: 'string' } },
          personalized_prayer: { type: 'string' }
        }
      }
    });

    return Response.json(response);
  } catch (error) {
    console.error('[generateBibleStudyMode] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});