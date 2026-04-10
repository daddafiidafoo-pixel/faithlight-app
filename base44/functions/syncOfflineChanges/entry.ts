import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sync offline changes (completed lessons, notes, quiz attempts) to server
 * Called when user comes back online
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, sync_items } = await req.json();

    if (!user_id || !sync_items || !Array.isArray(sync_items)) {
      return Response.json({ error: 'user_id and sync_items array required' }, { status: 400 });
    }

    const results = [];
    let points_awarded = 0;

    // Process each sync item
    for (const item of sync_items) {
      try {
        const { action_type, entity_type, entity_id, payload, sync_id } = item;

        let syncedRecord = null;

        // Handle different action types
        switch (action_type) {
          case 'lesson_completed':
            // Update lesson progress
            const existingProgress = await base44.asServiceRole.entities.UserLessonProgress.filter(
              { user_id, lesson_id: entity_id }
            );

            if (existingProgress.length > 0) {
              await base44.asServiceRole.entities.UserLessonProgress.update(
                existingProgress[0].id,
                {
                  is_completed: true,
                  completed_at: payload.completed_at || new Date().toISOString(),
                  time_spent_minutes: payload.time_spent_minutes,
                }
              );
            } else {
              syncedRecord = await base44.asServiceRole.entities.UserLessonProgress.create({
                user_id,
                lesson_id: entity_id,
                is_completed: true,
                completed_at: payload.completed_at || new Date().toISOString(),
                time_spent_minutes: payload.time_spent_minutes || 0,
              });
            }

            // Award points for completion
            await base44.functions.invoke('awardPoints', {
              user_id,
              event_type: 'lesson_completed',
              points: 25,
              related_id: entity_id,
            });
            points_awarded += 25;

            // Check for badge milestone
            await base44.functions.invoke('checkMilestoneAndAwardBadge', {
              user_id,
              milestone_type: 'lesson_count',
              milestone_value: payload.total_lessons_completed,
            });
            break;

          case 'note_saved':
            // Save lesson note
            syncedRecord = await base44.asServiceRole.entities.LessonNote.create({
              user_id,
              lesson_id: entity_id,
              content: payload.note_content,
            });
            break;

          case 'quiz_attempted':
            // Save quiz result
            syncedRecord = await base44.asServiceRole.entities.UserQuizResult.create({
              user_id,
              quiz_id: entity_id,
              score: payload.score,
              answers: payload.answers,
              completed_at: payload.completed_at || new Date().toISOString(),
            });
            break;

          case 'progress_updated':
            // Update general progress
            const progressRecords = await base44.asServiceRole.entities.UserProgress.filter({
              user_id,
            });
            if (progressRecords.length > 0) {
              await base44.asServiceRole.entities.UserProgress.update(
                progressRecords[0].id,
                payload
              );
            }
            break;
        }

        // Create sync queue record for tracking
        const syncQueueItem = await base44.asServiceRole.entities.SyncQueue.create({
          user_id,
          action_type,
          entity_type,
          entity_id,
          payload,
          is_synced: true,
          synced_at: new Date().toISOString(),
        });

        results.push({
          sync_id,
          status: 'success',
          action: action_type,
          synced_record_id: syncedRecord?.id || syncQueueItem.id,
        });
      } catch (error) {
        console.error(`Sync error for item: ${JSON.stringify(item)}`, error);
        results.push({
          sync_id: item.sync_id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return Response.json({
      success: true,
      synced_items: results.length,
      total_synced: results.filter(r => r.status === 'success').length,
      total_failed: results.filter(r => r.status === 'error').length,
      points_awarded,
      results,
      sync_timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json(
      { error: 'Failed to sync offline changes', details: error.message },
      { status: 500 }
    );
  }
});