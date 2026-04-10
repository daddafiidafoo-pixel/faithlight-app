/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Sync offline changes to server
 * Called by frontend when connectivity is restored
 */
Deno.serve(async (req) => {
  try {
    const { createClientFromRequest: createClient } = await import('npm:@base44/sdk@0.8.23');
    const base44 = createClient(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pendingChanges } = await req.json();

    if (!pendingChanges || !Array.isArray(pendingChanges)) {
      return Response.json({ error: 'Invalid pending changes' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const change of pendingChanges) {
      try {
        const { operation, entityType, data } = change;

        let result;
        switch (entityType) {
          case 'readingPlans':
            if (operation === 'create') {
              result = await base44.entities.PersonalReadingPlan.create(data);
            } else if (operation === 'update') {
              result = await base44.entities.PersonalReadingPlan.update(data.id, data);
            }
            break;

          case 'highlights':
            if (operation === 'create') {
              result = await base44.entities.UserHighlight.create(data);
            } else if (operation === 'update') {
              result = await base44.entities.UserHighlight.update(data.id, data);
            }
            break;

          case 'notes':
            if (operation === 'create') {
              result = await base44.entities.VerseNote?.create?.(data);
            } else if (operation === 'update') {
              result = await base44.entities.VerseNote?.update?.(data.id, data);
            }
            break;

          case 'quizAttempts':
            if (operation === 'create') {
              result = await base44.entities.UserQuizAttempt.create(data);
            }
            break;

          case 'bookmarks':
            if (operation === 'create') {
              // Assuming bookmarks entity or similar
              result = await base44.entities.SavedVerse?.create?.(data);
            }
            break;
        }

        results.push({
          changeId: change.id,
          entityType,
          operation,
          success: true,
          result
        });
      } catch (error) {
        console.error(`Sync error for ${change.entityType}:`, error);
        errors.push({
          changeId: change.id,
          entityType: change.entityType,
          error: error.message
        });
      }
    }

    return Response.json({
      synced: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Sync offline data error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});