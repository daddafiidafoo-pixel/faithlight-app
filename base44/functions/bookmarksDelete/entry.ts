import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'DELETE') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const bookmarkId = url.searchParams.get('id');

    if (!bookmarkId) {
      return Response.json({ error: 'Missing bookmark id' }, { status: 400 });
    }

    await base44.entities.Bookmark.delete(bookmarkId);

    return Response.json({
      success: true,
      message: 'Bookmark deleted',
    });
  } catch (error) {
    console.error('Bookmark delete error:', error);
    return Response.json({ error: 'Failed to delete bookmark', details: error.message }, { status: 500 });
  }
});