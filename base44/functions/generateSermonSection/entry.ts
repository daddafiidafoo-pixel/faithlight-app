import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TONE_CONTEXT = {
  inspirational: 'uplifting and motivational, designed to encourage and strengthen faith',
  instructional: 'educational and clear, focusing on understanding biblical truths and doctrine',
  apologetic: 'thoughtful and reasoned, addressing skepticism and defending Christian faith',
  devotional: 'intimate and reflective, inviting personal spiritual contemplation',
  prophetic: 'challenging and convicting, calling to repentance and transformation',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { topic, scripture, audience, tone = 'inspirational', sectionId, currentOutline } = await req.json();

    if (!sectionId || !currentOutline) {
      return new Response(
        JSON.stringify({ error: 'Missing sectionId or currentOutline' }),
        { status: 400 }
      );
    }

    const toneDesc = TONE_CONTEXT[tone] || TONE_CONTEXT.inspirational;

    let prompt = '';

    if (sectionId === 'title') {
      prompt = `Generate a compelling sermon title for:
Topic: ${topic}
Scripture: ${scripture}
Tone: ${toneDesc}

Return ONLY the title text, no quotes or formatting.`;
    } else if (sectionId === 'intro') {
      prompt = `Generate a compelling introduction paragraph for a sermon on:
Topic: ${topic}
Scripture: ${scripture}
Tone: ${toneDesc}
Target Audience: ${audience}

The introduction should:
- Engage the audience immediately
- Set context for the scripture
- Be ${toneDesc}

Return ONLY the introduction paragraph.`;
    } else if (sectionId.startsWith('point_')) {
      const pointIndex = parseInt(sectionId.split('_')[1]);
      const currentPoint = currentOutline.points?.[pointIndex];

      prompt = `Regenerate this sermon point with a different approach:

Current Point Title: ${currentPoint?.title}
Topic: ${topic}
Scripture: ${scripture}
Tone: ${toneDesc}

Return a JSON object:
{
  "title": "New point title",
  "content": "Detailed explanation with biblical support",
  "examples": "Real-world examples"
}`;
    } else if (sectionId === 'application') {
      prompt = `Generate practical application suggestions for a sermon on:
Topic: ${topic}
Scripture: ${scripture}
Tone: ${toneDesc}
Target Audience: ${audience}

The application should:
- Be specific and actionable
- Connect scripture to daily life
- Be relevant to ${audience}

Return ONLY the application text.`;
    } else if (sectionId === 'questions') {
      prompt = `Generate 3 thoughtful discussion questions for a sermon on:
Topic: ${topic}
Scripture: ${scripture}
Tone: ${toneDesc}

Questions should encourage reflection and application.

Return a JSON array of 3 strings: ["question 1", "question 2", "question 3"]`;
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Invalid section ID' }),
        { status: 400 }
      );
    }

    const isJsonSection = ['point_', 'questions'].some(s => sectionId.includes(s));

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: isJsonSection ? {
        type: 'object',
        properties: {
          ...(sectionId.startsWith('point_') && {
            title: { type: 'string' },
            content: { type: 'string' },
            examples: { type: 'string' },
          }),
          ...(sectionId === 'questions' && {
            questions: { type: 'array', items: { type: 'string' } },
          }),
        },
      } : undefined,
    });

    return new Response(JSON.stringify({ [sectionId]: response }), { status: 200 });
  } catch (error) {
    console.error('Sermon section generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});