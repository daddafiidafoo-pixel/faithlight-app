import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * checkAIUsage
 * 
 * Check if user can use a specific AI feature today
 * 
 * Body:
 * {
 *   feature: 'explanation' | 'study_plan' | 'sermon' (required)
 * }
 * 
 * Returns:
 * {
 *   canUse: boolean,
 *   used: number,
 *   limit: number,
 *   isPremium: boolean
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'POST only' }, { status: 405 });
    }

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { feature } = body;

    if (!feature || !['explanation', 'study_plan', 'sermon'].includes(feature)) {
      return Response.json({ error: 'Invalid feature' }, { status: 400 });
    }

    // Check premium status
    const subscription = await base44.asServiceRole.entities.UserSubscription.filter(
      { user_id: user.id }
    ).then(r => r[0]).catch(() => null);

    const isPremium = subscription?.is_active === true;

    // If premium, always allow
    if (isPremium) {
      return Response.json({
        canUse: true,
        used: 0,
        limit: -1, // unlimited
        isPremium: true,
      });
    }

    // Free user: check daily usage
    const today = new Date().toISOString().split('T')[0];
    const usage = await base44.asServiceRole.entities.DailyAIUsage.filter(
      { user_id: user.id, date: today }
    ).then(r => r[0]).catch(() => null);

    if (!usage) {
      // First use today
      await base44.asServiceRole.entities.DailyAIUsage.create({
        user_id: user.id,
        date: today,
      });

      return Response.json({
        canUse: true,
        used: 0,
        limit: getLimitForFeature(feature),
        isPremium: false,
      });
    }

    // Check usage against limit
    const featureKey = getFeatureKey(feature);
    const used = usage[featureKey];
    const limit = usage[`${featureKey}_limit`];

    return Response.json({
      canUse: used < limit,
      used,
      limit,
      isPremium: false,
    });
  } catch (err) {
    console.error('Check usage error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});

function getFeatureKey(feature) {
  switch (feature) {
    case 'explanation':
      return 'explanations_used';
    case 'study_plan':
      return 'study_plans_used';
    case 'sermon':
      return 'sermons_used';
    default:
      return 'explanations_used';
  }
}

function getLimitForFeature(feature) {
  switch (feature) {
    case 'explanation':
      return 5;
    case 'study_plan':
      return 2;
    case 'sermon':
      return 1;
    default:
      return 5;
  }
}