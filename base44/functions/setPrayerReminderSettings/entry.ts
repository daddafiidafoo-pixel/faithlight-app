import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, settings } = await req.json();

    if (!userEmail || !settings) {
      return Response.json(
        { error: 'User email and settings required' },
        { status: 400 }
      );
    }

    // Update user settings
    const userSessions = await base44.asServiceRole.entities.UserSession.filter({
      userEmail: userEmail,
    });

    if (userSessions?.length > 0) {
      await base44.asServiceRole.entities.UserSession.update(userSessions[0].id, {
        prayerReminderSettings: settings,
      });
    }

    return Response.json({ success: true, settings });
  } catch (error) {
    console.error('Error saving reminder settings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});