import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Send a notification to a user
 * Creates in-app notification and optionally sends email
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const {
      user_id,
      type,
      title,
      message,
      entity_type,
      entity_id,
      triggered_by_user_id,
      action_url,
      send_email = true
    } = await req.json();

    if (!user_id || !type || !title || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user preferences
    const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({
      user_id
    });

    const preference = prefs?.[0] || {};
    const inAppEnabled = preference.in_app_enabled !== false;
    const emailEnabled = preference.email_enabled !== false && send_email;

    // Check quiet hours
    const now = new Date();
    let inQuietHours = false;
    if (preference.quiet_hours_enabled && preference.quiet_hours_start && preference.quiet_hours_end) {
      const [startH, startM] = preference.quiet_hours_start.split(':').map(Number);
      const [endH, endM] = preference.quiet_hours_end.split(':').map(Number);
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = startH * 60 + startM;
      const endTime = endH * 60 + endM;
      inQuietHours = currentTime >= startTime && currentTime < endTime;
    }

    // Create in-app notification
    let notification = null;
    if (inAppEnabled && !inQuietHours) {
      notification = await base44.asServiceRole.entities.AppNotification.create({
        user_id,
        type,
        title,
        message,
        entity_type,
        entity_id,
        triggered_by_user_id,
        action_url,
        is_read: false
      });
    }

    // Send email if enabled and not in quiet hours
    if (emailEnabled && !inQuietHours) {
      const user = await base44.asServiceRole.entities.User.filter({ id: user_id });
      if (user?.[0]?.email) {
        await base44.integrations.Core.SendEmail({
          to: user[0].email,
          subject: title,
          body: `${message}\n\n${action_url ? `View: ${action_url}` : ''}`
        });
      }
    }

    return Response.json({
      success: true,
      notification,
      inAppNotified: inAppEnabled && !inQuietHours,
      emailNotified: emailEnabled && !inQuietHours
    });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});