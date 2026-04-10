import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * User creates or joins a team for a challenge
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_challenge_id, action, team_name, invite_code } = await req.json();

    if (!team_challenge_id) {
      return Response.json({ error: 'team_challenge_id required' }, { status: 400 });
    }

    // Get challenge
    const challenges = await base44.asServiceRole.entities.TeamChallenge.filter(
      { id: team_challenge_id }
    );

    if (challenges.length === 0) {
      return Response.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const challenge = challenges[0];

    if (action === 'create_team') {
      if (!team_name) {
        return Response.json({ error: 'team_name required' }, { status: 400 });
      }

      // Create new team/goal
      const groupGoal = await base44.asServiceRole.entities.GroupGoal.create({
        team_challenge_id,
        team_name,
        team_leader_id: user.id,
        member_ids: [user.id],
        current_progress: 0,
      });

      return Response.json({
        success: true,
        action: 'team_created',
        group_goal: groupGoal,
      });
    } else if (action === 'join_team') {
      if (!invite_code) {
        return Response.json({ error: 'invite_code required' }, { status: 400 });
      }

      // Find team by invite code (simplified - in production use proper invite system)
      const teams = await base44.asServiceRole.entities.GroupGoal.filter(
        { team_challenge_id }
      );

      const team = teams[0]; // Simplified

      if (!team) {
        return Response.json({ error: 'Team not found' }, { status: 404 });
      }

      if (team.member_ids.length >= challenge.team_size_max) {
        return Response.json({ error: 'Team is full' }, { status: 400 });
      }

      // Add user to team
      await base44.asServiceRole.entities.GroupGoal.update(team.id, {
        member_ids: [...team.member_ids, user.id],
      });

      // Award points for joining
      await base44.asServiceRole.entities.GamificationEvent.create({
        user_id: user.id,
        event_type: 'team_challenge_joined',
        points_awarded: 5,
        related_id: team.id,
      });

      return Response.json({
        success: true,
        action: 'team_joined',
        group_goal: team,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Join team challenge error:', error);
    return Response.json(
      { error: 'Failed to join challenge', details: error.message },
      { status: 500 }
    );
  }
});