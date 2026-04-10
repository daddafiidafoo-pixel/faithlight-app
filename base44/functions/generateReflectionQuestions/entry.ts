import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { contentType = 'study', bookRef = '', focusArea = '', daysCompleted = 0 } = await req.json();

    const prompt = `Generate 5 thoughtful reflection questions for ${contentType === 'study' ? 'Bible study' : 'audio listening'}.

${bookRef ? `Scripture/Content: ${bookRef}` : ''}
${focusArea ? `Focus Area: ${focusArea}` : ''}
${daysCompleted > 0 ? `Progress: User has completed ${daysCompleted} days of study` : ''}

Create open-ended reflection questions that encourage:
- Deep personal contemplation
- Practical life application
- Theological understanding
- Spiritual growth

Return as JSON:
{
  "questions": [
    {
      "question": "Reflection question text",
      "category": "personal_growth|biblical_understanding|application|spiritual_insight",
      "prompts": ["Follow-up prompt 1", "Follow-up prompt 2"]
    }
  ]
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                category: { type: 'string' },
                prompts: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    });

    return new Response(JSON.stringify({ reflectionQuestions: response }), { status: 200 });
  } catch (error) {
    console.error('Reflection questions generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});