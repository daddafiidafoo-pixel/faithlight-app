import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookCode, chapter, verse, reference, action } = await req.json();

    if (!bookCode || chapter === undefined || verse === undefined || !reference || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already favorited
    const existing = await base44.entities.Favorites.filter({
      userId: user.email,
      bookCode,
      chapter: Number(chapter),
      verse: Number(verse),
    });

    if (action === 'add') {
      if (existing?.length > 0) {
        return Response.json({ success: true, isFavorited: true, action: 'already_favorited' });
      }
      await base44.entities.Favorites.create({
        userId: user.email,
        bookCode,
        chapter: Number(chapter),
        verse: Number(verse),
        reference,
        savedDate: new Date().toISOString(),
      });
      return Response.json({ success: true, isFavorited: true, action: 'added' });
    } else if (action === 'remove') {
      if (existing?.length === 0) {
        return Response.json({ success: true, isFavorited: false, action: 'already_removed' });
      }
      await base44.entities.Favorites.delete(existing[0].id);
      return Response.json({ success: true, isFavorited: false, action: 'removed' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('toggleFavorite error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});