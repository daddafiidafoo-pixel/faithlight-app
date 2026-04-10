import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, inviteCode } = await req.json();

    if (!roomId) {
      return Response.json({ error: 'roomId required' }, { status: 400 });
    }

    // Fetch room
    const rooms = await base44.entities.StudyRoom.filter({ id: roomId });
    if (rooms.length === 0) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = rooms[0];

    // Check if private room requires invite code
    if (room.privacy === 'private' && (!inviteCode || inviteCode !== room.invite_code)) {
      return Response.json({ error: 'Invalid invite code' }, { status: 403 });
    }

    // Check if already member
    const existing = await base44.entities.StudyRoomMember.filter({
      room_id: roomId,
      user_id: user.id,
      status: 'active'
    });

    if (existing.length > 0) {
      return Response.json({ error: 'Already a member' }, { status: 400 });
    }

    // Check max members
    if (room.member_count >= room.max_members) {
      return Response.json({ error: 'Room is full' }, { status: 400 });
    }

    // Add user as member
    await base44.entities.StudyRoomMember.create({
      room_id: roomId,
      user_id: user.id,
      role: 'member',
      status: 'active',
      joined_at: new Date().toISOString()
    });

    // Update room member count and last activity
    await base44.entities.StudyRoom.update(roomId, {
      member_count: room.member_count + 1,
      last_activity_at: new Date().toISOString()
    });

    return Response.json({ success: true, roomId });
  } catch (error) {
    console.error('joinStudyRoom error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});