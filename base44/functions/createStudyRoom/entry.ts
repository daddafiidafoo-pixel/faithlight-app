import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, language_code, category, visibility } = await req.json();

    if (!title) {
      return Response.json({ error: 'Title required' }, { status: 400 });
    }

    // Generate unique room key from title
    const room_key = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`.substring(0, 120);

    const room = await base44.entities.StudyRoom.create({
      room_key,
      title,
      description: description || '',
      language_code: language_code || 'en',
      category: category || 'bible-study',
      visibility: visibility || 'public',
      created_by: user.id,
      is_active: true
    });

    // Add creator as owner
    await base44.entities.StudyRoomMember.create({
      room_id: room.id,
      user_id: user.id,
      role: 'owner',
      is_muted: false
    });

    return Response.json({ room, success: true });
  } catch (error) {
    console.error('createStudyRoom error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});