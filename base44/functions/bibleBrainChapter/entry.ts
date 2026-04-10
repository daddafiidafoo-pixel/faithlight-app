import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const API_KEY = Deno.env.get('BIBLE_BRAIN_API_KEY');
const BASE_URL = 'https://4.dbt.io/api';

Deno.serve(async (req) => {
  try {
    const { bible_id, book_id, chapter } = await req.json();

    if (!bible_id || !book_id || !chapter) {
      return Response.json({ error: 'bible_id, book_id, and chapter are required' }, { status: 400 });
    }
    if (!API_KEY) {
      return Response.json({ error: 'BIBLE_BRAIN_API_KEY not configured' }, { status: 500 });
    }

    console.log(`[bibleBrainChapter] Fetching ${bible_id} / ${book_id} / ${chapter}`);

    const url = `${BASE_URL}/bibles/${bible_id}/books/${book_id}/chapters/${chapter}?v=4&key=${API_KEY}`;
    const res = await fetch(url, { headers: { accept: 'application/json' } });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[bibleBrainChapter] API error ${res.status}: ${text}`);
      return Response.json({ error: `API error ${res.status}`, verses: [] });
    }

    const data = await res.json();

    // Bible Brain returns verses under data array
    const raw = Array.isArray(data?.data) ? data.data : [];

    const verses = raw.map((v) => ({
      verse_id: `${v.book_id || book_id}.${v.chapter_number || chapter}.${v.verse_start || v.verse_number || 1}`,
      book_id: v.book_id || book_id,
      book_name: v.book_name || v.book_name_alt || book_id,
      chapter: parseInt(v.chapter_number || chapter) || parseInt(chapter),
      verse_number: parseInt(v.verse_start || v.verse_number || 1),
      verse_start: parseInt(v.verse_start || v.verse_number || 1),
      verse_end: parseInt(v.verse_end || v.verse_start || v.verse_number || 1),
      reference_text: v.verse_reference || `${v.book_name || book_id} ${chapter}:${v.verse_start || v.verse_number || 1}`,
      verse_text: v.verse_text || '',
    }));

    console.log(`[bibleBrainChapter] Returning ${verses.length} verses`);
    return Response.json({ verses, book_name: verses[0]?.book_name || book_id });

  } catch (error) {
    console.error('[bibleBrainChapter] Error:', error.message);
    return Response.json({ error: error.message, verses: [] }, { status: 500 });
  }
});