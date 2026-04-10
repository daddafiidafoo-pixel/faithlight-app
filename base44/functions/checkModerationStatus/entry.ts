/**
 * checkModerationStatus
 * 
 * Check if user is suspended/warned before posting
 * 
 * Returns:
 * {
 *   status: 'active' | 'warned' | 'suspended',
 *   suspended_until: datetime | null,
 *   message: string
 * }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user moderation status
    const modStatus = await base44.entities.UserModerationStatus.filter({
      user_id: user.id,
    });

    if (modStatus.length === 0) {
      // No moderation record = active
      return Response.json({
        status: 'active',
        message: null,
      });
    }

    const status = modStatus[0];
    const now = new Date();
    const suspendedUntil = status.suspended_until ? new Date(status.suspended_until) : null;

    // Check if suspension has expired
    if (status.status === 'suspended' && suspendedUntil && suspendedUntil < now) {
      // Unsuspend user
      await base44.entities.UserModerationStatus.update(status.id, {
        status: 'active',
        suspended_until: null,
      });
      return Response.json({
        status: 'active',
        message: null,
      });
    }

    // Return current status
    return Response.json({
      status: status.status,
      suspended_until: status.suspended_until,
      message:
        status.status === 'suspended'
          ? `Your account is suspended until ${new Date(suspendedUntil).toLocaleDateString()}.`
          : status.status === 'warned'
          ? 'Your account has received a warning. Please follow community guidelines.'
          : null,
    });
  } catch (error) {
    console.error('checkModerationStatus error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});