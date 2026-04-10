import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subscription, isSubscribed } = body;

    if (!subscription) {
      return Response.json(
        { error: 'Subscription required' },
        { status: 400 }
      );
    }

    // Store push subscription in user metadata or separate entity
    // This allows sending push notifications later
    if (isSubscribed) {
      // In production, store subscription.endpoint to later send pushes via Web Push API
      console.log('Push subscription registered for user:', user.id);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});