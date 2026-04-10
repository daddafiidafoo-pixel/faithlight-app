import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users with active reminder settings
    const allUserSessions = await base44.asServiceRole.entities.UserSession.list();

    const usersToRemind = allUserSessions.filter((user) => {
      const settings = user.prayerReminderSettings;
      return (
        settings &&
        settings.frequency !== 'none' &&
        (settings.pushEnabled || settings.emailEnabled)
      );
    });

    console.log(`Found ${usersToRemind.length} users to remind`);

    const results = [];

    for (const user of usersToRemind) {
      try {
        const result = await base44.functions.invoke('sendPrayerReminder', {
          userEmail: user.userEmail,
        });
        results.push({
          email: user.userEmail,
          status: result.data?.success ? 'sent' : 'skipped',
        });
      } catch (err) {
        console.error(`Failed to remind ${user.userEmail}:`, err);
        results.push({ email: user.userEmail, status: 'error' });
      }
    }

    return Response.json({
      success: true,
      total: usersToRemind.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in prayer reminder scheduler:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});