import { createClient } from 'npm:@supabase/supabase-js@2.38.0';

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_KEY')
    );

    const { action, userId, bookId, chapter, languageCode, versionCode } = await req.json();

    switch (action) {
      case 'update':
        {
          const { data, error } = await supabase
            .from('user_reading_progress')
            .upsert({
              user_id: userId,
              book_id: bookId,
              chapter,
              language_code: languageCode,
              version_code: versionCode,
              last_read_at: new Date().toISOString(),
            });

          if (error) throw new Error(`Failed to update reading progress: ${error.message}`);
          return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'getBookProgress':
        {
          const { data, error } = await supabase
            .from('user_reading_progress')
            .select('chapter')
            .eq('user_id', userId)
            .eq('book_id', bookId)
            .eq('language_code', languageCode)
            .eq('version_code', versionCode)
            .order('chapter', { ascending: true });

          if (error) throw new Error(`Failed to fetch reading progress: ${error.message}`);
          return new Response(JSON.stringify({ success: true, data: data || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'getLastReadChapter':
        {
          const { data, error } = await supabase
            .from('user_reading_progress')
            .select('chapter, last_read_at')
            .eq('user_id', userId)
            .eq('book_id', bookId)
            .eq('language_code', languageCode)
            .eq('version_code', versionCode)
            .order('last_read_at', { ascending: false })
            .limit(1)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to fetch last read chapter: ${error.message}`);
          }

          return new Response(JSON.stringify({ success: true, data: data || null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      case 'getOverallProgress':
        {
          const { data, error } = await supabase
            .from('user_reading_progress')
            .select('book_id, chapter')
            .eq('user_id', userId)
            .eq('language_code', languageCode)
            .eq('version_code', versionCode);

          if (error) throw new Error(`Failed to fetch overall progress: ${error.message}`);
          return new Response(JSON.stringify({ success: true, data: data || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('[supabaseReadingProgress] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});