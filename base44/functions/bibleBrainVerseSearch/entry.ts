import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Search for Bible verses using Bible Brain API
 * Searches by keyword and returns matching verses
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, limit = 15 } = await req.json();

    if (!query || query.trim().length < 2) {
      return Response.json({ verses: [] });
    }

    const apiKey = Deno.env.get('BIBLE_BRAIN_API_KEY');
    if (!apiKey) {
      console.error('BIBLE_BRAIN_API_KEY not set');
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Use Bible Brain's search endpoint
    const searchUrl = new URL('https://api.bibliaapi.com/v1/search');
    searchUrl.searchParams.set('query', query);
    searchUrl.searchParams.set('limit', limit.toString());
    searchUrl.searchParams.set('key', apiKey);

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Bible Brain API error:', response.status);
      // Fallback: query local database
      const verses = await base44.asServiceRole.entities.BibleVerseText.filter(
        { text: { $regex: query, $options: 'i' } },
        null,
        limit
      );
      return Response.json({ verses: verses.map(v => ({
        reference: `${v.book_name} ${v.chapter}:${v.verse}`,
        book: v.book_name,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        language: v.language_code,
      })) });
    }

    const data = await response.json();
    
    // Transform API response to standard format
    const verses = (data.results || []).slice(0, limit).map(result => ({
      reference: result.reference || '',
      text: result.text || '',
      book: result.book || '',
      chapter: result.chapter || 0,
      verse: result.verse || 0,
      language: 'en',
    }));

    return Response.json({ verses });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});