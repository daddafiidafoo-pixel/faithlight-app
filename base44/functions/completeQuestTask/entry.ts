import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Complete a quest task and progress through quest line
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_quest_id, quest_id } = await req.json();

    if (!user_quest_id || !quest_id) {
      return Response.json({ error: 'user_quest_id and quest_id required' }, { status: 400 });
    }

    // Get user quest
    const userQuests = await base44.asServiceRole.entities.UserQuest.filter(
      { id: user_quest_id, user_id: user.id }
    );

    if (userQuests.length === 0) {
      return Response.json({ error: 'Quest not found' }, { status: 404 });
    }

    const userQuest = userQuests[0];

    // Get quest line
    const questLines = await base44.asServiceRole.entities.QuestLine.filter(
      { id: userQuest.quest_line_id }
    );

    const questLine = questLines[0];

    // Find quest in sequence
    const questInSequence = questLine.quest_sequence.find(q => q.quest_id === quest_id);

    if (!questInSequence) {
      return Response.json({ error: 'Quest not in this line' }, { status: 400 });
    }

    // Check if this is the current quest
    if (questInSequence.position !== userQuest.current_quest_position) {
      return Response.json(
        { error: 'You are not on this quest yet. Complete the previous quest first.' },
        { status: 400 }
      );
    }

    // Mark quest as completed
    const updatedQuests = [...userQuest.quests_completed, quest_id];
    const nextPosition = userQuest.current_quest_position + 1;
    const isLineCompleted = nextPosition > questLine.total_quests;

    const updatedUserQuest = await base44.asServiceRole.entities.UserQuest.update(user_quest_id, {
      quests_completed: updatedQuests,
      current_quest_position: isLineCompleted ? nextPosition : nextPosition,
      is_completed: isLineCompleted,
      completed_at: isLineCompleted ? new Date().toISOString() : null,
    });

    // Award points
    const pointsPerQuest = Math.floor(questLine.reward_points_total / questLine.total_quests);
    await base44.asServiceRole.entities.GamificationEvent.create({
      user_id: user.id,
      event_type: 'quest_completed',
      points_awarded: pointsPerQuest,
      related_id: quest_id,
      metadata: { quest_line: questLine.title, position: questInSequence.position },
    });

    // If entire line completed, award final badge
    if (isLineCompleted && questLine.final_badge_id) {
      const badges = await base44.asServiceRole.entities.BadgeDefinition.filter(
        { id: questLine.final_badge_id }
      );

      if (badges.length > 0) {
        const badge = badges[0];
        await base44.asServiceRole.entities.UserBadge.create({
          user_id: user.id,
          badge_id: badge.id,
          badge_name: badge.name,
          badge_emoji: badge.emoji,
        });

        // Award bonus points
        await base44.asServiceRole.entities.GamificationEvent.create({
          user_id: user.id,
          event_type: 'quest_line_completed',
          points_awarded: 50,
          related_id: questLine.id,
          metadata: { quest_line: questLine.title },
        });
      }
    }

    // Unlock new content if applicable
    const unlockedContent = isLineCompleted
      ? `Quest line "${questLine.title}" completed!`
      : `Proceed to next quest`;

    return Response.json({
      success: true,
      user_quest: updatedUserQuest,
      is_quest_line_completed: isLineCompleted,
      progress: `${updatedQuests.length}/${questLine.total_quests}`,
      unlocked_content: unlockedContent,
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    return Response.json(
      { error: 'Failed to complete quest', details: error.message },
      { status: 500 }
    );
  }
});