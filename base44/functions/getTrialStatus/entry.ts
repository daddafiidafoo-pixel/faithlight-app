import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get current trial status for user
 * Returns days remaining, whether trial is active, etc.
 */

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // No trial data
    if (!user.trial_expires_at) {
      return Response.json({
        isActive: false,
        hasUsedTrial: user.trial_used || false,
        daysRemaining: 0,
        expiresAt: null,
        canStartTrial: !user.trial_used
      });
    }

    const now = new Date();
    const expiryDate = new Date(user.trial_expires_at);
    const daysRemaining = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));
    const isActive = daysRemaining > 0 && user.subscription_status === 'trialing';

    return Response.json({
      isActive,
      hasUsedTrial: user.trial_used,
      daysRemaining,
      expiresAt: user.trial_expires_at,
      startedAt: user.trial_started_at,
      canStartTrial: !user.trial_used && !isActive
    });

  } catch (error) {
    console.error('Trial Status Error:', error);
    return Response.json(
      { error: 'Failed to get trial status', details: error.message },
      { status: 500 }
    );
  }
});