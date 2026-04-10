import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const {
      q = '',
      type = 'all',
      status = 'all',
      visibility = 'all',
      group_id = null,
      sort = 'soonest',
      page = 1,
      page_size = 20
    } = await req.json();

    // Build filter
    const filter = {};
    
    if (type !== 'all') {
      filter.type = type;
    }
    if (status !== 'all') {
      filter.status = status;
    }
    if (visibility !== 'all') {
      filter.visibility = visibility;
    }
    if (group_id) {
      filter.group_id = group_id;
    }

    // Get all events matching filter
    let events = await base44.entities.LiveRoom.filter(filter);

    // Apply search filter (title, description, host_name)
    if (q) {
      const searchLower = q.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower) ||
        e.host_name.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (sort === 'soonest') {
      events.sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start));
    } else if (sort === 'recent') {
      events.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sort === 'live_first') {
      events.sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (a.status !== 'live' && b.status === 'live') return 1;
        return new Date(a.scheduled_start) - new Date(b.scheduled_start);
      });
    }

    // Paginate
    const start = (page - 1) * page_size;
    const end = start + page_size;
    const items = events.slice(start, end);
    const total = events.length;
    const next_page = end < total ? page + 1 : null;

    return Response.json({
      items,
      pagination: {
        page,
        page_size,
        total,
        next_page
      }
    });
  } catch (error) {
    console.error('Error querying events:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});