import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * User starts a new quest line aligned with their spiritual journey
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quest_line_id } = await req.json();

    if (!quest_line_id) {
      return Response.json({ error: 'quest_line_id required' }, { status: 400 });
    }

    // Get quest line
    const questLines = await base44.asServiceRole.entities.QuestLine.filter(
      { id: quest_line_id, is_published: true }
    );

    if (questLines.length === 0) {
      return Response.json({ error: 'Quest line not found' }, { status: 404 });
    }

    const questLine = questLines[0];

    // Check if user already has this quest
    const existingQuests = await base44.asServiceRole.entities.UserQuest.filter({
      user_id: user.id,
      quest_line_id,
    });

    if (existingQuests.length > 0) {
      return Response.json({
        success: true,
        message: 'You are already on this quest line',
        user_quest: existingQuests[0],
      });
    }

    // Create user quest
    const userQuest = await base44.asServiceRole.entities.UserQuest.create({
      user_id: user.id,
      quest_line_id,
      current_quest_position: 1,
      quests_completed: [],
      is_active: true,
      started_at: new Date().toISOString(),
    });

    // Award starting points
    await base44.asServiceRole.entities.GamificationEvent.create({
      user_id: user.id,
      event_type: 'quest_started',
      points_awarded: 10,
      related_id: quest_line_id,
      metadata: { quest_line: questLine.title },
    });

    return Response.json({
      success: true,
      user_quest: userQuest,
      quest_line: {
        title: questLine.title,
        description: questLine.description,
        total_quests: questLine.total_quests,
        difficulty: questLine.difficulty,
      },
    });
  } catch (error) {
    console.error('Start quest line error:', error);
    return Response.json(
      { error: 'Failed to start quest', details: error.message },
      { status: 500 }
    );
  }
});