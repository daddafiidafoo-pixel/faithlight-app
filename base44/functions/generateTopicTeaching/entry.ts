import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { topic, language = 'en', tab = 'topics' } = await req.json();

    // Validate input
    if (!topic || !topic.trim()) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    const topicTrimmed = topic.trim();
    
    // Language names for prompt
    const langNames = {
      en: 'English',
      om: 'Afaan Oromoo',
      am: 'Amharic',
      ar: 'Arabic',
      sw: 'Swahili',
      fr: 'French'
    };
    
    const langName = langNames[language] || 'English';

    // Generate teaching content via LLM
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a biblical teaching assistant for FaithLight. Create a brief, Scripture-grounded teaching on a biblical topic.

CRITICAL: You MUST respond ENTIRELY in ${langName}. Every single word must be in ${langName} only.

Topic: ${topicTrimmed}

Generate a teaching that includes:
1. Clear title (2-4 words)
2. Brief explanation (2-3 sentences, warm and accessible)
3. Three related Bible verses with references
4. A short personal prayer (2-3 sentences)

Format as JSON with these exact fields:
- title: The teaching title
- explanation: The explanation text
- verses: Array of 3 verse references (e.g., ["John 3:16", "Romans 10:17"])
- prayer: A prayer related to this topic

IMPORTANT: All text must be in ${langName}.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          explanation: { type: 'string' },
          verses: {
            type: 'array',
            items: { type: 'string' }
          },
          prayer: { type: 'string' }
        },
        required: ['title', 'explanation', 'verses', 'prayer']
      }
    });

    return Response.json({
      topic: topicTrimmed,
      language,
      title: result.title,
      explanation: result.explanation,
      verses: result.verses,
      prayer: result.prayer
    });
  } catch (error) {
    console.error('generateTopicTeaching error:', error.message || error);
    return Response.json(
      { error: 'Failed to generate teaching' },
      { status: 500 }
    );
  }
});