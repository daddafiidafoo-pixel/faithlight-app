import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all active journal schedules
    const schedules = await base44.asServiceRole.entities.PrayerJournalSchedule.filter({
      isEnabled: true,
    });

    console.log(`Processing ${schedules.length} schedules`);

    const now = new Date();
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayOfWeek = now.getDay();

    const toSend = [];

    for (const schedule of schedules) {
      // Check if it's the right day
      if (!schedule.reminderDaysOfWeek?.includes(dayOfWeek)) {
        continue;
      }

      // Convert user's timezone to check if it's time for their reminder
      try {
        const userTimeOptions = {
          timeZone: schedule.timezone || 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        };
        const formatter = new Intl.DateTimeFormat('en-US', userTimeOptions);
        const userTime = formatter.format(now);

        // Simple time comparison (allows 5-minute window)
        const [userHour, userMin] = userTime.split(':').map(Number);
        const [scheduleHour, scheduleMin] = schedule.reminderTime.split(':').map(Number);

        const userMinTotal = userHour * 60 + userMin;
        const scheduleMinTotal = scheduleHour * 60 + scheduleMin;
        const timeDiff = Math.abs(userMinTotal - scheduleMinTotal);

        if (timeDiff <= 5) {
          toSend.push(schedule);
        }
      } catch (e) {
        console.log(`Error checking time for ${schedule.userEmail}:`, e.message);
      }
    }

    console.log(`Sending reminders to ${toSend.length} users`);

    // Send reminders
    for (const schedule of toSend) {
      try {
        // Check if reminder was already sent recently (within 23 hours)
        const lastSent = schedule.lastSentAt ? new Date(schedule.lastSentAt) : null;
        const timeSinceLastSent = lastSent ? (now - lastSent) / (1000 * 60 * 60) : Infinity;

        if (timeSinceLastSent < 23) {
          console.log(`Skipping ${schedule.userEmail} — already sent ${timeSinceLastSent.toFixed(1)} hours ago`);
          continue;
        }

        if (schedule.notificationMethod === 'push' || schedule.notificationMethod === 'both') {
          // Push notification via backend
          await sendPushNotification(schedule.userEmail);
        }

        if (schedule.notificationMethod === 'email' || schedule.notificationMethod === 'both') {
          // Email notification
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: schedule.userEmail,
            subject: '✍️ Time to Update Your Prayer Journal',
            body: `Hello! It's time to update your prayer journal. Take a moment to reflect, write your prayers, and connect with your faith. Visit your prayer journal now to add your entry.`,
          });
        }

        // Update last sent timestamp
        await base44.asServiceRole.entities.PrayerJournalSchedule.update(schedule.id, {
          lastSentAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Failed to send reminder to ${schedule.userEmail}:`, error);
      }
    }

    return Response.json({
      success: true,
      processed: schedules.length,
      sent: toSend.length,
    });
  } catch (error) {
    console.error('Error in sendDailyJournalReminder:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function sendPushNotification(userEmail) {
  // Placeholder for push notification logic
  // In production, integrate with your push notification service
  console.log(`Push notification would be sent to ${userEmail}`);
}