import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { bookCode, chapter, verse, reference, notes } = await req.json();

    if (!bookCode || !chapter || !verse || !reference) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bookmark = await base44.entities.Bookmark.create({
      userEmail: user.email,
      bookCode,
      chapter,
      verse,
      reference,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      data: { id: bookmark.id, reference, notes },
    });
  } catch (error) {
    console.error('Bookmark create error:', error);
    return Response.json({ error: 'Failed to create bookmark', details: error.message }, { status: 500 });
  }
});