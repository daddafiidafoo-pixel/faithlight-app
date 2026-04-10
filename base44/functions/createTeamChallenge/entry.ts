import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Create a new team challenge in a course
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.user_role !== 'teacher' && user.user_role !== 'admin') {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const {
      title,
      description,
      course_id,
      challenge_type,
      target_metric,
      target_value,
      team_size_min,
      team_size_max,
      reward_points,
      reward_badge_id,
      duration_days,
    } = await req.json();

    if (!title || !course_id || !challenge_type || !target_metric || !target_value) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration_days * 24 * 60 * 60 * 1000);

    const challenge = await base44.asServiceRole.entities.TeamChallenge.create({
      title,
      description,
      course_id,
      challenge_type,
      target_metric,
      target_value,
      team_size_min: team_size_min || 2,
      team_size_max: team_size_max || 10,
      reward_points: reward_points || 50,
      reward_badge_id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      is_active: true,
    });

    // Log creation
    await base44.asServiceRole.entities.GamificationEvent.create({
      user_id: user.id,
      event_type: 'team_challenge_created',
      points_awarded: 0,
      related_id: challenge.id,
      metadata: { challenge_title: title, course_id },
    });

    return Response.json({
      success: true,
      challenge,
      duration_days,
    });
  } catch (error) {
    console.error('Create team challenge error:', error);
    return Response.json(
      { error: 'Failed to create challenge', details: error.message },
      { status: 500 }
    );
  }
});