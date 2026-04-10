import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { friendId } = body;

    if (!friendId) {
      return Response.json(
        { error: 'Friend ID required' },
        { status: 400 }
      );
    }

    if (friendId === user.id) {
      return Response.json(
        { error: 'Cannot add yourself as friend' },
        { status: 400 }
      );
    }

    // Check if already friends or pending
    const existing = await base44.entities.Friend.filter({
      user_id: user.id,
      friend_id: friendId
    });

    if (existing?.length > 0) {
      return Response.json(
        { error: 'Friendship already exists or pending' },
        { status: 409 }
      );
    }

    // Get friend info
    const friend = await base44.asServiceRole.entities.User.filter({
      id: friendId
    });

    if (!friend?.length) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Create friend request
    const friendRequest = await base44.entities.Friend.create({
      user_id: user.id,
      friend_id: friendId,
      friend_name: friend[0].full_name,
      status: 'pending'
    });

    // Notify friend
    await base44.asServiceRole.functions.invoke('sendNotification', {
      userId: friendId,
      userEmail: friend[0].email,
      type: 'friend_request',
      title: 'New Friend Request',
      content: `${user.full_name} sent you a friend request`,
      relatedId: friendRequest.id,
      actionUrl: `/Friends`
    });

    return Response.json({
      success: true,
      friendRequest
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});