import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verseReference, question, passageText } = await req.json();

    if (!verseReference || !passageText) {
      return Response.json({ error: 'Missing verse reference or passage text' }, { status: 400 });
    }

    const systemPrompt = `You are a biblical scholar and theologian. Provide accurate, accessible theological insights about Bible passages. Include:
- Historical context and cultural background
- Original language meanings (Hebrew/Greek when relevant)
- Theological themes and significance
- Cross-references to related passages
- Practical application for modern life

Keep responses clear and educational, avoiding overly complex jargon.`;

    const userPrompt = question 
      ? `Verse: ${verseReference}\n\nPassage: "${passageText}"\n\nQuestion: ${question}`
      : `Provide theological and historical context for this passage:\n\nVerse: ${verseReference}\n\nPassage: "${passageText}"`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: userPrompt,
      model: 'gpt_4o_mini'
    });

    return Response.json({
      reference: verseReference,
      context: response,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating theological context:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});