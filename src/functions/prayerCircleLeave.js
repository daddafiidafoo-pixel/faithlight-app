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

    const { circle_id } = await req.json();

    if (!circle_id) {
      return Response.json({ error: 'Circle ID required' }, { status: 400 });
    }

    // Find and delete membership
    const members = await base44.entities.CircleMember.filter({
      circle_id,
      user_email: user.email,
    });

    if (members.length === 0) {
      return Response.json({ error: 'Not a member' }, { status: 400 });
    }

    await base44.entities.CircleMember.delete(members[0].id);

    // Decrement member count
    const circle = await base44.entities.PrayerCircle.read(circle_id);
    await base44.entities.PrayerCircle.update(circle_id, {
      member_count: Math.max(0, circle.member_count - 1),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error leaving circle:', error);
    return Response.json(
      { error: error.message || 'Failed to leave circle' },
      { status: 500 }
    );
  }
});