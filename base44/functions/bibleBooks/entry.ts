import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const language = url.searchParams.get('lang') || 'en';

    const base44 = createClientFromRequest(req);

    const books = await base44.entities.BibleBook.filter({
      language,
    });

    if (!books) {
      return Response.json({
        success: false,
        error: 'Books not found',
        data: [],
      });
    }

    return Response.json({
      success: true,
      data: books.map((b) => ({
        code: b.book_code,
        name: b.display_name,
        sortOrder: b.sort_order,
      })),
    });
  } catch (error) {
    console.error('Bible books error:', error);
    return Response.json({ error: 'Failed to fetch books', details: error.message }, { status: 500 });
  }
});