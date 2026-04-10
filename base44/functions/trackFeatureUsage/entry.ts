import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * trackFeatureUsage
 * 
 * Increment usage counter for a feature (AI, Bible, or Audio)
 * Call AFTER feature is used successfully
 * 
 * Body:
 * {
 *   feature: string (required) - feature key
 *   amount?: number (optional) - amount to increment (default 1)
 *     For audio.minutes_streaming: amount is seconds streamed
 *     For others: amount is typically 1
 * }
 * 
 * Returns:
 * {
 *   success: boolean,
 *   used: number,
 *   limit: number,
 *   unit: string,
 *   remaining: number
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
    const { feature, amount = 1 } = body;

    if (!feature || typeof feature !== 'string') {
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
      return Response.json({
        success: true,
        used: 0,
        limit: -1,
        unit: 'unlimited',
        remaining: -1,
      });
    }

    // Get feature config
    const config = getFeatureConfig(feature);
    if (!config) {
      return Response.json({ error: 'Unknown feature' }, { status: 400 });
    }

    // Free user: increment usage
    const today = getTodayDateString();
    let usage = await base44.asServiceRole.entities.DailyUsage.filter(
      { user_id: user.id, date: today },
      null,
      1
    ).then(r => r[0]);

    const updateData = {};
    const currentValue = usage?.[config.usageKey] || 0;
    updateData[config.usageKey] = currentValue + amount;

    if (usage) {
      await base44.asServiceRole.entities.DailyUsage.update(usage.id, updateData);
    } else {
      updateData.user_id = user.id;
      updateData.date = today;
      usage = await base44.asServiceRole.entities.DailyUsage.create(updateData);
    }

    const newUsed = updateData[config.usageKey];
    const remaining = Math.max(0, config.limit - newUsed);

    return Response.json({
      success: true,
      used: newUsed,
      limit: config.limit,
      unit: config.unit,
      remaining,
    });
  } catch (err) {
    console.error('Track usage error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});

function getFeatureConfig(feature) {
  const configs = {
    'ai.explanation': {
      usageKey: 'ai_explanation_used',
      limit: 5,
      unit: 'requests',
    },
    'ai.study_plan': {
      usageKey: 'ai_study_plan_used',
      limit: 2,
      unit: 'requests',
    },
    'ai.sermon': {
      usageKey: 'ai_sermon_used',
      limit: 1,
      unit: 'requests',
    },
    'bible.read': {
      usageKey: 'bible_seconds_read',
      limit: 1800,
      unit: 'minutes',
    },
    'audio.minutes_streaming': {
      usageKey: 'audio_seconds_streamed',
      limit: 1800,
      unit: 'minutes',
    },
  };

  return configs[feature] || null;
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}