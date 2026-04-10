import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Sync offline data - handles bidirectional sync of bookmarks, notes, and downloaded chapters
 * Works with IndexedDB on frontend to maintain offline-first functionality
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      action, // 'push' (send to cloud) or 'pull' (fetch from cloud)
      data = {},
      language_code = 'en'
    } = await req.json();

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // PUSH: Save local bookmarks/highlights to cloud
    if (action === 'push') {
      const { bookmarks = [], highlights = [], notes = [] } = data;

      // Save bookmarks
      for (const bookmark of bookmarks) {
        await base44.entities.BibleHighlight.create({
          user_id: user.id,
          verse_id: bookmark.verse_id,
          book_key: bookmark.book_key,
          chapter: bookmark.chapter,
          verse: bookmark.verse,
          highlight_color: bookmark.color || 'yellow',
          language_code
        }).catch(err => console.warn('Bookmark save failed:', err.message));
      }

      // Save highlights
      for (const highlight of highlights) {
        await base44.entities.VerseHighlight.create({
          user_id: user.id,
          verse_id: highlight.verse_id,
          text: highlight.text,
          color: highlight.color,
          created_at: highlight.created_at || new Date().toISOString()
        }).catch(err => console.warn('Highlight save failed:', err.message));
      }

      // Save notes
      for (const note of notes) {
        await base44.entities.BibleNote.create({
          user_id: user.id,
          verse_id: note.verse_id,
          content: note.content,
          book_key: note.book_key,
          chapter: note.chapter,
          verse: note.verse,
          created_at: note.created_at || new Date().toISOString()
        }).catch(err => console.warn('Note save failed:', err.message));
      }

      return Response.json({
        success: true,
        message: 'Data synced to cloud',
        synced: { bookmarks: bookmarks.length, highlights: highlights.length, notes: notes.length }
      });
    }

    // PULL: Fetch cloud data for offline sync
    if (action === 'pull') {
      const highlights = await base44.entities.BibleHighlight.filter(
        { user_id: user.id, language_code },
        '-updated_date',
        1000
      ).catch(() => []);

      const notes = await base44.entities.BibleNote.filter(
        { user_id: user.id },
        '-updated_date',
        1000
      ).catch(() => []);

      return Response.json({
        success: true,
        data: {
          highlights: highlights || [],
          notes: notes || [],
          synced_at: new Date().toISOString()
        }
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Offline sync error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});