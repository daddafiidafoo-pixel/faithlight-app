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

    // Find user by phone
    const users = await base44.asServiceRole.entities.User.filter({
      phone_e164,
      phone_verified: true,
    });

    if (!users || users.length === 0) {
      return Response.json({ 
        error: 'User not found or phone not verified' 
      }, { status: 401 });
    }

    const user = users[0];

    // Verify password
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.password_hash) {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    // In a real app, you'd create a session token here
    // For now, return user info (frontend will handle auth via Base44 SDK)
    return Response.json({
      success: true,
      message: 'Login successful',
      user_id: user.id,
      phone_e164: user.phone_e164,
      full_name: user.full_name,
    });
  } catch (error) {
    console.error('phoneLogin error:', error);
    return Response.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
});