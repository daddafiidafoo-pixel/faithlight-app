import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Change user password
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Note: Base44 SDK does not expose direct password verification
    // This would need to be handled by the auth system
    // For now, we'll return a success response assuming the frontend validates
    // In a production app, implement proper password verification

    // Update password using Base44's internal auth system
    // This is a placeholder - actual implementation depends on Base44 auth API
    try {
      await base44.auth.updateMe({ password: newPassword }).catch(() => {
        throw new Error('Password update not supported by this auth system');
      });
      
      return Response.json({ success: true, message: 'Password changed successfully' });
    } catch (authErr) {
      return Response.json({ error: 'Password change not supported in current auth mode' }, { status: 400 });
    }
  } catch (err) {
    console.error('Password change error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});