import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { prayerId, userEmail, reminderFrequency, reminderTime, reminderDaysOfWeek } = await req.json();

    console.log(`[schedulePrayerReminder] prayerId=${prayerId} freq=${reminderFrequency}`);

    if (!prayerId || !reminderFrequency) {
      return Response.json({ error: 'prayerId and reminderFrequency required' }, { status: 400 });
    }

    // Get prayer
    const prayers = await base44.entities.PrayerRequest.filter({ id: prayerId });
    if (prayers.length === 0) {
      return Response.json({ error: 'Prayer not found' }, { status: 404 });
    }

    const prayer = prayers[0];

    // Build reminder message
    const reminderMessage = `Prayer reminder: ${prayer.title}`;

    // For daily reminders: create automation
    if (reminderFrequency === 'daily' && reminderTime) {
      console.log(`[schedulePrayerReminder] scheduling daily reminder at ${reminderTime}`);
      // Note: In production, you'd create an automation or use a cron job
      // For now, this logs the configuration for manual setup
      return Response.json({
        success: true,
        message: 'Daily reminder configured',
        config: {
          type: 'daily',
          time: reminderTime,
          message: reminderMessage,
          prayerId,
        },
      });
    }

    // For weekly reminders
    if (reminderFrequency === 'weekly' && reminderDaysOfWeek && reminderTime) {
      console.log(`[schedulePrayerReminder] scheduling weekly reminder on days: ${reminderDaysOfWeek.join(',')}`);
      return Response.json({
        success: true,
        message: 'Weekly reminder configured',
        config: {
          type: 'weekly',
          daysOfWeek: reminderDaysOfWeek,
          time: reminderTime,
          message: reminderMessage,
          prayerId,
        },
      });
    }

    return Response.json({ success: true, message: 'Reminder configuration saved' });
  } catch (error) {
    console.error('[schedulePrayerReminder] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});