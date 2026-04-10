import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Syncs offline progress with backend when user comes online
 * Uploads: lesson progress, notes, bookmarks, quiz attempts
 */

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const {
      syncItems = [],
      pendingProgress = [],
      pendingNotes = [],
      pendingBookmarks = []
    } = payload;

    const syncResults = {
      progressSynced: 0,
      notesSynced: 0,
      bookmarksSynced: 0,
      errors: []
    };

    // Sync lesson progress
    for (const progress of pendingProgress) {
      try {
        const existing = await base44.asServiceRole.entities.UserLessonProgress.filter({
          user_id: user.id,
          lesson_id: progress.lesson_id
        }, '-created_date', 1);

        if (existing?.length) {
          await base44.asServiceRole.entities.UserLessonProgress.update(existing[0].id, {
            completed: progress.completed,
            time_spent_minutes: progress.time_spent_minutes,
            completion_percentage: progress.completion_percentage,
            last_accessed_at: new Date().toISOString()
          });
        } else {
          await base44.asServiceRole.entities.UserLessonProgress.create({
            user_id: user.id,
            lesson_id: progress.lesson_id,
            completed: progress.completed,
            time_spent_minutes: progress.time_spent_minutes,
            completion_percentage: progress.completion_percentage,
            last_accessed_at: new Date().toISOString()
          });
        }
        syncResults.progressSynced++;
      } catch (err) {
        syncResults.errors.push({
          type: 'progress',
          itemId: progress.lesson_id,
          error: err.message
        });
      }
    }

    // Sync notes
    for (const note of pendingNotes) {
      try {
        const existing = await base44.asServiceRole.entities.LessonNote.filter({
          user_id: user.id,
          lesson_id: note.lesson_id
        }, '-created_date', 1);

        if (existing?.length) {
          await base44.asServiceRole.entities.LessonNote.update(existing[0].id, {
            content: note.content,
            last_edited_at: new Date().toISOString()
          });
        } else {
          await base44.asServiceRole.entities.LessonNote.create({
            user_id: user.id,
            lesson_id: note.lesson_id,
            content: note.content
          });
        }
        syncResults.notesSynced++;
      } catch (err) {
        syncResults.errors.push({
          type: 'notes',
          itemId: note.lesson_id,
          error: err.message
        });
      }
    }

    // Sync bookmarks
    for (const bookmark of pendingBookmarks) {
      try {
        const existing = await base44.asServiceRole.entities.Bookmark.filter({
          user_id: user.id,
          verse_id: bookmark.verse_id
        });

        if (!existing?.length) {
          await base44.asServiceRole.entities.Bookmark.create({
            user_id: user.id,
            verse_id: bookmark.verse_id,
            note: bookmark.note
          });
        }
        syncResults.bookmarksSynced++;
      } catch (err) {
        syncResults.errors.push({
          type: 'bookmarks',
          itemId: bookmark.verse_id,
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      syncResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Offline Sync Error:', error);
    return Response.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    );
  }
});