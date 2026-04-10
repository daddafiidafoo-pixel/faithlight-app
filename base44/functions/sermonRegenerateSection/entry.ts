import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * sermonRegenerateSection
 * 
 * Regenerate a specific section (e.g., outline[i], themes) of a sermon
 * 
 * Body:
 * {
 *   sermon_id?: string (optional, for context)
 *   section_type: 'outline' | 'themes' | 'intro' | 'conclusion'
 *   section_index?: number (for array sections like outline)
 *   current_content: string (the section being regenerated)
 *   sermon_topic: string
 *   audience: string (e.g., "beginner", "mixed", "advanced")
 *   sermon_style: string (e.g., "expository", "topical", "narrative")
 * }
 * 
 * Returns: { section_type, content: string }
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
    const {
      section_type,
      section_index,
      current_content,
      sermon_topic,
      audience,
      sermon_style,
    } = body;

    if (!section_type || !current_content || !sermon_topic) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let prompt = '';

    if (section_type === 'outline') {
      prompt = `You are a sermon preparation expert. Regenerate this sermon outline point for clarity and flow.

Current point:
"${current_content}"

Sermon Topic: ${sermon_topic}
Audience Level: ${audience}
Style: ${sermon_style}

Provide a single outline point (1 sentence max, clear and impactful). Output JSON: {"section": "improved point"}`;
    } else if (section_type === 'themes') {
      prompt = `You are a theological guide. Regenerate this key theological theme for depth and clarity.

Current theme:
"${current_content}"

Sermon Topic: ${sermon_topic}
Audience: ${audience}

Provide 1 clear, theologically sound theme. Output JSON: {"section": "theme"}`;
    } else if (section_type === 'intro') {
      prompt = `You are a preaching coach. Regenerate this sermon introduction to hook the audience.

Current intro:
"${current_content}"

Sermon Topic: ${sermon_topic}
Audience: ${audience}
Style: ${sermon_style}

Provide an engaging opening (2-3 sentences). Output JSON: {"section": "intro"}`;
    } else if (section_type === 'conclusion') {
      prompt = `You are a preaching coach. Regenerate this sermon conclusion for impact and call-to-action.

Current conclusion:
"${current_content}"

Sermon Topic: ${sermon_topic}

Provide a powerful closing (2-3 sentences with a call to action). Output JSON: {"section": "conclusion"}`;
    } else {
      return Response.json({ error: 'Unknown section_type' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          section: { type: 'string' },
        },
      },
    });

    return Response.json({
      section_type,
      section_index,
      content: result.section || '',
    });
  } catch (err) {
    console.error('Regenerate section error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});