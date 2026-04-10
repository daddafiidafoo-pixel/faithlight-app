import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Note: Base44 handles user registration through inviteUser
    // This endpoint validates and stores additional user data
    const base44 = createClientFromRequest(req);

    // Create user profile record
    const userProfile = await base44.asServiceRole.entities.UserProfile.create({
      email,
      fullName,
      uiLanguage: 'en',
      bibleLanguage: 'en',
      audioLanguage: 'en',
      createdAt: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: 'User registered successfully',
      user: { email, fullName, id: userProfile.id },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return Response.json({ error: 'Registration failed', details: error.message }, { status: 500 });
  }
});