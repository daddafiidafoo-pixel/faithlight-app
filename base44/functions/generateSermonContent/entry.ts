import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const AUDIENCE_CONTEXT = {
  general: 'suitable for all ages and backgrounds in a typical church congregation',
  youth: 'engaging and relevant to teenagers and young adults, using modern examples',
  children: 'simple, story-driven, with clear moral lessons appropriate for children',
  students: 'academically rigorous, theologically sophisticated, for seminary or college students',
  leaders: 'strategic and practical for church leadership, emphasizing decision-making and vision',
};

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

    const { topic, scripture, audience = 'general', tone = 'inspirational', duration = 30 } = await req.json();

    if (!topic || !scripture) {
      return new Response(
        JSON.stringify({ error: 'Missing topic or scripture' }),
        { status: 400 }
      );
    }

    const audienceDesc = AUDIENCE_CONTEXT[audience] || AUDIENCE_CONTEXT.general;
    const toneDesc = TONE_CONTEXT[tone] || TONE_CONTEXT.inspirational;

    const prompt = `Generate a comprehensive sermon outline for the following:

Topic: ${topic}
Scripture Reference: ${scripture}
Duration: ${duration} minutes (approximately ${Math.ceil(duration / 5)} main sections)
Target Audience: ${audienceDesc}
Tone: ${toneDesc}

Structure the sermon in this EXACT JSON format (return only the JSON, no markdown):
{
  "title": "Compelling sermon title",
  "intro": "Opening paragraph that engages the audience and sets context for the scripture",
  "points": [
    {
      "title": "Main Point Title",
      "content": "Detailed explanation of this point with biblical context",
      "examples": "Real-world examples or illustrations relevant to the audience"
    }
  ],
  "application": "Practical ways the congregation should apply these biblical truths to their lives",
  "questions": ["Discussion question 1", "Discussion question 2", "Discussion question 3"],
  "prayer": "Suggested closing prayer that summarizes the sermon's message"
}

Ensure:
- The tone is ${toneDesc}
- The content is ${audienceDesc}
- Each main point has biblical support
- Examples are relevant and relatable
- The sermon flows logically from introduction to application`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          intro: { type: 'string' },
          points: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                examples: { type: 'string' },
              },
            },
          },
          application: { type: 'string' },
          questions: { type: 'array', items: { type: 'string' } },
          prayer: { type: 'string' },
        },
      },
    });

    return new Response(JSON.stringify({ sermon: response }), { status: 200 });
  } catch (error) {
    console.error('Sermon generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});