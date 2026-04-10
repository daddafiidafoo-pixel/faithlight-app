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

    const { prayer_request_id } = await req.json();

    if (!prayer_request_id) {
      return Response.json({ error: 'Prayer request ID required' }, { status: 400 });
    }

    const prayerRequest = await base44.entities.CirclePrayerRequest.read(prayer_request_id);

    // Prevent duplicate reports from same user
    if (prayerRequest.reported_by.includes(user.email)) {
      return Response.json({ error: 'Already reported' }, { status: 400 });
    }

    // Update report
    const newReportedBy = [...prayerRequest.reported_by, user.email];
    await base44.entities.CirclePrayerRequest.update(prayer_request_id, {
      report_count: prayerRequest.report_count + 1,
      reported_by: newReportedBy,
      is_reported: true,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error reporting post:', error);
    return Response.json(
      { error: error.message || 'Failed to report post' },
      { status: 500 }
    );
  }
});