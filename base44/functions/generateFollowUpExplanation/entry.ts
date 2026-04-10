import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { verse_ref, explanation, follow_up_question } = await req.json();

    if (!verse_ref || !explanation || !follow_up_question) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const answer = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this Bible verse explanation, answer the follow-up question.\n\nVerse: ${verse_ref}\nExplanation: ${explanation}\n\nQuestion: ${follow_up_question}`,
      add_context_from_internet: false,
    });

    return Response.json({ answer });
  } catch (error) {
    console.error('Follow-up generation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});