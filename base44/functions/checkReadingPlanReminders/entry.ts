import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Scheduled function: runs every 5 minutes.
 * Finds all users whose reading plan reminder time matches the current UTC time window
 * and creates an in-app AppNotification for them.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled calls (no user auth) using service role
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentDayOfWeek = now.getUTCDay(); // 0=Sun, 6=Sat

    // Format current time as HH:MM for comparison
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    // Fetch all notification preferences with reading plan reminders enabled
    const allPrefs = await base44.asServiceRole.entities.NotificationPreference.filter({
      reading_plan_reminder_enabled: true
    }).catch(() => []);

    if (!allPrefs.length) {
      return Response.json({ triggered: 0, message: 'No reading plan reminders configured' });
    }

    let triggered = 0;

    for (const pref of allPrefs) {
      const reminderTime = pref.reading_plan_reminder_time || '08:00';
      const reminderDays = pref.reading_reminder_days ?? [0, 1, 2, 3, 4, 5, 6];

      // Check if current time matches within a 5-min window
      const [h, m] = reminderTime.split(':').map(Number);
      const reminderMinutesTotal = h * 60 + m;
      const currentMinutesTotal = currentHour * 60 + currentMinute;
      const withinWindow = Math.abs(currentMinutesTotal - reminderMinutesTotal) <= 4;

      if (!withinWindow) continue;
      if (!reminderDays.includes(currentDayOfWeek)) continue;

      // Avoid duplicate notifications within same hour
      const recentNotifs = await base44.asServiceRole.entities.AppNotification.filter({
        user_id: pref.user_id,
        type: 'reading_plan_reminder',
      }, '-created_date', 1).catch(() => []);

      if (recentNotifs.length > 0) {
        const lastNotif = new Date(recentNotifs[0].created_date);
        const hoursSince = (now - lastNotif) / (1000 * 60 * 60);
        if (hoursSince < 23) continue; // Already sent today
      }

      // Create in-app notification
      await base44.asServiceRole.entities.AppNotification.create({
        user_id: pref.user_id,
        type: 'reading_plan_reminder',
        title: '📖 Time for your daily reading!',
        message: 'You have an active reading plan. Keep your streak going!',
        action_url: '/ReadingPlans',
        is_read: false,
      });

      triggered++;
      console.log(`Triggered reading plan reminder for user: ${pref.user_id}`);
    }

    return Response.json({ triggered, checked: allPrefs.length, time: currentTimeStr });
  } catch (error) {
    console.error('checkReadingPlanReminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});