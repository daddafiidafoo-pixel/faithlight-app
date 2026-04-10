import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Create notification respecting user preferences
 */
export async function createNotification(base44, {
  userId,
  type,
  title,
  content,
  sourceUserId = null,
  sourceUserName = null,
  relatedId = null,
  relatedType = null,
  actionUrl = null,
  metadata = {}
}) {
  try {
    // Get user preferences
    const prefs = await base44.entities.NotificationPreferences.filter({
      user_id: userId
    }, '', 1);

    const preferences = prefs[0] || {};

    // Check if muted
    if (preferences.mute_all) {
      if (preferences.mute_until) {
        const muteUntil = new Date(preferences.mute_until);
        if (new Date() < muteUntil) {
          return null; // Notification muted
        }
      } else {
        return null; // All notifications muted
      }
    }

    // Check if this notification type is enabled
    const typeMap = {
      'friend_request': 'friend_requests_enabled',
      'friend_accepted': 'friend_requests_enabled',
      'message': 'messages_enabled',
      'group_message': 'group_messages_enabled',
      'call_incoming': 'calls_enabled',
      'group_invite': 'group_invites_enabled',
      'system': 'system_announcements_enabled'
    };

    const prefKey = typeMap[type];
    if (prefKey && preferences[prefKey] === false) {
      return null; // This notification type is disabled
    }

    // Create notification
    const notification = await base44.entities.Notification.create({
      user_id: userId,
      type,
      title,
      content,
      source_user_id: sourceUserId,
      source_user_name: sourceUserName,
      related_id: relatedId,
      related_type: relatedType,
      action_url: actionUrl,
      metadata,
      is_read: false
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, notificationData } = await req.json();

    if (action === 'createNotification') {
      const notification = await createNotification(base44, notificationData);
      return Response.json({ notification });
    }

    if (action === 'markAsRead') {
      const { notificationId } = await req.json();
      await base44.entities.Notification.update(notificationId, { is_read: true });
      return Response.json({ success: true });
    }

    if (action === 'markAllAsRead') {
      const notifications = await base44.entities.Notification.filter({
        user_id: user.id,
        is_read: false
      }, '', 1000);

      for (const notif of notifications) {
        await base44.entities.Notification.update(notif.id, { is_read: true });
      }

      return Response.json({ success: true });
    }

    if (action === 'deleteNotification') {
      const { notificationId } = await req.json();
      await base44.entities.Notification.delete(notificationId);
      return Response.json({ success: true });
    }

    if (action === 'getPreferences') {
      let prefs = await base44.entities.NotificationPreferences.filter({
        user_id: user.id
      }, '', 1);

      if (prefs.length === 0) {
        // Create default preferences
        prefs = await base44.entities.NotificationPreferences.create({
          user_id: user.id
        });
        return Response.json({ preferences: prefs });
      }

      return Response.json({ preferences: prefs[0] });
    }

    if (action === 'updatePreferences') {
      const { preferences } = await req.json();
      
      let prefs = await base44.entities.NotificationPreferences.filter({
        user_id: user.id
      }, '', 1);

      if (prefs.length === 0) {
        prefs = await base44.entities.NotificationPreferences.create({
          user_id: user.id,
          ...preferences
        });
      } else {
        await base44.entities.NotificationPreferences.update(prefs[0].id, preferences);
        prefs = await base44.entities.NotificationPreferences.filter({
          user_id: user.id
        }, '', 1);
      }

      return Response.json({ preferences: prefs[0] });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});