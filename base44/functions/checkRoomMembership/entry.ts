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

    // Check if user is member of this room
    const memberships = await base44.entities.StudyRoomMember.filter({
      room_id: roomId,
      user_id: user.id,
      status: 'active'
    });

    const isMember = memberships.length > 0;
    const role = memberships.length > 0 ? memberships[0].role : null;

    return Response.json({
      isMember,
      role,
      userId: user.id
    });
  } catch (error) {
    console.error('checkRoomMembership error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});