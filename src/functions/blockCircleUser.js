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

    const { circle_id, blocked_user, blocked_user_name } = await req.json();

    if (!circle_id || !blocked_user) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already blocked
    const existing = await base44.entities.BlockedCircleUser.filter({
      circle_id,
      blocked_by: user.email,
      blocked_user,
    });

    if (existing.length > 0) {
      return Response.json({ error: 'Already blocked' }, { status: 400 });
    }

    await base44.entities.BlockedCircleUser.create({
      circle_id,
      blocked_by: user.email,
      blocked_user,
      blocked_user_name,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    return Response.json(
      { error: error.message || 'Failed to block user' },
      { status: 500 }
    );
  }
});