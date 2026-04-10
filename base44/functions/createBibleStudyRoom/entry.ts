import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, topic } = await req.json();

    if (!name || !topic) {
      return Response.json({ error: 'Name and topic required' }, { status: 400 });
    }

    // Create study room
    const room = await base44.entities.BibleStudyRoom.create({
      name,
      description: description || '',
      creator_id: user.id,
      creator_name: user.full_name,
      topic,
      is_public: true,
      participant_count: 1,
      is_active: true
    });

    // Add creator as admin member
    await base44.entities.BibleRoomMember.create({
      room_id: room.id,
      user_id: user.id,
      user_name: user.full_name,
      role: 'admin'
    });

    return Response.json({ room, success: true });
  } catch (error) {
    console.error('createBibleStudyRoom error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});