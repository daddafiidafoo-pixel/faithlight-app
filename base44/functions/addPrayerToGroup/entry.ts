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

    const { group_id, title, description } = await req.json();

    if (!group_id || !title) {
      return Response.json({ error: 'Group ID and title required' }, { status: 400 });
    }

    const request = await base44.entities.PrayerGroupRequest.create({
      group_id,
      user_email: user.email,
      title,
      description: description || '',
      prayer_count: 0,
      created_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      request,
    });
  } catch (error) {
    console.error('Error adding prayer:', error);
    return Response.json(
      { error: error.message || 'Failed to add prayer request' },
      { status: 500 }
    );
  }
});