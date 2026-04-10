import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'User email required' }, { status: 400 });
    }

    // Get user settings
    const userSessions = await base44.asServiceRole.entities.UserSession.filter({
      userEmail: userEmail,
    });

    const user = userSessions?.[0];
    if (!user?.prayerReminderSettings) {
      return Response.json({ skipped: true, reason: 'No reminder settings' });
    }

    const settings = user.prayerReminderSettings;
    if (!settings.pushEnabled && !settings.emailEnabled) {
      return Response.json({ skipped: true, reason: 'Reminders disabled' });
    }

    // Fetch active prayers
    const prayers = await base44.asServiceRole.entities.PrayerRequest.filter({
      userEmail: userEmail,
      status: 'active',
    });

    const prayersToInclude = settings.includeActivePrayers
      ? prayers.slice(0, settings.activePrayerCount)
      : [];

    // Build email/push content
    const summaryText = `Take a moment to pray.\n\nYou have ${prayers.length} active prayer requests.`;
    const prayerList = prayersToInclude
      .map((p, i) => `${i + 1}. ${p.title}`)
      .join('\n');

    // Send Email
    if (settings.emailEnabled) {
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: '🙏 Take a Moment to Pray - FaithLight',
        body: `
<h2>Take a Moment to Pray</h2>
<p>You have <strong>${prayers.length} active prayer requests</strong> waiting for you.</p>
${
  prayerList
    ? `
<h3>Your Prayers:</h3>
<ul>
${prayersToInclude.map((p) => `<li><strong>${p.title}</strong></li>`).join('')}
</ul>
`
    : ''
}
<p><a href="https://faithlight.app/MyPrayerJournal">Review your prayers →</a></p>
`,
      });
    }

    // Send Push Notification (if service available)
    if (settings.pushEnabled) {
      try {
        await base44.functions.invoke('sendPushNotification', {
          userEmail: userEmail,
          title: '🙏 Prayer Time',
          body: `You have ${prayers.length} active prayers. Take a moment now.`,
          deepLink: '/MyPrayerJournal',
        });
      } catch (e) {
        console.log('Push notification not available:', e.message);
      }
    }

    return Response.json({
      success: true,
      emailSent: settings.emailEnabled,
      pushSent: settings.pushEnabled,
      prayerCount: prayers.length,
    });
  } catch (error) {
    console.error('Error sending prayer reminder:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});