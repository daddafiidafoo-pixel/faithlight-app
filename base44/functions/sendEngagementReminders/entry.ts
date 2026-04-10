import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sends day-based engagement reminders to trial users
 * Called daily via automation
 * Checks trial status and sends appropriate message
 */

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    
    // Get all users with active trials
    const trialUsers = await base44.asServiceRole.entities.User.filter(
      { subscription_status: 'trialing' }
    );

    if (!trialUsers?.length) {
      return Response.json({ message: 'No active trials found', sent: 0 });
    }

    let reminders = [];

    for (const user of trialUsers) {
      if (!user.trial_started_at) continue;

      const trialStart = new Date(user.trial_started_at);
      const daysSinceStart = Math.floor((new Date() - trialStart) / (1000 * 60 * 60 * 24));
      const lastReminderSent = user.trial_reminder_sent_at ? new Date(user.trial_reminder_sent_at) : null;
      const timeSinceLastReminder = lastReminderSent 
        ? Math.floor((new Date() - lastReminderSent) / (1000 * 60 * 60)) 
        : 24;

      // Avoid duplicate sends (only one reminder per day per milestone)
      if (timeSinceLastReminder < 12) continue;

      let reminderType = null;
      let reminderMessage = null;

      switch (daysSinceStart) {
        case 3:
          reminderType = 'day_3_highlight_features';
          reminderMessage = 'Day 3: Explore advanced theology courses and see what premium unlocks.';
          break;
        case 7:
          reminderType = 'day_7_progress';
          reminderMessage = 'One week in! Check your progress dashboard to see how much you\'ve learned.';
          break;
        case 14:
          reminderType = 'day_14_offline';
          reminderMessage = 'Halfway there! Try our offline audio downloads—study anywhere, anytime.';
          break;
        case 21:
          reminderType = 'day_21_leadership';
          reminderMessage = 'Day 21: Ready to lead? Explore our leadership dashboard and tools.';
          break;
        case 25:
          reminderType = 'day_25_trial_ending';
          reminderMessage = 'Your free trial ends in 5 days. Decide if premium fits your growth.';
          break;
        case 29:
          reminderType = 'day_29_final';
          reminderMessage = 'Final day of your trial! Convert to premium or continue with free content.';
          break;
      }

      if (reminderType) {
        // Send notification (placeholder - integrate with your notification system)
        reminders.push({
          userId: user.id,
          type: reminderType,
          message: reminderMessage,
          dayOfTrial: daysSinceStart
        });

        // Update user to track reminder sent
        try {
          await base44.asServiceRole.entities.User.update(user.id, {
            trial_reminder_sent_at: new Date().toISOString()
          });
        } catch (err) {
          console.warn(`Failed to update reminder time for user ${user.id}:`, err.message);
        }
      }
    }

    return Response.json({
      success: true,
      remindersSent: reminders.length,
      reminders: reminders
    });

  } catch (error) {
    console.error('Engagement Reminder Error:', error);
    return Response.json(
      { error: 'Failed to send reminders', details: error.message },
      { status: 500 }
    );
  }
});