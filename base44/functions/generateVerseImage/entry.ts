import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    const { verse_reference, verse_text, theme } = await req.json();

    if (!verse_reference || !verse_text || !theme) {
      return Response.json(
        { error: 'Missing required fields: verse_reference, verse_text, theme' },
        { status: 400 }
      );
    }

    // Generate image using AI
    const imagePrompt = `Create a beautiful, spiritually inspiring Bible verse image card. 
Theme: ${theme}
Verse: "${verse_text}"
Reference: ${verse_reference}

The image should have:
- A beautiful ${theme} background
- The verse text centered and readable
- The reference at the bottom
- Professional typography
- Watermark: "FaithLight ✨" in bottom right
- 9:16 aspect ratio (mobile)
- Spiritual and uplifting aesthetic`;

    const imageRes = await base44.integrations.Core.GenerateImage({
      prompt: imagePrompt,
    });

    if (!imageRes?.url) {
      return Response.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    // Save to database if user is logged in
    if (user) {
      try {
        const verseImage = await base44.entities.VerseImage.create({
          user_id: user.email,
          verse_reference,
          verse_text,
          artistic_theme: theme,
          image_url: imageRes.url,
          is_shared: false,
        });

        return Response.json({
          success: true,
          image_url: imageRes.url,
          verse_image_id: verseImage.id,
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Still return the image even if DB fails
        return Response.json({
          success: true,
          image_url: imageRes.url,
          warning: 'Image generated but not saved',
        });
      }
    }

    return Response.json({
      success: true,
      image_url: imageRes.url,
    });
  } catch (error) {
    console.error('Error generating verse image:', error);
    return Response.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
});