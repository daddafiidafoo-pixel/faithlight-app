import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toUserId, toUserName } = await req.json();

    // Create notification for recipient
    await base44.functions.invoke('notificationManager', {
      action: 'createNotification',
      notificationData: {
        userId: toUserId,
        type: 'friend_request',
        title: `Friend Request from ${user.full_name}`,
        content: `${user.full_name} sent you a friend request`,
        sourceUserId: user.id,
        sourceUserName: user.full_name,
        actionUrl: '/Friends?tab=pending'
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating friend request notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});