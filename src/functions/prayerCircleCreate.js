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

    const { name, description } = await req.json();

    if (!name || name.trim().length === 0) {
      return Response.json({ error: 'Circle name is required' }, { status: 400 });
    }

    // Create circle
    const circle = await base44.entities.PrayerCircle.create({
      name: name.trim(),
      description: description?.trim() || '',
      created_by: user.email,
      created_by_name: user.full_name,
      member_count: 1,
      post_count: 0,
      is_public: true,
    });

    // Add creator as first member
    await base44.entities.CircleMember.create({
      circle_id: circle.id,
      user_email: user.email,
      user_name: user.full_name,
      joined_at: new Date().toISOString(),
    });

    return Response.json({ circle });
  } catch (error) {
    console.error('Error creating circle:', error);
    return Response.json(
      { error: error.message || 'Failed to create circle' },
      { status: 500 }
    );
  }
});