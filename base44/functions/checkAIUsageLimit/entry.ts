import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user entitlement
    const entitlements = await base44.entities.UserEntitlement.filter({
      user_id: user.id,
    }, '-created_date', 1);

    const entitlement = entitlements[0] || {
      tier: 'free',
      ai_messages_today: 0,
      last_reset: new Date().toISOString(),
    };

    // Check if we need to reset daily counter
    const lastReset = new Date(entitlement.last_reset);
    const today = new Date();
    const needsReset = lastReset.toDateString() !== today.toDateString();

    if (needsReset) {
      await base44.asServiceRole.entities.UserEntitlement.update(entitlement.id, {
        ai_messages_today: 0,
        last_reset: today.toISOString(),
      }).catch(() => {});
      entitlement.ai_messages_today = 0;
    }

    const limits = {
      free: 5,
      premium: 50,
    };

    const limit = limits[entitlement.tier] || 5;
    const canUse = entitlement.ai_messages_today < limit;

    return Response.json({
      canUse,
      tier: entitlement.tier,
      used: entitlement.ai_messages_today,
      limit,
      remaining: Math.max(0, limit - entitlement.ai_messages_today),
    });
  } catch (error) {
    console.error('Usage check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});