import { createClient } from 'npm:@supabase/supabase-js@2.38.0';

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_KEY')
    );

    const { action, userId, bookId, chapter, verseStart, verseEnd, languageCode, versionCode, color, note, highlightId, updates } = await req.json();

    switch (action) {
      case 'save':
        {
          const { data, error } = await supabase
            .from('user_highlights')
            .insert({
              user_id: userId,
              book_id: bookId,
              chapter,
              verse_start: verseStart,
              verse_end: verseEnd,
              language_code: languageCode,
              version_code: versionCode,
              color,
              note,
            });

          if (error) throw new Error(`Failed to save highlight: ${error.message}`);
          return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'update':
        {
          const { data, error } = await supabase
            .from('user_highlights')
            .update(updates)
            .eq('id', highlightId);

          if (error) throw new Error(`Failed to update highlight: ${error.message}`);
          return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'remove':
        {
          const { error } = await supabase
            .from('user_highlights')
            .delete()
            .eq('id', highlightId);

          if (error) throw new Error(`Failed to remove highlight: ${error.message}`);
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'getChapterHighlights':
        {
          const { data, error } = await supabase
            .from('user_highlights')
            .select('*')
            .eq('user_id', userId)
            .eq('book_id', bookId)
            .eq('chapter', chapter)
            .order('verse_start', { ascending: true });

          if (error) throw new Error(`Failed to fetch highlights: ${error.message}`);
          return new Response(JSON.stringify({ success: true, data: data || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'getUserHighlights':
        {
          const { data, error } = await supabase
            .from('user_highlights')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw new Error(`Failed to fetch highlights: ${error.message}`);
          return new Response(JSON.stringify({ success: true, data: data || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('[supabaseHighlights] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});