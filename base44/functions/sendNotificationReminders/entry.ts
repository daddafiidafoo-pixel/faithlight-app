import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users with notification preferences enabled
    const users = await base44.asServiceRole.entities.UserProfile.list('-updated_date', 500).catch(() => []);
    const enabledUsers = users.filter(u => u.notificationsEnabled !== false);

    let sent = 0;
    let errors = [];

    for (const user of enabledUsers) {
      try {
        // Get daily verse
        const verse = {
          reference: "Philippians 4:13",
          text: "I can do all this through him who gives me strength.",
          book: "Philippians"
        };

        // Create verse of day notification task
        await base44.asServiceRole.entities.NotificationTask.create({
          userEmail: user.email,
          taskType: 'verse_of_day',
          title: 'Daily Verse',
          content: `${verse.reference} - ${verse.text}`,
          reference: verse.reference,
          status: 'pending',
          notificationSent: false,
          preferredChannel: 'push'
        });

        // Get pending prayer requests
        const prayers = await base44.asServiceRole.entities.PrayerJournalEntry.filter({
          userEmail: user.email,
          isAnswered: false
        }).catch(() => []);

        if (prayers.length > 0) {
          const topPrayer = prayers[0];
          await base44.asServiceRole.entities.NotificationTask.create({
            userEmail: user.email,
            taskType: 'prayer_request',
            title: 'Your Prayer: ' + topPrayer.title,
            content: 'Check in on your prayer request and mark as answered if needed.',
            reference: topPrayer.id,
            status: 'pending',
            notificationSent: false,
            preferredChannel: user.notificationPreference || 'push'
          });
        }

        // Send email notification if preferred
        if (user.notificationPreference === 'email') {
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: 'Your Daily Scripture & Prayer Reminders',
            body: `Hello ${user.fullName},\n\nDaily Verse: ${verse.reference}\n${verse.text}\n\nYou have pending prayers to review. Check the app to engage with your faith journey.\n\nBlessings!`
          });
        }

        sent++;
      } catch (userError) {
        errors.push({ user: user.email, error: userError.message });
        console.error(`Error for ${user.email}:`, userError);
      }
    }

    return Response.json({
      success: true,
      sent,
      totalUsers: enabledUsers.length,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error('Reminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});