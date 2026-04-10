import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch user profile
    const profiles = await base44.entities.UserProfile.filter({ email: user.email });
    const profile = profiles?.[0];

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        uiLanguage: profile?.uiLanguage || 'en',
        bibleLanguage: profile?.bibleLanguage || 'en',
        audioLanguage: profile?.audioLanguage || 'en',
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return Response.json({ error: 'Failed to fetch user', details: error.message }, { status: 500 });
  }
});