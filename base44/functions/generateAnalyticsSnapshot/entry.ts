import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate daily analytics snapshot
 * Run daily via automation to capture metrics
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only allow admins to generate analytics
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const snapshotType = 'daily';
    const snapshotDate = new Date().toISOString();

    // Get user metrics
    const allUsers = await base44.asServiceRole.entities.User.list();
    const totalUsers = allUsers?.length || 0;

    // Active users (logged in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const activeUsers = await base44.asServiceRole.entities.ActivityLog.filter({
      created_date: { $gte: oneDayAgo }
    });
    const uniqueActiveUserIds = [...new Set(activeUsers?.map(a => a.user_id) || [])];
    const activeUserCount = uniqueActiveUserIds.length;

    // Group metrics
    const allGroups = await base44.asServiceRole.entities.Group.list();
    const totalGroups = allGroups?.length || 0;

    // Active groups (had activity in last 24h)
    const activeGroupActivity = await base44.asServiceRole.entities.ActivityLog.filter({
      entity_type: 'Group',
      created_date: { $gte: oneDayAgo }
    });
    const activeGroupIds = [...new Set(activeGroupActivity?.map(a => a.group_id)?.filter(Boolean) || [])];
    const activeGroupCount = activeGroupIds.length;

    // Live events
    const liveEvents = await base44.asServiceRole.entities.LiveEvent.list();
    const totalLiveEvents = liveEvents?.length || 0;

    // Posts/activity
    const activityLogs = await base44.asServiceRole.entities.ActivityLog.list();
    const activityInPeriod = activityLogs?.filter(a => 
      new Date(a.created_date) >= new Date(oneDayAgo)
    ) || [];

    // Count by action type
    const topActions = {};
    activityInPeriod.forEach(a => {
      topActions[a.action_type] = (topActions[a.action_type] || 0) + 1;
    });

    // Engagement rate
    const engagementRate = totalUsers > 0 ? Math.round((activeUserCount / totalUsers) * 100) : 0;

    // Most active entities
    const entityActivity = {};
    activityInPeriod.forEach(a => {
      const key = `${a.entity_type}:${a.entity_id}`;
      entityActivity[key] = (entityActivity[key] || 0) + 1;
    });

    const mostActiveEntities = Object.entries(entityActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => {
        const [entityType, entityId] = key.split(':');
        return { entity_type: entityType, entity_id: entityId, activity_count: count };
      });

    // Create snapshot
    const snapshot = await base44.asServiceRole.entities.AnalyticsSnapshot.create({
      snapshot_date: snapshotDate,
      snapshot_type: snapshotType,
      total_users: totalUsers,
      active_users: activeUserCount,
      total_groups: totalGroups,
      active_groups: activeGroupCount,
      total_live_events: totalLiveEvents,
      total_posts: activityInPeriod.length,
      engagement_rate: engagementRate,
      most_active_entities: mostActiveEntities,
      top_actions: topActions
    });

    return Response.json({ success: true, snapshot });
  } catch (error) {
    console.error('Analytics generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});