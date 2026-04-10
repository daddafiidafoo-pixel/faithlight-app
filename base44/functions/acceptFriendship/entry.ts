import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { friendRequestId } = body;

    if (!friendRequestId) {
      return Response.json(
        { error: 'Friend request ID required' },
        { status: 400 }
      );
    }

    // Get and update friend request
    const friendRequest = await base44.asServiceRole.entities.Friend.filter({
      id: friendRequestId
    });

    if (!friendRequest?.length) {
      return Response.json({ error: 'Friend request not found' }, { status: 404 });
    }

    const req1 = friendRequest[0];
    if (req1.friend_id !== user.id) {
      return Response.json(
        { error: 'Not authorized to accept this request' },
        { status: 403 }
      );
    }

    // Update request to accepted
    await base44.asServiceRole.entities.Friend.update(friendRequestId, {
      status: 'accepted',
      connected_at: new Date().toISOString()
    });

    // Create reverse friendship
    const requester = await base44.asServiceRole.entities.User.filter({
      id: req1.user_id
    });

    await base44.asServiceRole.entities.Friend.create({
      user_id: user.id,
      friend_id: req1.user_id,
      friend_name: requester[0].full_name,
      status: 'accepted',
      connected_at: new Date().toISOString()
    });

    // Notify requester
    await base44.asServiceRole.functions.invoke('sendNotification', {
      userId: req1.user_id,
      userEmail: requester[0].email,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      content: `${user.full_name} accepted your friend request`,
      actionUrl: `/UserProfile?userId=${user.id}`
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});