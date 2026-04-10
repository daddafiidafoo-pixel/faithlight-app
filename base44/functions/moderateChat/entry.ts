import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PROFANITY_KEYWORDS = [
  'badword1', 'badword2', 'badword3'
  // Add your profanity list here
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, event_id, session_id, message_id, message_content, target_user_id } = await req.json();

    const event = await base44.entities.LiveRoom.read(event_id);
    const isHost = event.host_id === user.id;
    const isCohost = event.cohost_ids?.includes(user.id);

    if (!isHost && !isCohost) {
      return Response.json({ error: 'Forbidden: Only host/cohost can moderate' }, { status: 403 });
    }

    // Log moderation action
    const logData = {
      event_id,
      session_id,
      actor_user_id: user.id,
      action,
      target_user_id
    };

    if (action === 'delete_message') {
      const message = await base44.entities.ChatMessage.read(message_id);
      await base44.entities.ChatMessage.update(message_id, {
        is_deleted: true,
        deleted_by: user.id,
        deleted_at: new Date().toISOString()
      });
      logData.metadata = { message_id, original_content: message.message };
    } else if (action === 'disable_chat') {
      await base44.entities.LiveRoom.update(event_id, { allow_chat: false });
      logData.metadata = { chat_disabled_at: new Date().toISOString() };
    } else if (action === 'enable_chat') {
      await base44.entities.LiveRoom.update(event_id, { allow_chat: true });
      logData.metadata = { chat_enabled_at: new Date().toISOString() };
    } else if (action === 'mute_user') {
      logData.metadata = { user_muted_at: new Date().toISOString() };
    } else if (action === 'unmute_user') {
      logData.metadata = { user_unmuted_at: new Date().toISOString() };
    }

    await base44.entities.ModerationLog.create(logData);
    return Response.json({ success: true });
  } catch (error) {
    console.error('moderateChat error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});