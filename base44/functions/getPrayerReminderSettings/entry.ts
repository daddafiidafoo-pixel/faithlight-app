import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'User email required' }, { status: 400 });
    }

    // Fetch user settings from UserSession or similar entity
    const userSettings = await base44.asServiceRole.entities.UserSession.filter({
      userEmail: userEmail,
    });

    const user = userSettings?.[0];
    const settings = user?.prayerReminderSettings || {
      frequency: 'daily',
      time: '08:00',
      reminderType: 'both',
      pushEnabled: true,
      emailEnabled: true,
      includeActivePrayers: true,
      activePrayerCount: 3,
    };

    return Response.json({ settings });
  } catch (error) {
    console.error('Error fetching reminder settings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});