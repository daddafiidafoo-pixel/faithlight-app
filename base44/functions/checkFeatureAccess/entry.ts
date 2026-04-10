/**
 * checkFeatureAccess
 * 
 * Backend function that checks if a user can access a feature.
 * Called from frontend via base44.functions.invoke()
 * 
 * Returns: {allowed, reason, used, limit, resets_at, upgrade_cta}
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PREMIUM_ONLY_FEATURES = [
  'academy.diploma',
  'certificates.download',
  'sermon.tools.advanced',
  'ai.unlimited',
];

const LIMITED_FEATURES = {
  'bible.read_minutes': { daily_limit: 60, context: 'Bible reading minutes' },
  'audio.stream_minutes': { daily_limit: 30, context: 'Audio streaming minutes' },
  'ai.explain_passage': { daily_limit: 5, context: 'AI explanations' },
  'ai.study_plan_generate': { daily_limit: 3, context: 'AI study plans' },
  'ai.sermon_builder_generate': { daily_limit: 5, context: 'AI sermon generations' },
};

// Create DailyUsage entity if not exists
async function ensureDailyUsageEntity(base44) {
  try {
    // Try to query it; if it fails, the entity will be created on first insert
    await base44.asServiceRole.entities.DailyUsage.list();
  } catch {
    // Entity might not exist yet, that's okay
  }
}

function isPremium(userSubscription) {
  if (!userSubscription) return false;
  const now = new Date();
  const periodEnd = new Date(userSubscription.current_period_end);
  return userSubscription.status === 'active' && periodEnd > now;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { featureKey } = body;

    if (!featureKey) {
      return Response.json(
        { error: 'featureKey is required' },
        { status: 400 }
      );
    }

    // Get current user — never throw, this is a public app
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      // Not logged in — continue as guest
    }

    // If no user, return permissive defaults for limited features (no DB calls needed)
    if (!user) {
      if (PREMIUM_ONLY_FEATURES.includes(featureKey)) {
        return Response.json({ allowed: false, reason: 'premium_required', used: null, limit: null, resets_at: null, upgrade_cta: true });
      }
      if (LIMITED_FEATURES[featureKey]) {
        return Response.json({ allowed: true, reason: 'ok', used: 0, limit: LIMITED_FEATURES[featureKey].daily_limit, resets_at: null, upgrade_cta: false });
      }
      return Response.json({ allowed: true, reason: 'ok', used: null, limit: null, resets_at: null, upgrade_cta: false });
    }

    // Check premium status
    let userSubscription = null;
    if (user?.id) {
      try {
        const subs = await base44.asServiceRole.entities.UserSubscription.filter({
          user_id: user.id,
          status: 'active',
        });
        if (subs.length > 0) {
          userSubscription = subs[0];
        }
      } catch (err) {
        console.warn('UserSubscription lookup failed:', err.message);
      }
    }

    const premium = isPremium(userSubscription);

    // Rule 1: Premium-only features
    if (PREMIUM_ONLY_FEATURES.includes(featureKey)) {
      if (!premium) {
        return Response.json({
          allowed: false,
          reason: 'premium_required',
          used: null,
          limit: null,
          resets_at: null,
          upgrade_cta: true,
        });
      }
      // Premium user: allowed
      return Response.json({
        allowed: true,
        reason: 'ok',
        used: null,
        limit: null,
        resets_at: null,
        upgrade_cta: false,
      });
    }

    // Rule 2: Limited features (daily caps)
    if (LIMITED_FEATURES[featureKey]) {
      const limitConfig = LIMITED_FEATURES[featureKey];
      const dailyLimit = premium ? null : limitConfig.daily_limit;

      if (premium) {
        // Premium: unlimited
        return Response.json({
          allowed: true,
          reason: 'ok',
          used: 0,
          limit: null,
          resets_at: null,
          upgrade_cta: false,
        });
      }

      const today = new Date().toISOString().split('T')[0];
      let usage = [];
      try {
        usage = await base44.asServiceRole.entities.DailyUsage.filter({
          user_id: user.id,
          feature_key: featureKey,
          date: today,
        });
      } catch (err) {
        console.warn('DailyUsage lookup failed:', err.message);
      }

      let used = 0;
      if (usage.length > 0) {
        used = usage[0].count || 0;
      }

      const remaining = Math.max(0, dailyLimit - used);
      const allowed = remaining > 0;

      // Calculate reset time (midnight UTC)
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      tomorrow.setUTCHours(0, 0, 0, 0);

      return Response.json({
        allowed,
        reason: allowed ? 'ok' : 'limit_reached',
        used,
        limit: dailyLimit,
        resets_at: tomorrow.toISOString(),
        upgrade_cta: !allowed,
      });
    }

    // Rule 3: Free features (always allowed)
    return Response.json({
      allowed: true,
      reason: 'ok',
      used: null,
      limit: null,
      resets_at: null,
      upgrade_cta: false,
    });
  } catch (error) {
    console.error('checkFeatureAccess error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});