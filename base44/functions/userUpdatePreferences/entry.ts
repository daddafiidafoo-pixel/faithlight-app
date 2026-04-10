import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'PATCH') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { uiLanguage, bibleLanguage, audioLanguage, notificationsEnabled, dailyVerseTime } = await req.json();

    // Fetch and update user profile
    const profiles = await base44.entities.UserProfile.filter({ email: user.email });
    const profile = profiles?.[0];

    if (profile) {
      await base44.entities.UserProfile.update(profile.id, {
        uiLanguage: uiLanguage || profile.uiLanguage,
        bibleLanguage: bibleLanguage || profile.bibleLanguage,
        audioLanguage: audioLanguage || profile.audioLanguage,
        notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : profile.notificationsEnabled,
        dailyVerseTime: dailyVerseTime || profile.dailyVerseTime,
        updatedAt: new Date().toISOString(),
      });
    }

    return Response.json({
      success: true,
      message: 'Preferences updated',
      preferences: { uiLanguage, bibleLanguage, audioLanguage, notificationsEnabled, dailyVerseTime },
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    return Response.json({ error: 'Failed to update preferences', details: error.message }, { status: 500 });
  }
});