import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const { verse_reference, verse_text, language = 'en' } = await req.json();

    if (!verse_reference || !verse_text) {
      return Response.json({ error: 'Missing verse_reference or verse_text' }, { status: 400 });
    }

    // Generate explanation using AI
    const prompt = `You are a Bible scholar. Provide a detailed explanation for the following verse in JSON format with three sections:

Verse: ${verse_reference}
Text: "${verse_text}"

Return a JSON object with these exact keys:
1. "historical_context" - Brief historical and cultural background (2-3 sentences)
2. "theological_insight" - The theological meaning and spiritual significance (3-4 sentences)
3. "practical_application" - How believers can apply this today (2-3 sentences)

Respond in ${language === 'om' ? 'Afaan Oromoo' : language === 'am' ? 'Amharic' : 'English'}.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          historical_context: { type: 'string' },
          theological_insight: { type: 'string' },
          practical_application: { type: 'string' },
        },
        required: ['historical_context', 'theological_insight', 'practical_application'],
      },
    });

    // Save explanation if user is authenticated
    if (user?.id) {
      await base44.entities.VerseExplanation.create({
        user_id: user.id,
        verse_reference,
        verse_text,
        historical_context: response.historical_context,
        theological_insight: response.theological_insight,
        practical_application: response.practical_application,
        language,
      });
    }

    return Response.json(response);
  } catch (error) {
    console.error('Verse explanation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});