import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create entitlement
    const entitlements = await base44.asServiceRole.entities.UserEntitlement.filter({
      user_id: user.id,
    }, '-created_date', 1);

    let entitlement = entitlements[0];

    if (!entitlement) {
      entitlement = await base44.asServiceRole.entities.UserEntitlement.create({
        user_id: user.id,
        tier: 'free',
        ai_messages_today: 0,
        last_reset: new Date().toISOString(),
      });
    }

    // Check if we need to reset daily counter
    const lastReset = new Date(entitlement.last_reset);
    const today = new Date();
    const needsReset = lastReset.toDateString() !== today.toDateString();

    if (needsReset) {
      await base44.asServiceRole.entities.UserEntitlement.update(entitlement.id, {
        ai_messages_today: 1,
        last_reset: today.toISOString(),
      });
    } else {
      await base44.asServiceRole.entities.UserEntitlement.update(entitlement.id, {
        ai_messages_today: (entitlement.ai_messages_today || 0) + 1,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Increment usage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});