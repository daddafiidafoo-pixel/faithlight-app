import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Award points to user for completing activities
 * Called when lessons/courses completed, posts created, etc.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, event_type, points, related_id, metadata } = await req.json();

    if (!user_id || !event_type || !points) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create user points record
    const userPointsRecords = await base44.asServiceRole.entities.UserPoints.filter({
      user_id,
    });

    let userPoints;
    if (userPointsRecords.length > 0) {
      userPoints = userPointsRecords[0];
      await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
        total_points: (userPoints.total_points || 0) + points,
        lifetime_points: (userPoints.lifetime_points || 0) + points,
        points_this_week: (userPoints.points_this_week || 0) + points,
        points_this_month: (userPoints.points_this_month || 0) + points,
        last_updated: new Date().toISOString(),
      });
      userPoints = {
        ...userPoints,
        total_points: (userPoints.total_points || 0) + points,
        lifetime_points: (userPoints.lifetime_points || 0) + points,
      };
    } else {
      userPoints = await base44.asServiceRole.entities.UserPoints.create({
        user_id,
        total_points: points,
        lifetime_points: points,
        points_this_week: points,
        points_this_month: points,
      });
    }

    // Log the event
    await base44.asServiceRole.entities.GamificationEvent.create({
      user_id,
      event_type,
      points_awarded: points,
      related_id: related_id || '',
      metadata: metadata || {},
    });

    return Response.json({
      success: true,
      user_points: userPoints,
      points_awarded: points,
    });
  } catch (error) {
    console.error('Points award error:', error);
    return Response.json(
      { error: 'Failed to award points', details: error.message },
      { status: 500 }
    );
  }
});