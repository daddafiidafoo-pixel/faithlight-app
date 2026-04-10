import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verse_ref, explanation, follow_ups } = await req.json();

    if (!verse_ref || !explanation) {
      return Response.json({ error: 'Missing verse_ref or explanation' }, { status: 400 });
    }

    // Save as a SavedExplanation entity
    await base44.entities.SavedAIOutput.create({
      user_id: user.id,
      content_type: 'bible_explanation',
      content_key: verse_ref,
      output: explanation,
      metadata: {
        follow_ups: follow_ups || [],
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Save explanation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});