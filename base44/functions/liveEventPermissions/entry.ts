import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Check if user can READ a LiveEvent
 * 
 * Rules:
 * - Public published events → anyone
 * - Creator → always
 * - Group-only + is group member → yes
 * - Private + attendee/invited → yes
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { eventId } = await req.json();

    if (!eventId || !user) {
      return Response.json({ error: 'Missing params' }, { status: 400 });
    }

    const event = await base44.asServiceRole.entities.LiveEvent.filter({
      id: eventId
    });

    if (!event || event.length === 0) {
      return Response.json({ allowed: false });
    }

    const e = event[0];

    // Public + published
    if (e.is_published && e.visibility === 'public') {
      return Response.json({ allowed: true });
    }

    // Creator
    if (e.created_by === user.id) {
      return Response.json({ allowed: true });
    }

    // Is attendee
    const attendee = await base44.asServiceRole.entities.LiveEventAttendee.filter({
      event_id: eventId,
      user_id: user.id
    });

    if (attendee && attendee.length > 0) {
      return Response.json({ allowed: true });
    }

    // Group-only + is member
    if (e.visibility === 'group_only' && e.group_id) {
      const member = await base44.asServiceRole.entities.GroupMember.filter({
        group_id: e.group_id,
        user_id: user.id
      });

      if (member && member.length > 0) {
        return Response.json({ allowed: true });
      }
    }

    return Response.json({ allowed: false });
  } catch (error) {
    console.error('Permission check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});