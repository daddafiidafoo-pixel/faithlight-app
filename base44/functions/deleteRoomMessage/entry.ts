import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id } = await req.json();

    if (!message_id) {
      return Response.json({ error: 'Message ID required' }, { status: 400 });
    }

    const message = await base44.entities.StudyRoomMessage.read(message_id);

    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }

    // Only owner/moderator or message author can delete
    if (message.user_id !== user.id) {
      const member = await base44.entities.StudyRoomMember.filter({
        room_id: message.room_id,
        user_id: user.id
      });
      
      if (!member || member.length === 0 || !['owner', 'moderator'].includes(member[0].role)) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Mark as deleted instead of removing
    await base44.entities.StudyRoomMessage.update(message_id, {
      is_deleted: true
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('deleteRoomMessage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});