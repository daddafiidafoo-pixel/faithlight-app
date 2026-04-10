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

    const verseImages = await base44.entities.VerseImage.filter({
      userEmail: user.email,
    });

    return Response.json({
      success: true,
      data: (verseImages || []).map((v) => ({
        id: v.id,
        reference: v.reference,
        text: v.text,
        imageUrl: v.imageUrl,
        backgroundId: v.backgroundId,
        fontId: v.fontId,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error('Verse images get error:', error);
    return Response.json({ error: 'Failed to fetch verse images', details: error.message }, { status: 500 });
  }
});