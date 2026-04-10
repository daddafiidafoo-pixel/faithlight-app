import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// LiveEventAttendee RSVP rules + duplicate prevention
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, event_id, user_id, attendee_id } = body;

    const userRole = user.role || 'user';
    const isAdmin = userRole === 'admin';
    const isModerator = userRole === 'moderator';

    if (!action || !event_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get event
    const event = await base44.asServiceRole.entities.LiveEvent.filter({
      id: event_id
    });

    if (!event || event.length === 0) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    const evt = event[0];

    let allowed = false;
    let reason = '';

    if (action === 'rsvp') {
      // User can RSVP if event is published and readable
      const targetUser = user_id || user.id;

      // Can only RSVP self unless admin
      if (targetUser !== user.id && !isAdmin) {
        allowed = false;
        reason = 'Can only RSVP for yourself';
      } else if (!evt.is_published) {
        allowed = false;
        reason = 'Event is not published';
      } else {
        // Check read permission
        if (evt.visibility === 'public') {
          allowed = true;
        } else if (evt.visibility === 'group_only' && evt.group_id) {
          const member = await base44.asServiceRole.entities.GroupMember.filter({
            group_id: evt.group_id,
            user_id: targetUser
          });
          allowed = member && member.length > 0;
          if (!allowed) reason = 'You are not a member of this group';
        } else if (evt.visibility === 'private') {
          // Would need explicit invite check
          allowed = false;
          reason = 'This is a private event';
        }

        // Check for duplicate RSVP
        if (allowed) {
          const existing = await base44.asServiceRole.entities.LiveEventAttendee.filter({
            event_id: event_id,
            user_id: targetUser
          });
          if (existing && existing.length > 0) {
            allowed = false;
            reason = 'You have already RSVP\'d to this event';
          }
        }
      }
    }

    if (action === 'update') {
      // User can only update their own attendee record
      if (!attendee_id) {
        return Response.json({ error: 'Missing attendee_id' }, { status: 400 });
      }

      const attendee = await base44.asServiceRole.entities.LiveEventAttendee.filter({
        id: attendee_id
      });

      if (!attendee || attendee.length === 0) {
        return Response.json({ error: 'Attendee record not found' }, { status: 404 });
      }

      const att = attendee[0];

      if (att.user_id === user.id) {
        allowed = true;
      } else if (isAdmin || isModerator) {
        allowed = true;
      } else {
        allowed = false;
        reason = 'Can only update your own RSVP';
      }
    }

    if (action === 'delete') {
      // User can remove their own RSVP, admin can remove anyone
      if (!attendee_id) {
        return Response.json({ error: 'Missing attendee_id' }, { status: 400 });
      }

      const attendee = await base44.asServiceRole.entities.LiveEventAttendee.filter({
        id: attendee_id
      });

      if (!attendee || attendee.length === 0) {
        return Response.json({ error: 'Attendee record not found' }, { status: 404 });
      }

      const att = attendee[0];

      if (att.user_id === user.id || isAdmin || isModerator) {
        allowed = true;
      } else {
        allowed = false;
        reason = 'Cannot remove other users';
      }
    }

    return Response.json({
      allowed,
      reason,
      user_id: user.id,
      user_role: userRole,
      action_type: action
    });
  } catch (error) {
    console.error('Attendee rule check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});