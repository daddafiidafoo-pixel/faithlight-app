import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await req.json();

    if (!roomId) {
      return Response.json({ error: 'roomId required' }, { status: 400 });
    }

    // Get room
    const rooms = await base44.entities.StudyRoom.filter({ id: roomId });
    if (rooms.length === 0) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = rooms[0];

    // Get recent messages (last 20)
    const messages = await base44.entities.StudyRoomMessage.filter({
      room_id: roomId
    });

    if (messages.length === 0) {
      return Response.json({ error: 'No messages to summarize' }, { status: 400 });
    }

    // Sort by created_at descending and take last 20
    const recentMessages = messages
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20)
      .reverse();

    // Format messages for prompt
    const messageText = recentMessages
      .map(m => `${m.user_id}: ${m.content}`)
      .join('\n');

    // Call LLM to summarize
    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a spiritual discussion facilitator. Summarize the recent discussion in this ${room.language} FaithLight study room in under 120 words. Include main Bible topics, key verse references if mentioned, and prayer requests if present. Keep tone encouraging, respectful, and spiritually helpful. Discussion:\n\n${messageText}`,
      model: 'gemini_3_flash'
    });

    // Create system message with summary
    await base44.entities.StudyRoomMessage.create({
      room_id: roomId,
      user_id: user.id,
      message_type: 'system',
      content: `📝 AI Summary:\n\n${summary}`,
      language: room.language,
      created_at: new Date().toISOString()
    });

    // Update room activity
    await base44.entities.StudyRoom.update(roomId, {
      last_activity_at: new Date().toISOString()
    });

    return Response.json({ success: true, summary });
  } catch (error) {
    console.error('summarizeRoomDiscussion error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});