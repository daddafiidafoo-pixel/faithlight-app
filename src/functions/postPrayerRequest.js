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

    const { circle_id, text } = await req.json();

    if (!circle_id || !text || text.trim().length === 0) {
      return Response.json({ error: 'Circle ID and text required' }, { status: 400 });
    }

    // Verify user is member
    const members = await base44.entities.CircleMember.filter({
      circle_id,
      user_email: user.email,
    });

    if (members.length === 0) {
      return Response.json({ error: 'Not a member of this circle' }, { status: 403 });
    }

    // Create prayer request
    const prayerRequest = await base44.entities.CirclePrayerRequest.create({
      circle_id,
      user_email: user.email,
      user_name: user.full_name,
      text: text.trim(),
      report_count: 0,
      is_reported: false,
      reported_by: [],
    });

    // Increment post count
    const circle = await base44.entities.PrayerCircle.read(circle_id);
    await base44.entities.PrayerCircle.update(circle_id, {
      post_count: circle.post_count + 1,
    });

    return Response.json({ prayer_request: prayerRequest });
  } catch (error) {
    console.error('Error posting prayer request:', error);
    return Response.json(
      { error: error.message || 'Failed to post prayer request' },
      { status: 500 }
    );
  }
});