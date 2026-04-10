import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callId, callMode, recipientId, isGroupCall } = await req.json();

    // Determine notification details
    const title = isGroupCall
      ? `Incoming ${callMode} call`
      : `${user.full_name} is calling...`;
    const content = `${callMode === 'audio' ? '📞' : '📹'} ${user.full_name} ${isGroupCall ? 'started a group' : ''} ${callMode} call`;

    // Create notification for recipient
    await base44.functions.invoke('notificationManager', {
      action: 'createNotification',
      notificationData: {
        userId: recipientId,
        type: 'call_incoming',
        title,
        content,
        sourceUserId: user.id,
        sourceUserName: user.full_name,
        relatedId: callId,
        relatedType: 'Call',
        actionUrl: `/Call?callId=${callId}`,
        metadata: { callMode, isGroupCall }
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating call notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});