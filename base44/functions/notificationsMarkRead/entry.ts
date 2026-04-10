import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const notificationId = url.searchParams.get('id');

    if (!notificationId) {
      return Response.json({ error: 'Missing notification id' }, { status: 400 });
    }

    await base44.entities.Notification.update(notificationId, {
      isRead: true,
      readAt: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Notification mark read error:', error);
    return Response.json({ error: 'Failed to mark notification as read', details: error.message }, { status: 500 });
  }
});