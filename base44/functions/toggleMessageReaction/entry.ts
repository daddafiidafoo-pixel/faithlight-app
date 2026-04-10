import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id, reaction } = await req.json();

    if (!message_id || !reaction) {
      return Response.json({ error: 'Message ID and reaction required' }, { status: 400 });
    }

    // Check if already reacted
    const existing = await base44.entities.StudyRoomMessageReaction.filter({
      message_id,
      user_id: user.id,
      reaction
    });

    if (existing && existing.length > 0) {
      // Remove reaction
      await base44.asServiceRole.entities.StudyRoomMessageReaction.delete(existing[0].id);
      return Response.json({ action: 'removed', success: true });
    } else {
      // Add reaction
      const newReaction = await base44.entities.StudyRoomMessageReaction.create({
        message_id,
        user_id: user.id,
        reaction
      });
      return Response.json({ action: 'added', reaction: newReaction, success: true });
    }
  } catch (error) {
    console.error('toggleMessageReaction error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});