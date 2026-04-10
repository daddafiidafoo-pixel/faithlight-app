import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync pending notes
    const pendingNotes = await base44.entities.OfflineNote.filter(
      { user_id: user.id, status: 'pending' },
      '-last_edited_offline',
      500
    );

    let notesSynced = 0;
    for (const note of pendingNotes) {
      try {
        if (note.server_id) {
          // Update existing
          await base44.asServiceRole.entities.OfflineNote.update(note.id, {
            status: 'synced',
            synced_at: new Date().toISOString(),
          });
        } else {
          // Create new
          await base44.asServiceRole.entities.OfflineNote.update(note.id, {
            status: 'synced',
            server_id: note.id,
            synced_at: new Date().toISOString(),
          });
        }
        notesSynced++;
      } catch (err) {
        console.error('Error syncing note:', err);
      }
    }

    // Sync pending highlights
    const pendingHighlights = await base44.entities.OfflineHighlight.filter(
      { user_id: user.id, status: 'pending' },
      '-last_edited_offline',
      500
    );

    let highlightsSynced = 0;
    for (const hl of pendingHighlights) {
      try {
        if (hl.server_id) {
          // Update existing
          await base44.asServiceRole.entities.OfflineHighlight.update(hl.id, {
            status: 'synced',
            synced_at: new Date().toISOString(),
          });
        } else {
          // Create new
          await base44.asServiceRole.entities.OfflineHighlight.update(hl.id, {
            status: 'synced',
            server_id: hl.id,
            synced_at: new Date().toISOString(),
          });
        }
        highlightsSynced++;
      } catch (err) {
        console.error('Error syncing highlight:', err);
      }
    }

    return Response.json({
      success: true,
      notesSynced,
      highlightsSynced,
      totalPending: pendingNotes.length + pendingHighlights.length,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});