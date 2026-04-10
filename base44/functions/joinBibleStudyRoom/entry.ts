import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { room_id } = await req.json();

    if (!room_id) {
      return Response.json({ error: 'Room ID required' }, { status: 400 });
    }

    // Check if already member
    const existing = await base44.entities.BibleRoomMember.filter({
      room_id,
      user_id: user.id
    });

    if (existing && existing.length > 0) {
      return Response.json({ message: 'Already a member', success: true });
    }

    // Add user to room
    const member = await base44.entities.BibleRoomMember.create({
      room_id,
      user_id: user.id,
      user_name: user.full_name,
      role: 'member'
    });

    // Increment participant count
    const room = await base44.entities.BibleStudyRoom.read(room_id);
    await base44.entities.BibleStudyRoom.update(room_id, {
      participant_count: (room.participant_count || 0) + 1
    });

    return Response.json({ member, success: true });
  } catch (error) {
    console.error('joinBibleStudyRoom error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});