import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prayer_request_id, support_type } = await req.json();

    if (!prayer_request_id) {
      return Response.json({ error: 'Prayer request ID required' }, { status: 400 });
    }

    // Check if already supported
    const existing = await base44.entities.StudyRoomPrayerSupport.filter({
      prayer_request_id,
      user_id: user.id,
      support_type: support_type || 'praying'
    });

    if (existing && existing.length > 0) {
      return Response.json({ message: 'Already supported', success: true });
    }

    const support = await base44.entities.StudyRoomPrayerSupport.create({
      prayer_request_id,
      user_id: user.id,
      support_type: support_type || 'praying'
    });

    // Increment prayer count on request
    const request = await base44.entities.StudyRoomPrayerRequest.read(prayer_request_id);
    await base44.entities.StudyRoomPrayerRequest.update(prayer_request_id, {
      prayer_count: (request.prayer_count || 0) + 1
    });

    return Response.json({ support, success: true });
  } catch (error) {
    console.error('addPrayerSupport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});