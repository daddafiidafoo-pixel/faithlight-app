import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const bookCode = url.searchParams.get('book');
    const chapterNumber = url.searchParams.get('chapter');
    const language = url.searchParams.get('lang') || 'en';

    if (!bookCode || !chapterNumber) {
      return Response.json({ error: 'Missing book or chapter parameter' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const verses = await base44.entities.BibleVerse.filter({
      book_code: bookCode,
      chapter_number: parseInt(chapterNumber),
      language,
    });

    if (!verses || verses.length === 0) {
      return Response.json({
        success: false,
        error: 'Chapter not found',
        data: [],
      });
    }

    return Response.json({
      success: true,
      data: {
        book: bookCode,
        chapter: chapterNumber,
        verses: verses.map((v) => ({
          number: v.verse_number,
          text: v.verse_text,
        })),
      },
    });
  } catch (error) {
    console.error('Bible chapter error:', error);
    return Response.json({ error: 'Failed to fetch chapter', details: error.message }, { status: 500 });
  }
});