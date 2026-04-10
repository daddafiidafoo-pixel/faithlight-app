import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Update team progress and check for completion
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { group_goal_id, progress_increment } = await req.json();

    if (!group_goal_id || progress_increment === undefined) {
      return Response.json({ error: 'group_goal_id and progress_increment required' }, { status: 400 });
    }

    // Get team
    const teams = await base44.asServiceRole.entities.GroupGoal.filter(
      { id: group_goal_id }
    );

    if (teams.length === 0) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }

    const team = teams[0];

    // Get challenge
    const challenges = await base44.asServiceRole.entities.TeamChallenge.filter(
      { id: team.team_challenge_id }
    );

    const challenge = challenges[0];
    const newProgress = team.current_progress + progress_increment;
    const isCompleted = newProgress >= challenge.target_value && !team.is_completed;

    // Update team
    const updatedTeam = await base44.asServiceRole.entities.GroupGoal.update(group_goal_id, {
      current_progress: newProgress,
      is_completed: isCompleted,
      completion_date: isCompleted ? new Date().toISOString() : null,
    });

    // If completed, award points to all members
    if (isCompleted) {
      for (const memberId of team.member_ids) {
        // Award points
        await base44.asServiceRole.entities.GamificationEvent.create({
          user_id: memberId,
          event_type: 'team_goal_completed',
          points_awarded: challenge.reward_points,
          related_id: group_goal_id,
          metadata: { team_name: team.team_name },
        });

        // Award badge if defined
        if (challenge.reward_badge_id) {
          const badges = await base44.asServiceRole.entities.BadgeDefinition.filter(
            { id: challenge.reward_badge_id }
          );

          if (badges.length > 0) {
            const badge = badges[0];
            await base44.asServiceRole.entities.UserBadge.create({
              user_id: memberId,
              badge_id: badge.id,
              badge_name: badge.name,
              badge_emoji: badge.emoji,
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      updated_team: updatedTeam,
      is_completed: isCompleted,
      progress_percentage: Math.min(100, Math.round((newProgress / challenge.target_value) * 100)),
    });
  } catch (error) {
    console.error('Track team progress error:', error);
    return Response.json(
      { error: 'Failed to track progress', details: error.message },
      { status: 500 }
    );
  }
});