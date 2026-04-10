import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { group_id } = await req.json();

    if (!group_id) {
      return Response.json({ error: 'Group ID required' }, { status: 400 });
    }

    // Check if already a member
    const existing = await base44.entities.PrayerGroupMember.filter({
      group_id,
      user_email: user.email,
    });

    if (existing && existing.length > 0) {
      return Response.json({
        success: true,
        message: 'Already a member of this group',
      });
    }

    // Add member
    await base44.entities.PrayerGroupMember.create({
      group_id,
      user_email: user.email,
      joined_date: new Date().toISOString(),
    });

    // Update group member count
    const group = await base44.entities.PrayerGroup.filter({ id: group_id });
    if (group && group.length > 0) {
      await base44.entities.PrayerGroup.update(group_id, {
        member_count: (group[0].member_count || 1) + 1,
      });
    }

    return Response.json({
      success: true,
      message: 'Joined group successfully',
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return Response.json(
      { error: error.message || 'Failed to join group' },
      { status: 500 }
    );
  }
});