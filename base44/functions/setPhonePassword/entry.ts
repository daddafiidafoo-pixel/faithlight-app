import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { phone_e164, password } = await req.json();

    if (!phone_e164 || !password) {
      return Response.json({ error: 'Missing phone_e164 or password' }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Find user by phone
    const users = await base44.asServiceRole.entities.User.filter({
      phone_e164,
      phone_verified: true,
    });

    if (!users || users.length === 0) {
      return Response.json({ 
        error: 'User not found or phone not verified. Verify OTP first.' 
      }, { status: 400 });
    }

    const user = users[0];

    // Hash password
    const passwordHash = await hashPassword(password);

    // Update user with password
    await base44.asServiceRole.entities.User.update(user.id, {
      password_hash: passwordHash,
      auth_provider: user.auth_provider === 'email' ? 'both' : 'phone',
    });

    return Response.json({
      success: true,
      message: 'Password set successfully',
      user_id: user.id,
    });
  } catch (error) {
    console.error('setPhonePassword error:', error);
    return Response.json({ error: error.message || 'Failed to set password' }, { status: 500 });
  }
});