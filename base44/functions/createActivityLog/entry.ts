import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Log an activity action
 * Called automatically by entity automations when records are created/updated
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      action_type,
      entity_type,
      entity_id,
      entity_title,
      description,
      details = {},
      visibility = 'public',
      group_id = null
    } = await req.json();

    // Validate required fields
    if (!action_type || !entity_type || !entity_id || !description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const activityLog = await base44.asServiceRole.entities.ActivityLog.create({
      user_id: user.id,
      user_name: user.full_name,
      action_type,
      entity_type,
      entity_id,
      entity_title,
      description,
      details,
      visibility,
      group_id
    });

    return Response.json({ success: true, activityLog });
  } catch (error) {
    console.error('Activity log error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});