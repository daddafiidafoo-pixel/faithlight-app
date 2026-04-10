import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Generate biblical sermon illustrations for a given topic and audience
 * Ensures illustrations are culturally appropriate and biblically sound
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      topic, // e.g., "faith", "courage", "forgiveness"
      audience = 'general', // e.g., "youth", "seniors", "families", "general"
      count = 3,
      userLanguage = 'en'
    } = await req.json();

    if (!topic || count < 1 || count > 5) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const languageMap = {
      'om': 'Afaan Oromoo',
      'sw': 'Swahili',
      'ar': 'Arabic',
      'am': 'Amharic',
      'en': 'English',
    };

    const language = languageMap[userLanguage] || 'English';

    const prompt = `Generate ${count} biblical sermon illustrations about "${topic}" for a ${audience} audience.

Language: ${language}

For EACH illustration, provide:

Illustration [NUMBER]: [Title]
Scripture Foundation: [Bible verse(s) that support this illustration]
Story: [2-3 sentence illustration or analogy that's relatable and clear]
Teaching Point: [1 sentence what this illustration teaches about ${topic}]
Application: [1-2 sentences how listeners can apply this]
Cultural Note: [1 sentence noting cultural adaptability/appropriateness]

Requirements:
- Base each illustration on actual Scripture
- Make illustrations relevant to a ${audience} audience
- Use real-world examples (parables, nature, everyday life)
- Ensure each is culturally respectful and globally appropriate
- Keep language simple and memorable
- Include a teaching point that connects clearly to the topic
- Do NOT invent Bible stories or verses

Examples of good sermon illustrations use:
- Real people's testimonies
- Nature and creation
- Parables Jesus taught
- Historical biblical examples
- Everyday objects with spiritual lessons
- Cultural observations that fit the audience`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
    });

    return Response.json({
      success: true,
      illustrations: {
        topic,
        audience,
        language,
        count,
        content: response,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating illustrations:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});