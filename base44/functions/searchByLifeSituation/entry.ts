import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { situation = 'faith', language = 'en' } = await req.json();

    const prompt = `Find Bible verses that address the life situation: "${situation}"

Return a JSON object with:
{
  "situation": "${situation}",
  "theme_explanation": "Why these verses are relevant to ${situation}",
  "verses": [
    { "reference": "Book Chapter:Verse", "text": "verse text" },
    { "reference": "Book Chapter:Verse", "text": "verse text" },
    { "reference": "Book Chapter:Verse", "text": "verse text" }
  ],
  "suggested_prayer": "A prayer for someone facing this situation"
}

Find verses that are most relevant and comforting. Include a mix of encouragement, wisdom, and hope. Language: ${language}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          situation: { type: 'string' },
          theme_explanation: { type: 'string' },
          verses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                reference: { type: 'string' },
                text: { type: 'string' }
              }
            }
          },
          suggested_prayer: { type: 'string' }
        }
      }
    });

    return Response.json(response);
  } catch (error) {
    console.error('[searchByLifeSituation] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});