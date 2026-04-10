/**
 * generateBibleExplanation — delegates to the unified faithAIEngine
 * Kept for backwards compatibility with existing callers.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { verse_ref, verse_text, language = 'en' } = await req.json();

    if (!verse_ref || !verse_text) {
      return Response.json({ error: 'Missing verse_ref or verse_text' }, { status: 400 });
    }

    const res = await base44.asServiceRole.functions.invoke('faithAIEngine', {
      input: `Explain ${verse_ref}: "${verse_text}"`,
      language,
      feature: 'companion',
    });

    return Response.json({ explanation: res?.response || res });
  } catch (error) {
    console.error('generateBibleExplanation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});