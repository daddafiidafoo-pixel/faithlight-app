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
    const imageId = url.searchParams.get('id');

    if (!imageId) {
      return Response.json({ error: 'Missing image id' }, { status: 400 });
    }

    await base44.entities.VerseImage.delete(imageId);

    return Response.json({
      success: true,
      message: 'Image deleted',
    });
  } catch (error) {
    console.error('Verse image delete error:', error);
    return Response.json({ error: 'Failed to delete image', details: error.message }, { status: 500 });
  }
});