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

    const { reference, text, backgroundId, fontId, imageUrl } = await req.json();

    if (!reference || !text) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const verseImage = await base44.entities.VerseImage.create({
      userEmail: user.email,
      reference,
      text,
      backgroundId: backgroundId || 'purple',
      fontId: fontId || 'serif',
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      data: {
        id: verseImage.id,
        reference,
        imageUrl,
      },
    });
  } catch (error) {
    console.error('Verse image create error:', error);
    return Response.json({ error: 'Failed to create verse image', details: error.message }, { status: 500 });
  }
});