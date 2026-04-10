import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Initiates a 30-day free trial for a user
 * One trial per account
 * Requires no payment method for web, but payment method recommended on apps
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

    // Check if user already used trial
    if (user.trial_used) {
      return Response.json(
        { error: 'Trial already used', message: 'This account has already used its free trial.' },
        { status: 400 }
      );
    }

    // Check if user already has active trial
    if (user.subscription_status === 'trialing' && user.trial_expires_at) {
      const expiryDate = new Date(user.trial_expires_at);
      if (expiryDate > new Date()) {
        return Response.json(
          { 
            error: 'Trial already active',
            message: 'You already have an active trial',
            expiresAt: user.trial_expires_at
          },
          { status: 400 }
        );
      }
    }

    // Calculate trial dates
    const now = new Date();
    const trialExpires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Update user with trial info
    await base44.auth.updateMe({
      trial_started_at: now.toISOString(),
      trial_expires_at: trialExpires.toISOString(),
      trial_used: true,
      subscription_status: 'trialing'
    });

    return Response.json({
      success: true,
      message: '30-day free trial activated!',
      trialStartedAt: now.toISOString(),
      trialExpiresAt: trialExpires.toISOString(),
      daysRemaining: 30
    });

  } catch (error) {
    console.error('Trial Initiation Error:', error);
    return Response.json(
      { error: 'Failed to activate trial', details: error.message },
      { status: 500 }
    );
  }
});