import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    const { topic, save_to_dashboard } = await req.json();

    if (!topic || topic.trim().length === 0) {
      return Response.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate sermon using AI
    const sermonPrompt = `Generate a complete Christian sermon outline for the topic: "${topic}"

Provide ONLY valid JSON with NO markdown formatting or code blocks. Structure exactly like this:
{
  "title": "A powerful sermon title",
  "outline": [
    {
      "section": "Introduction",
      "content": "Hook and context for the sermon (2-3 sentences)"
    },
    {
      "section": "Main Point 1",
      "content": "First key message (2-3 sentences)"
    },
    {
      "section": "Main Point 2",
      "content": "Second key message (2-3 sentences)"
    },
    {
      "section": "Application",
      "content": "How listeners can apply this (2-3 sentences)"
    }
  ],
  "key_verses": ["Genesis 3:16", "Romans 8:28", "John 3:16"],
  "illustrations": [
    "A practical story or example that illustrates the first point",
    "Another relevant example from life or history"
  ],
  "closing_prayer": "A 4-5 sentence prayer summarizing the sermon message"
}`;

    const aiRes = await base44.integrations.Core.InvokeLLM({
      prompt: sermonPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          outline: {
            type: "array",
            items: {
              type: "object",
              properties: {
                section: { type: "string" },
                content: { type: "string" }
              }
            }
          },
          key_verses: { type: "array", items: { type: "string" } },
          illustrations: { type: "array", items: { type: "string" } },
          closing_prayer: { type: "string" }
        }
      }
    });

    if (!aiRes.data) {
      return Response.json(
        { error: 'Failed to generate sermon' },
        { status: 500 }
      );
    }

    // Save to database if user wants
    let sermon_id = null;
    if (user && save_to_dashboard) {
      try {
        const sermon = await base44.entities.SavedSermon.create({
          user_id: user.email,
          title: aiRes.data.title,
          topic,
          outline: aiRes.data.outline,
          key_verses: aiRes.data.key_verses,
          illustrations: aiRes.data.illustrations,
          closing_prayer: aiRes.data.closing_prayer,
          created_at: new Date().toISOString(),
        });
        sermon_id = sermon.id;
      } catch (dbError) {
        console.error('Failed to save sermon:', dbError);
      }
    }

    return Response.json({
      success: true,
      sermon: {
        ...aiRes.data,
        id: sermon_id,
      }
    });
  } catch (error) {
    console.error('Error generating sermon:', error);
    return Response.json(
      { error: error.message || 'Failed to generate sermon' },
      { status: 500 }
    );
  }
});