import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, groupTitle, recipientIds } = await req.json();

    // Create notification for each invited user
    const notificationPromises = recipientIds.map(recipientId =>
      base44.functions.invoke('notificationManager', {
        action: 'createNotification',
        notificationData: {
          userId: recipientId,
          type: 'group_invite',
          title: `Added to group: ${groupTitle}`,
          content: `${user.full_name} added you to the group "${groupTitle}"`,
          sourceUserId: user.id,
          sourceUserName: user.full_name,
          relatedId: groupId,
          relatedType: 'Conversation',
          actionUrl: `/DirectMessages?conversationId=${groupId}`,
          metadata: { groupTitle }
        }
      })
    );

    await Promise.all(notificationPromises);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating group invite notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});