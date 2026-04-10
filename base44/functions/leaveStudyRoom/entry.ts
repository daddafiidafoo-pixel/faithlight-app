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

    // Get user's membership
    const memberships = await base44.entities.StudyRoomMember.filter({
      room_id: roomId,
      user_id: user.id,
      status: 'active'
    });

    if (memberships.length === 0) {
      return Response.json({ error: 'Not a member' }, { status: 400 });
    }

    const membership = memberships[0];

    // Owner cannot leave
    if (membership.role === 'owner') {
      return Response.json({ 
        error: 'Owner cannot leave room',
        code: 'OWNER_CANNOT_LEAVE'
      }, { status: 403 });
    }

    // Mark membership as left
    await base44.entities.StudyRoomMember.update(membership.id, {
      status: 'left'
    });

    // Decrement member count
    const newCount = Math.max(0, room.member_count - 1);
    await base44.entities.StudyRoom.update(roomId, {
      member_count: newCount,
      last_activity_at: new Date().toISOString()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('leaveStudyRoom error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});