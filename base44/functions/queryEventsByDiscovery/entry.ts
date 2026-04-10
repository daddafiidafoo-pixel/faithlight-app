import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const visibility = url.searchParams.get('visibility') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 20;

    // Build filter
    let filter = {};

    if (type !== 'all') {
      filter.type = type;
    }

    if (status !== 'all') {
      filter.status = status;
    }

    // Visibility access control
    if (visibility !== 'all') {
      filter.visibility = visibility;
    } else if (user) {
      // User can see: public + their group events
      // For MVP, just filter public
      filter.visibility = 'public';
    } else {
      // Non-auth users see public only
      filter.visibility = 'public';
    }

    // Fetch events with filter
    let allEvents = await base44.entities.LiveRoom.filter(filter);

    // Search across title + description + host_name
    if (q) {
      const qLower = q.toLowerCase();
      allEvents = allEvents.filter(e =>
        e.title.toLowerCase().includes(qLower) ||
        (e.description && e.description.toLowerCase().includes(qLower)) ||
        (e.host_name && e.host_name.toLowerCase().includes(qLower))
      );
    }

    // Sort: live first, then soonest upcoming, then recent ended
    allEvents.sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      
      if (a.status === 'scheduled' && b.status === 'scheduled') {
        return new Date(a.scheduled_start) - new Date(b.scheduled_start);
      }
      
      if (a.status === 'ended' && b.status === 'ended') {
        return new Date(b.ended_at) - new Date(a.ended_at);
      }

      return 0;
    });

    // Paginate
    const totalCount = allEvents.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (page - 1) * pageSize;
    const events = allEvents.slice(start, start + pageSize);

    return Response.json({
      events,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages
      }
    });
  } catch (error) {
    console.error('queryEventsByDiscovery error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});