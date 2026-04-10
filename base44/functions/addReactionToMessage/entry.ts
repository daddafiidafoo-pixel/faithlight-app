import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id, emoji } = await req.json();

    if (!message_id || !emoji) {
      return Response.json({ error: 'Message ID and emoji required' }, { status: 400 });
    }

    // Check if already reacted
    const existing = await base44.entities.BibleRoomReaction.filter({
      message_id,
      user_id: user.id,
      emoji
    });

    if (existing && existing.length > 0) {
      return Response.json({ message: 'Already reacted', success: true });
    }

    // Add reaction
    const reaction = await base44.entities.BibleRoomReaction.create({
      message_id,
      user_id: user.id,
      emoji
    });

    // Increment message reaction count
    const message = await base44.entities.BibleRoomMessage.read(message_id);
    await base44.entities.BibleRoomMessage.update(message_id, {
      reaction_count: (message.reaction_count || 0) + 1
    });

    return Response.json({ reaction, success: true });
  } catch (error) {
    console.error('addReactionToMessage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});