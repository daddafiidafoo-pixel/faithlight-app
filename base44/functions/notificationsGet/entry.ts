import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get('unread') === 'true';

    let notifications = await base44.entities.Notification.filter({
      userEmail: user.email,
    });

    if (unreadOnly) {
      notifications = (notifications || []).filter((n) => !n.isRead);
    }

    return Response.json({
      success: true,
      data: (notifications || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead,
          createdAt: n.createdAt,
        })),
    });
  } catch (error) {
    console.error('Notifications get error:', error);
    return Response.json({ error: 'Failed to fetch notifications', details: error.message }, { status: 500 });
  }
});