import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { passages, theme, themes, audience, duration_minutes, tone, style } = await req.json();

    if (!theme) {
      return Response.json({ error: 'Theme is required' }, { status: 400 });
    }

    const audienceLabels = {
      general: 'a general congregation',
      youth: 'youth and teenagers',
      leaders: 'church leaders and pastors',
      beginners: 'new believers / seekers',
      mature: 'mature believers',
    };

    const styleLabels = {
      three_point:  'classic 3-point sermon',
      expository:   'expository verse-by-verse',
      narrative:    'narrative / story-based',
      topical:      'topical (multi-passage)',
      apologetics:  'apologetics / defending the faith',
    };

    const lengthGuide = duration_minutes <= 12 ? 'short (4 sections)' : duration_minutes <= 25 ? 'medium (5 sections)' : 'long (6–7 sections)';

    const toneLabels = {
      teaching: 'instructional and educational',
      evangelistic: 'evangelistic and gospel-focused',
      devotional: 'devotional and reflective',
      prophetic: 'prophetic and challenging',
    };

    const passageList = (passages || []).join(', ') || 'no specific passage provided';

    const themesStr = themes && themes.length > 0 ? themes.join(', ') : null;

    const prompt = `You are assisting a pastor or Bible teacher to create a sermon outline. Generate a complete, detailed sermon outline as JSON.

CRITICAL RULE: Do NOT invent or fabricate verse text. You may reference verse numbers (e.g. "John 3:16") but never quote full verse text from memory — the app will display the actual text from a Bible database.

Important rules:
- Keep the outline faithful to Scripture.
- Avoid controversial doctrinal claims.
- Use respectful language that works across Christian traditions.
- Do not claim divine authority or prophetic messages.
- Focus on encouraging biblical understanding and spiritual growth.

Sermon Parameters:
- Scripture passages: ${passageList}
- Theme/Topic: ${theme}${themesStr ? `\n- Key themes to weave in: ${themesStr}` : ''}
- Audience: ${audienceLabels[audience] || 'general congregation'}
- Length: ${lengthGuide} (${duration_minutes || 20} minutes)
- Tone: ${toneLabels[tone] || 'instructional and educational'}
- Style: ${styleLabels[style] || 'expository verse-by-verse'}

Return ONLY valid JSON with this exact structure:
{
  "title": "compelling sermon title",
  "big_idea": "one sentence central thesis of the entire sermon",
  "outline_sections": [
    {
      "title": "Section title (e.g. Introduction, Point 1: ..., Application, Conclusion)",
      "content": "detailed notes for the preacher, 3-5 sentences",
      "scriptures": ["verse reference", "verse reference"],
      "illustration": "optional short illustration or story idea for this section"
    }
  ],
  "supporting_verses": ["reference1", "reference2", "reference3"],
  "application": "practical life application paragraph — what listeners should do differently",
  "closing_prayer": "full suggested closing prayer text"
}

For a ${duration_minutes}-minute sermon, include approximately ${duration_minutes <= 12 ? 4 : duration_minutes <= 25 ? 5 : 6} outline sections (intro + main points + application + conclusion).
Also include small_group_questions (3–5 discussion questions) and illustrations (2–3 brief illustration ideas).
Make the content theologically sound, biblically grounded, and practically helpful.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          big_idea: { type: 'string' },
          outline_sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                scriptures: { type: 'array', items: { type: 'string' } },
                illustration: { type: 'string' },
              },
            },
          },
          supporting_verses: { type: 'array', items: { type: 'string' } },
          application: { type: 'string' },
          closing_prayer: { type: 'string' },
          small_group_questions: { type: 'array', items: { type: 'string' } },
          illustrations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    console.log('[generateSermonOutline] Generated successfully for user:', user.id, 'theme:', theme);

    return Response.json(result);
  } catch (error) {
    console.error('[generateSermonOutline] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});