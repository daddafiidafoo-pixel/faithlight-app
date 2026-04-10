import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * trackAIUsage
 * 
 * Increment AI usage counter for today
 * Called AFTER successful AI generation
 * 
 * Body:
 * {
 *   feature: 'explanation' | 'study_plan' | 'sermon' (required)
 * }
 * 
 * Returns: { success: boolean, used: number, limit: number }
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

    // Check if premium (skip tracking if so)
    const subscription = await base44.asServiceRole.entities.UserSubscription.filter(
      { user_id: user.id },
      null,
      1
    ).then(r => r[0]);

    if (subscription?.is_active === true) {
      // Premium user, no tracking needed
      return Response.json({ success: true, used: 0, limit: -1 });
    }

    // Free user: increment usage
    const today = new Date().toISOString().split('T')[0];
    let usage = await base44.asServiceRole.entities.DailyAIUsage.filter(
      { user_id: user.id, date: today },
      null,
      1
    ).then(r => r[0]);

    const featureKey = getFeatureKey(feature);
    const updateData = {};
    updateData[featureKey] = (usage?.[featureKey] || 0) + 1;

    if (usage) {
      await base44.asServiceRole.entities.DailyAIUsage.update(usage.id, updateData);
    } else {
      updateData.user_id = user.id;
      updateData.date = today;
      usage = await base44.asServiceRole.entities.DailyAIUsage.create(updateData);
    }

    const limit = getLimitForFeature(feature);
    const newUsed = updateData[featureKey];

    return Response.json({
      success: true,
      used: newUsed,
      limit,
    });
  } catch (err) {
    console.error('Track usage error:', err);
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