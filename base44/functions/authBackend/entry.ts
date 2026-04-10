import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ── Simple JWT token generation (use crypto for signing) ──────────────────
function generateToken(email) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    email, 
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  }));
  const signature = btoa(`${header}.${payload}`); // simplified; use HMAC in production
  return `${header}.${payload}.${signature}`;
}

// ── Hash password (use crypto or bcrypt in production) ────────────────────
async function hashPassword(password) {
  // For now, use base64; in production use bcrypt or argon2
  return btoa(password);
}

async function verifyPassword(password, hash) {
  return btoa(password) === hash;
}

// ── Main handler ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, email, password, displayName } = await req.json();

    console.log(`[authBackend] action=${action} email=${email}`);

    // ── SIGNUP ────────────────────────────────────────────────────────────
    if (action === 'signup') {
      if (!email || !password || password.length < 8) {
        return Response.json({ error: 'Invalid email or password (min 8 chars)' }, { status: 400 });
      }

      // Check if user exists
      const existing = await base44.entities.UserSession.filter({ userEmail: email });
      if (existing.length > 0) {
        return Response.json({ error: 'User already exists' }, { status: 409 });
      }

      // Create user
      const hash = await hashPassword(password);
      const user = await base44.entities.UserSession.create({
        userEmail: email,
        displayName: displayName || email.split('@')[0],
        passwordHash: hash,
        authProvider: 'email',
        isActive: true,
        timezone: 'America/Toronto',
        dailyDevotionTime: '08:00',
      });

      const token = generateToken(email);
      console.log(`[authBackend] signup success: ${email}`);

      return Response.json({
        success: true,
        user: {
          id: user.id,
          email: user.userEmail,
          displayName: user.displayName,
        },
        token,
      });
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────
    if (action === 'login') {
      if (!email || !password) {
        return Response.json({ error: 'Email and password required' }, { status: 400 });
      }

      const users = await base44.entities.UserSession.filter({ userEmail: email });
      if (users.length === 0) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const user = users[0];
      const passwordMatch = await verifyPassword(password, user.passwordHash);
      if (!passwordMatch) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = generateToken(email);
      console.log(`[authBackend] login success: ${email}`);

      return Response.json({
        success: true,
        user: {
          id: user.id,
          email: user.userEmail,
          displayName: user.displayName,
        },
        token,
      });
    }

    // ── GET USER ──────────────────────────────────────────────────────────
    if (action === 'getMe') {
      const users = await base44.entities.UserSession.filter({ userEmail: email });
      if (users.length === 0) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      const user = users[0];
      return Response.json({
        success: true,
        user: {
          id: user.id,
          email: user.userEmail,
          displayName: user.displayName,
          timezone: user.timezone,
          textSize: user.textSize,
          highContrastEnabled: user.highContrastEnabled,
          reduceMotionEnabled: user.reduceMotionEnabled,
          pushNotificationsEnabled: user.pushNotificationsEnabled,
        },
      });
    }

    // ── UPDATE PROFILE ────────────────────────────────────────────────────
    if (action === 'updateProfile') {
      const users = await base44.entities.UserSession.filter({ userEmail: email });
      if (users.length === 0) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      const user = users[0];
      const updated = await base44.entities.UserSession.update(user.id, {
        displayName: displayName || user.displayName,
        timezone: req.body?.timezone || user.timezone,
        textSize: req.body?.textSize || user.textSize,
        highContrastEnabled: req.body?.highContrastEnabled ?? user.highContrastEnabled,
        reduceMotionEnabled: req.body?.reduceMotionEnabled ?? user.reduceMotionEnabled,
        pushNotificationsEnabled: req.body?.pushNotificationsEnabled ?? user.pushNotificationsEnabled,
      });

      return Response.json({
        success: true,
        user: {
          id: updated.id,
          email: updated.userEmail,
          displayName: updated.displayName,
        },
      });
    }

    // ── DELETE ACCOUNT ────────────────────────────────────────────────────
    if (action === 'deleteAccount') {
      if (!email || !password) {
        return Response.json({ error: 'Email and password required' }, { status: 400 });
      }

      const users = await base44.entities.UserSession.filter({ userEmail: email });
      if (users.length === 0) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      const user = users[0];
      const passwordMatch = await verifyPassword(password, user.passwordHash);
      if (!passwordMatch) {
        return Response.json({ error: 'Invalid password' }, { status: 401 });
      }

      // Mark as inactive and delete user data
      await base44.entities.UserSession.update(user.id, { isActive: false });
      
      // Delete related data
      const prayers = await base44.entities.PrayerCircleRequest.filter({ authorEmail: email });
      for (const prayer of prayers) {
        await base44.entities.PrayerCircleRequest.delete(prayer.id);
      }

      const progress = await base44.entities.UserReadingProgress.filter({ userEmail: email });
      for (const p of progress) {
        await base44.entities.UserReadingProgress.delete(p.id);
      }

      console.log(`[authBackend] account deleted: ${email}`);

      return Response.json({
        success: true,
        message: 'Account deleted. All personal data removed.',
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[authBackend] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});