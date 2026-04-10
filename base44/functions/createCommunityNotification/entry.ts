import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Create a community notification
 * Called when activity happens (forum reply, message, etc.)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      user_id, 
      type, 
      actor_id, 
      actor_name, 
      title, 
      message, 
      related_id, 
      related_type,
      action_url 
    } = await req.json();

    if (!user_id || !type || !actor_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create notification
    const notification = await base44.asServiceRole.entities.CommunityNotification.create({
      user_id,
      type,
      actor_id,
      actor_name,
      title,
      message: message || '',
      related_id: related_id || '',
      related_type: related_type || '',
      action_url: action_url || '',
      is_read: false,
    });

    return Response.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Notification creation error:', error);
    return Response.json(
      { error: 'Failed to create notification', details: error.message },
      { status: 500 }
    );
  }
});