import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { room_id, content, message_type, verse_reference, verse_text, language_code, reply_to_message_id } = await req.json();

    if (!room_id || !content) {
      return Response.json({ error: 'Room ID and content required' }, { status: 400 });
    }

    const message = await base44.entities.StudyRoomMessage.create({
      room_id,
      user_id: user.id,
      content,
      message_type: message_type || 'text',
      verse_reference: verse_reference || null,
      verse_text: verse_text || null,
      language_code: language_code || 'en',
      reply_to_message_id: reply_to_message_id || null,
      is_deleted: false
    });

    return Response.json({ message, success: true });
  } catch (error) {
    console.error('sendStudyRoomMessage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});