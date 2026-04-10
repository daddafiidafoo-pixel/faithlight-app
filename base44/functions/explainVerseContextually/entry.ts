import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { reference, verseText, translation = 'en' } = body;

    if (!reference || !verseText) {
      return Response.json(
        { error: 'reference and verseText are required' },
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);

    // Generate all 5 layers in parallel using the LLM
    const prompt = `You are a Christian spiritual guide helping users understand Scripture deeply.

Verse: ${reference}
Text: "${verseText}"

Provide a comprehensive spiritual understanding with EXACTLY these 5 sections:

1. EXPLANATION (2-3 sentences): Plain, clear meaning of what this verse says.

2. CONTEXT (2-3 sentences): Historical, cultural, or biblical context. Where does this verse fit in the story? What was happening?

3. THEME (1 short phrase): The central spiritual theme or principle.

4. LIFE_APPLICATION (2-3 sentences): How does this verse apply to a believer's life today? Practical takeaway.

5. PRAYER (1-2 sentences): A short, heartfelt prayer based on the verse.

Format your response as JSON (no markdown, just raw JSON):
{
  "explanation": "...",
  "context": "...",
  "theme": "...",
  "lifeApplication": "...",
  "prayer": "..."
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          explanation: { type: 'string' },
          context: { type: 'string' },
          theme: { type: 'string' },
          lifeApplication: { type: 'string' },
          prayer: { type: 'string' }
        },
        required: ['explanation', 'context', 'theme', 'lifeApplication', 'prayer']
      }
    });

    return Response.json({
      reference,
      verseText,
      ...result
    });
  } catch (error) {
    console.error('Error in explainVerseContextually:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});