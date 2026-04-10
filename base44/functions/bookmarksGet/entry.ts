import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const bookmarks = await base44.entities.Bookmark.filter({
      userEmail: user.email,
    });

    return Response.json({
      success: true,
      data: (bookmarks || []).map((b) => ({
        id: b.id,
        reference: b.reference,
        bookCode: b.bookCode,
        chapter: b.chapter,
        verse: b.verse,
        notes: b.notes,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error('Bookmarks get error:', error);
    return Response.json({ error: 'Failed to fetch bookmarks', details: error.message }, { status: 500 });
  }
});