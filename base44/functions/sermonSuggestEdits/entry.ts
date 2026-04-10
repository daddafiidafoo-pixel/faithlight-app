import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * sermonSuggestEdits
 * 
 * AI-powered suggestions for clarity, flow, and theological depth
 * 
 * Body:
 * {
 *   sermon_id?: string (optional)
 *   content: string (the section to review)
 *   review_type: 'clarity' | 'flow' | 'theology' | 'all'
 *   sermon_topic?: string
 *   audience?: string
 * }
 * 
 * Returns: { suggestions: [{area, issue, suggestion}] }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'POST only' }, { status: 405 });
    }

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, review_type = 'all', sermon_topic, audience } = body;

    if (!content) {
      return Response.json({ error: 'Missing content' }, { status: 400 });
    }

    let prompt = '';

    if (review_type === 'clarity') {
      prompt = `You are a clarity expert. Review this sermon text for clarity and simplicity.

Text:
"${content}"

Identify 1-3 areas that could be clearer. For each, suggest a specific improvement.
Output JSON: {"suggestions": [{"area": "area name", "issue": "what's unclear", "suggestion": "how to improve"}]}`;
    } else if (review_type === 'flow') {
      prompt = `You are a rhetorical flow expert. Review this sermon text for transitions, pacing, and logical flow.

Text:
"${content}"

Identify 1-3 areas where flow could improve. For each, suggest how to strengthen connections.
Output JSON: {"suggestions": [{"area": "flow", "issue": "description", "suggestion": "fix"}]}`;
    } else if (review_type === 'theology') {
      prompt = `You are a theological consultant. Review this sermon text for theological depth, accuracy, and biblical grounding.

Text:
"${content}"

Identify 1-3 areas where theology could deepen or strengthen. Suggest specific biblical references or theological insights.
Output JSON: {"suggestions": [{"area": "theology", "issue": "observation", "suggestion": "enhance with"}]}`;
    } else if (review_type === 'all') {
      prompt = `You are a sermon review expert. Review this sermon text across clarity, flow, and theology.

Text:
"${content}"

For each area (clarity, flow, theology), identify 1-2 top suggestions for improvement.
Output JSON: {"suggestions": [{"area": "clarity|flow|theology", "issue": "observation", "suggestion": "specific fix"}]}`;
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area: { type: 'string' },
                issue: { type: 'string' },
                suggestion: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json({
      suggestions: result.suggestions || [],
    });
  } catch (err) {
    console.error('Suggest edits error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});