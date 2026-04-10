import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * C-lite analytics tracking — simple KPI tracking
 * Events: plan_view, upgrade_click, upgrade_success, ai_limit_hit, streak_milestone, certificate_view
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_type, metadata = {} } = await req.json();

    // No auth required — track public events too
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      // Not authenticated, continue anyway
    }

    // Log event (can later store in AnalyticsEvent entity)
    const analyticsLog = {
      timestamp: new Date().toISOString(),
      event_type,
      user_id: user?.id || 'anonymous',
      user_email: user?.email || null,
      metadata,
    };

    console.log('[Analytics]', analyticsLog);

    // Store in AnalyticsEvent entity if exists
    try {
      if (base44.entities.AnalyticsEvent) {
        await base44.asServiceRole.entities.AnalyticsEvent.create({
          event_type,
          user_id: user?.id || null,
          metadata: JSON.stringify(metadata),
        });
      }
    } catch (error) {
      console.error('[Analytics] Failed to store event:', error.message);
      // Non-blocking — continue anyway
    }

    return Response.json({
      success: true,
      event: analyticsLog,
    });
  } catch (error) {
    console.error('[trackAnalyticsEvent] Error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }
});