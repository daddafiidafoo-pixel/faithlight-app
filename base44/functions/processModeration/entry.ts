import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Process moderation actions: dismiss, remove_content, warn, suspend
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });

    const {
      action,
      report_id,
      target_type,
      target_id,
      target_owner_user_id,
      suspend_hours = 72,
      suspend_days, // legacy compat
      warn_message,
    } = await req.json();

    const validActions = ['dismiss', 'remove_content', 'warn', 'suspend', 'approve'];
    if (!validActions.includes(action)) {
      return Response.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    const now = new Date().toISOString();

    // ── 1. Load the report ────────────────────────────────────────────────────
    let report = null;
    if (report_id) {
      const reports = await base44.asServiceRole.entities.CommunityReport.filter({ id: report_id }, null, 1);
      report = reports[0] || null;
    }

    // Resolve target info from report if not explicitly provided
    const entityType = target_type || report?.target_type;
    const entityId = target_id || report?.target_id;
    const ownerUserId = target_owner_user_id || report?.target_owner_user_id;

    // ── 2. Execute action ─────────────────────────────────────────────────────
    let actionType = action;
    let message = '';

    if (action === 'dismiss' || action === 'approve') {
      // Just close the report, no user penalty
      if (report) {
        await base44.asServiceRole.entities.CommunityReport.update(report_id, {
          status: 'dismissed',
          action_taken: 'none',
          admin_user_id: user.id,
          resolved_at: now,
        });
      }
      message = 'Report dismissed';
      actionType = 'dismiss';

    } else if (action === 'remove_content') {
      // Remove the reported content
      if (entityType === 'post' && entityId) {
        await base44.asServiceRole.entities.CommunityPost.update(entityId, {
          status: 'removed',
          is_removed: true,
          removed_at: now,
          removed_by: user.id,
        }).catch(e => console.warn('Could not update post:', e.message));
      } else if (entityType === 'comment' && entityId) {
        await base44.asServiceRole.entities.PostComment.update(entityId, {
          status: 'removed',
          is_removed: true,
          removed_at: now,
          removed_by: user.id,
        }).catch(e => console.warn('Could not update comment:', e.message));
      }
      // Close report
      if (report) {
        await base44.asServiceRole.entities.CommunityReport.update(report_id, {
          status: 'actioned',
          action_taken: 'content_removed',
          admin_user_id: user.id,
          resolved_at: now,
        });
      }
      message = 'Content removed';

    } else if (action === 'warn') {
      if (!ownerUserId) return Response.json({ error: 'Missing target_owner_user_id' }, { status: 400 });

      // Update or create moderation status
      const existing = await base44.asServiceRole.entities.UserModerationStatus.filter(
        { user_id: ownerUserId }, '-updated_date', 1
      ).catch(() => []);

      if (existing[0]) {
        await base44.asServiceRole.entities.UserModerationStatus.update(existing[0].id, {
          status: 'warned',
          strike_count: (existing[0].strike_count || 0) + 1,
          last_reason: warn_message || 'Community guidelines violation',
          last_admin_user_id: user.id,
        });
      } else {
        await base44.asServiceRole.entities.UserModerationStatus.create({
          user_id: ownerUserId,
          status: 'warned',
          strike_count: 1,
          last_reason: warn_message || 'Community guidelines violation',
          last_admin_user_id: user.id,
        });
      }
      // Close report
      if (report) {
        await base44.asServiceRole.entities.CommunityReport.update(report_id, {
          status: 'actioned',
          action_taken: 'user_warned',
          admin_user_id: user.id,
          admin_notes: warn_message || null,
          resolved_at: now,
        });
      }
      message = 'User warned';

    } else if (action === 'suspend') {
      if (!ownerUserId) return Response.json({ error: 'Missing target_owner_user_id' }, { status: 400 });

      const hours = suspend_days ? suspend_days * 24 : suspend_hours;
      const suspendedUntil = new Date(Date.now() + hours * 3600 * 1000).toISOString();

      const existing = await base44.asServiceRole.entities.UserModerationStatus.filter(
        { user_id: ownerUserId }, '-updated_date', 1
      ).catch(() => []);

      if (existing[0]) {
        await base44.asServiceRole.entities.UserModerationStatus.update(existing[0].id, {
          status: 'suspended',
          suspended_until: suspendedUntil,
          strike_count: (existing[0].strike_count || 0) + 1,
          last_reason: `Suspended for ${hours}h`,
          last_admin_user_id: user.id,
        });
      } else {
        await base44.asServiceRole.entities.UserModerationStatus.create({
          user_id: ownerUserId,
          status: 'suspended',
          suspended_until: suspendedUntil,
          strike_count: 1,
          last_reason: `Suspended for ${hours}h`,
          last_admin_user_id: user.id,
        });
      }
      // Close report
      if (report) {
        await base44.asServiceRole.entities.CommunityReport.update(report_id, {
          status: 'actioned',
          action_taken: 'user_suspended',
          admin_user_id: user.id,
          resolved_at: now,
        });
      }
      message = `User suspended for ${hours} hours`;
    }

    // ── 3. Audit log ─────────────────────────────────────────────────────────
    const actionMap = {
      dismiss: 'warn_user',
      remove_content: entityType === 'comment' ? 'remove_comment' : 'remove_post',
      warn: 'warn_user',
      suspend: 'suspend_user',
    };
    await base44.asServiceRole.entities.ContentModerationAction.create({
      action: actionMap[actionType] || 'warn_user',
      admin_user_id: user.id,
      content_type: entityType || null,
      content_id: entityId || null,
      target_user_id: ownerUserId || user.id,
      note: message,
    }).catch(e => console.warn('Audit log failed:', e.message));

    return Response.json({ success: true, message });

  } catch (error) {
    console.error('processModeration error:', error);
    return Response.json({ error: error.message || 'Failed' }, { status: 500 });
  }
});