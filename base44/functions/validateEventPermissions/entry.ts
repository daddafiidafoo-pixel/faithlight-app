import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Reusable permission checker for LiveEvent operations
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, event_id, visibility, user_role } = body;

    // User info
    const userRole = user.role || 'user';
    const isAdmin = userRole === 'admin';
    const isModerator = userRole === 'moderator';

    if (!action || !event_id) {
      return Response.json({ error: 'Missing action or event_id' }, { status: 400 });
    }

    // Get event
    const event = await base44.asServiceRole.entities.LiveEvent.filter({
      id: event_id
    });

    if (!event || event.length === 0) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    const evt = event[0];
    const isCreator = evt.created_by === user.id;

    // PERMISSION RULES
    let allowed = false;

    if (action === 'read') {
      // Public events: everyone
      if (evt.visibility === 'public' && evt.is_published) {
        allowed = true;
      }
      // Creator always
      if (isCreator) {
        allowed = true;
      }
      // Attendee can read
      const attendee = await base44.asServiceRole.entities.LiveEventAttendee.filter({
        event_id: event_id,
        user_id: user.id
      });
      if (attendee && attendee.length > 0) {
        allowed = true;
      }
      // Group-only: check membership
      if (evt.visibility === 'group_only' && evt.group_id) {
        const member = await base44.asServiceRole.entities.GroupMember.filter({
          group_id: evt.group_id,
          user_id: user.id
        });
        if (member && member.length > 0) {
          allowed = true;
        }
      }
      // Admin/moderator
      if (isAdmin || isModerator) {
        allowed = true;
      }
    }

    if (action === 'create') {
      // Any authenticated user can create
      allowed = true;
    }

    if (action === 'edit') {
      // Creator or admin/moderator
      if (isCreator || isAdmin || isModerator) {
        allowed = true;
      }
    }

    if (action === 'publish') {
      // Creator or admin (publishing is sensitive)
      if (isCreator || isAdmin) {
        allowed = true;
      }
    }

    if (action === 'delete') {
      // Creator can delete drafts, admin can delete anything
      if ((isCreator && evt.status === 'draft') || isAdmin) {
        allowed = true;
      }
    }

    if (action === 'moderate') {
      // Only creator or admin/moderator
      if (isCreator || isAdmin || isModerator) {
        allowed = true;
      }
    }

    return Response.json({
      allowed,
      user_id: user.id,
      user_role: userRole,
      is_creator: isCreator,
      event_status: evt.status,
      event_visibility: evt.visibility
    });
  } catch (error) {
    console.error('Permission check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});