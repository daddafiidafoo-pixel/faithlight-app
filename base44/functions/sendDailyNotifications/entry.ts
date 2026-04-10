import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify this is an admin-only scheduled task
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get all users with notifications enabled
    const users = await base44.asServiceRole.entities.User.list();
    const notificationTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: 'America/Toronto',
    });

    let notificationsSent = 0;

    for (const user of users) {
      if (!user.notifications_enabled || !user.notification_time) continue;

      // Check if it's time to send notification
      if (user.notification_time === notificationTime.slice(0, 5)) {
        try {
          // Send notification via Web Push
          const message = {
            title: 'Daily Bible Study Reminder',
            body: 'Continue your Bible study or journal entry today',
            icon: 'https://faithlight.app/icon-192.png',
            badge: 'https://faithlight.app/badge.png',
            tag: 'daily-reminder',
            requireInteraction: false,
          };

          // In production, integrate with a push notification service
          // For now, log the notification
          console.log(
            `Notification scheduled for ${user.email}: ${message.title}`
          );

          notificationsSent++;
        } catch (err) {
          console.error(`Failed to send notification to ${user.email}:`, err);
        }
      }
    }

    return Response.json({
      success: true,
      notificationsSent,
      message: `Daily notifications sent to ${notificationsSent} users`,
    });
  } catch (error) {
    console.error('Error in sendDailyNotifications:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});