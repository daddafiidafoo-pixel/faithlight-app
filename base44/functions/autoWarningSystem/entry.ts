import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automated User Warning & Escalation System
 * 
 * Tracks user violations and automatically:
 * 1. Issues warnings for first offense
 * 2. Escalates to mute/ban for repeat violations
 * 3. Updates trust score
 * 4. Notifies user of actions
 */

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    let payload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const {
      userId,
      userName,
      violationCategory,
      severity,
      contentId,
      contentType,
      reason,
      moderatorId
    } = payload;

    if (!userId || !violationCategory || !severity) {
      return Response.json(
        { error: 'userId, violationCategory, severity required' },
        { status: 400 }
      );
    }

    // Fetch or create user safety profile
    let safetyProfile = await base44.asServiceRole.entities.UserSafetyProfile.filter(
      { user_id: userId },
      '-created_date',
      1
    );

    if (!safetyProfile?.length) {
      await base44.asServiceRole.entities.UserSafetyProfile.create({
        user_id: userId,
        total_warnings: 0,
        total_violations: 0,
        trust_score: 100
      });
      safetyProfile = await base44.asServiceRole.entities.UserSafetyProfile.filter(
        { user_id: userId },
        '-created_date',
        1
      );
    }

    const profile = safetyProfile[0];
    const violationCount = profile.recent_violations?.length || 0;
    const warningCount = profile.total_warnings || 0;

    // Determine action based on violation count
    let actionTaken = 'warning';
    let muteDuration = null;

    if (violationCount === 0) {
      actionTaken = 'warning';
    } else if (violationCount === 1) {
      actionTaken = 'warning';
    } else if (violationCount === 2) {
      actionTaken = severity === 'critical' ? 'muted_24h' : 'warning';
      muteDuration = 24;
    } else if (violationCount >= 3) {
      actionTaken = severity === 'critical' ? 'suspended_7d' : 'muted_24h';
      muteDuration = violationCount >= 3 ? 7 * 24 : 24;
    }

    // Create moderation action
    const moderationAction = await base44.asServiceRole.entities.ModerationAction.create({
      user_id: userId,
      user_name: userName,
      content_type: contentType || 'general',
      content_id: contentId,
      violation_category: violationCategory,
      severity: severity,
      reason: reason,
      action_taken: actionTaken,
      moderator_id: moderatorId,
      warning_count: warningCount + 1,
      is_repeat_violation: violationCount > 0,
      previous_violation_ids: profile.recent_violations || [],
      status: 'actioned'
    });

    // Calculate new trust score (decreases with violations)
    const trustScorePenalty = severity === 'critical' ? 20 : severity === 'high' ? 10 : 5;
    const newTrustScore = Math.max(profile.trust_score - trustScorePenalty, 0);

    // Update user safety profile
    const muteUntil = muteDuration
      ? new Date(Date.now() + muteDuration * 60 * 60 * 1000).toISOString()
      : null;

    await base44.asServiceRole.entities.UserSafetyProfile.update(profile.id, {
      total_warnings: warningCount + 1,
      total_violations: (profile.total_violations || 0) + 1,
      active_mute_until: actionTaken.includes('muted') || actionTaken.includes('suspended') ? muteUntil : profile.active_mute_until,
      recent_violations: [
        moderationAction.id,
        ...(profile.recent_violations || []).slice(0, 9)
      ],
      violation_history: [
        {
          category: violationCategory,
          date: new Date().toISOString(),
          action_id: moderationAction.id
        },
        ...(profile.violation_history || []).slice(0, 29)
      ],
      trust_score: newTrustScore,
      last_violation_at: new Date().toISOString()
    });

    // Determine next escalation warning
    let nextEscalation = null;
    if (violationCount === 0) {
      nextEscalation = 'Second violation will result in mute (24h)';
    } else if (violationCount === 1) {
      nextEscalation = 'Third violation will result in suspension (7 days)';
    } else if (violationCount >= 2) {
      nextEscalation = 'Additional violations may result in permanent ban';
    }

    return Response.json({
      success: true,
      moderationActionId: moderationAction.id,
      actionTaken: actionTaken,
      userTrustScore: newTrustScore,
      warningCount: warningCount + 1,
      violationCount: violationCount + 1,
      muteUntil: muteUntil,
      nextEscalation: nextEscalation,
      message: `${actionTaken === 'warning' ? 'Warning issued' : actionTaken === 'muted_24h' ? 'User muted for 24 hours' : 'User suspended for 7 days'} to ${userName}`
    });

  } catch (error) {
    console.error('Auto Warning System Error:', error);
    return Response.json(
      { error: 'Warning system failed', details: error.message },
      { status: 500 }
    );
  }
});