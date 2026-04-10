import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, identityToken, userInfo } = await req.json();

    if (action === 'initiate') {
      // Return auth initiation URL
      // In production, this should redirect to Apple's OAuth endpoint
      const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=app.faithlight.signin&response_type=code&scope=name%20email&redirect_uri=${encodeURIComponent(Deno.env.get('APPLE_REDIRECT_URI') || 'https://faithlight.app/auth-callback')}`;

      return Response.json({ authUrl: appleAuthUrl });
    }

    if (action === 'verify') {
      // In production, verify the identity token with Apple's servers
      // For now, we'll trust the token and create/update user

      if (!userInfo?.email) {
        return Response.json({ error: 'Email required' }, { status: 400 });
      }

      // Check if user exists
      const existingUsers = await base44.asServiceRole.entities.User.filter({
        email: userInfo.email,
      });

      let user;
      if (existingUsers?.length > 0) {
        // User exists, just return auth
        user = existingUsers[0];
      } else {
        // Create new user with Apple sign-in
        // Note: Base44 User entity doesn't support direct creation from SDK
        // Users must be invited. Create a pending user record instead.
        console.log('New Apple user:', userInfo.email);
        // You would typically create a PendingAppleUser or similar entity
        // For now, we'll just validate the user can proceed
      }

      // Generate a simple auth token (in production, use proper JWT)
      const authToken = btoa(
        JSON.stringify({
          email: userInfo.email,
          name: userInfo.fullName,
          provider: 'apple',
          timestamp: Date.now(),
        })
      );

      return Response.json({
        success: true,
        authToken,
        user: user || {
          email: userInfo.email,
          full_name: userInfo.fullName,
          auth_provider: 'apple',
        },
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Apple Sign-In error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});