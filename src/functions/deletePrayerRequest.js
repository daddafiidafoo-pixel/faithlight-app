/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prayer_request_id, circle_id, is_admin } = await req.json();

    if (!prayer_request_id || !circle_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prayerRequest = await base44.entities.CirclePrayerRequest.read(prayer_request_id);
    const circle = await base44.entities.PrayerCircle.read(circle_id);

    // Only author or admin can delete
    const isAuthor = prayerRequest.user_email === user.email;
    const isAdmin = circle.created_by === user.email;

    if (!isAuthor && !isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await base44.entities.CirclePrayerRequest.delete(prayer_request_id);

    // Decrement post count
    await base44.entities.PrayerCircle.update(circle_id, {
      post_count: Math.max(0, circle.post_count - 1),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting prayer request:', error);
    return Response.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
});