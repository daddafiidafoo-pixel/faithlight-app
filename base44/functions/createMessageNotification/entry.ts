import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, conversationTitle, recipientId, isGroupMessage } = await req.json();

    // Determine notification type
    const type = isGroupMessage ? 'group_message' : 'message';
    const title = isGroupMessage 
      ? `New message in ${conversationTitle}`
      : `New message from ${user.full_name}`;
    const content = `${user.full_name}: ${isGroupMessage ? 'sent a message' : 'sent you a message'}`;

    // Create notification for recipient
    await base44.functions.invoke('notificationManager', {
      action: 'createNotification',
      notificationData: {
        userId: recipientId,
        type,
        title,
        content,
        sourceUserId: user.id,
        sourceUserName: user.full_name,
        relatedId: conversationId,
        relatedType: 'Conversation',
        actionUrl: `/DirectMessages?conversationId=${conversationId}`,
        metadata: { conversationTitle }
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating message notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});