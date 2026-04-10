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

    const { message, event_id, session_id } = await req.json();

    if (!message || !event_id || !session_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase();
    
    // Check for profanity
    let foundProfanity = false;
    for (const keyword of PROFANITY_KEYWORDS) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        foundProfanity = true;
        break;
      }
    }

    if (foundProfanity) {
      // Log the filtered attempt
      const event = await base44.entities.LiveRoom.read(event_id);
      await base44.entities.ModerationLog.create({
        event_id,
        session_id,
        actor_user_id: user.id,
        action: 'message_filtered',
        metadata: { filtered_message: message }
      });

      return Response.json({
        allowed: false,
        reason: 'Message contains blocked content'
      });
    }

    return Response.json({ allowed: true });
  } catch (error) {
    console.error('checkProfanity error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});