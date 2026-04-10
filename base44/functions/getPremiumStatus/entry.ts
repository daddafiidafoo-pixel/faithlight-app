import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get user ID from query params or body
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get('user_id');
    
    let userId = userIdParam;
    
    // If no user_id param, try to get from auth
    if (!userId) {
      try {
        const user = await base44.auth.me();
        if (user?.id) {
          userId = user.id;
        }
      } catch {
        // User not authenticated
      }
    }
    
    // If still no user ID, return not premium
    if (!userId) {
      return Response.json({
        isPremium: false,
        source: null,
        current_period_end: null,
        reason: 'no_entitlement',
      });
    }

    // Query entitlements for this user
    const entitlements = await base44.asServiceRole.entities.UserEntitlement.filter(
      { user_id: userId, entitlement_type: 'faithlight_premium' },
      '-created_date',
      1
    );

    if (!entitlements || entitlements.length === 0) {
      return Response.json({
        isPremium: false,
        source: null,
        current_period_end: null,
        reason: 'no_entitlement',
      });
    }

    const entitlement = entitlements[0];

    // Check if inactive
    if (entitlement.status !== 'active') {
      return Response.json({
        isPremium: false,
        source: entitlement.source || null,
        current_period_end: entitlement.current_period_end || null,
        reason: 'inactive',
      });
    }

    // Check if expired
    if (entitlement.current_period_end) {
      const now = new Date();
      const periodEnd = new Date(entitlement.current_period_end);
      
      if (now > periodEnd) {
        return Response.json({
          isPremium: false,
          source: entitlement.source,
          current_period_end: entitlement.current_period_end,
          reason: 'expired',
        });
      }
    }

    // Premium is active
    return Response.json({
      isPremium: true,
      source: entitlement.source,
      current_period_end: entitlement.current_period_end || null,
      reason: 'active',
    });
  } catch (error) {
    console.error('Error checking premium status:', error);
    // Fail closed: treat as not premium on error
    return Response.json({
      isPremium: false,
      source: null,
      current_period_end: null,
      reason: 'no_entitlement',
    });
  }
});