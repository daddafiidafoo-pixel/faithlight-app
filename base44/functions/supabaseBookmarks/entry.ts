import { createClient } from 'npm:@supabase/supabase-js@2.38.0';

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_KEY')
    );

    const { action, userId, bookId, chapter, verse, languageCode, versionCode, bookmarkId } = await req.json();

    switch (action) {
      case 'save':
        {
          const { data, error } = await supabase
            .from('user_bookmarks')
            .insert({
              user_id: userId,
              book_id: bookId,
              chapter,
              verse,
              language_code: languageCode,
              version_code: versionCode,
            });

          if (error) throw new Error(`Failed to save bookmark: ${error.message}`);
          return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'remove':
        {
          const { error } = await supabase
            .from('user_bookmarks')
            .delete()
            .eq('id', bookmarkId);

          if (error) throw new Error(`Failed to remove bookmark: ${error.message}`);
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'getUserBookmarks':
        {
          const { data, error } = await supabase
            .from('user_bookmarks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw new Error(`Failed to fetch bookmarks: ${error.message}`);
          return new Response(JSON.stringify({ success: true, data: data || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'isBookmarked':
        {
          const { data, error } = await supabase
            .from('user_bookmarks')
            .select('id')
            .eq('user_id', userId)
            .eq('book_id', bookId)
            .eq('chapter', chapter)
            .eq('verse', verse)
            .eq('language_code', languageCode)
            .eq('version_code', versionCode)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to check bookmark: ${error.message}`);
          }

          return new Response(JSON.stringify({ success: true, bookmarked: !!data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'toggle':
        {
          const { data: existing } = await supabase
            .from('user_bookmarks')
            .select('id')
            .eq('user_id', userId)
            .eq('book_id', bookId)
            .eq('chapter', chapter)
            .eq('verse', verse)
            .eq('language_code', languageCode)
            .eq('version_code', versionCode)
            .single();

          if (existing) {
            await supabase.from('user_bookmarks').delete().eq('id', existing.id);
            return new Response(JSON.stringify({ success: true, bookmarked: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          } else {
            await supabase.from('user_bookmarks').insert({
              user_id: userId,
              book_id: bookId,
              chapter,
              verse,
              language_code: languageCode,
              version_code: versionCode,
            });
            return new Response(JSON.stringify({ success: true, bookmarked: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('[supabaseBookmarks] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});