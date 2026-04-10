/**
 * Backend function to fetch Bible Brain audio for a scripture passage
 * Returns audio URL if available
 */
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const { book, chapter, verse, language } = await req.json();

    if (!book || !chapter || !verse) {
      return Response.json(
        { error: 'Missing required parameters: book, chapter, verse' },
        { status: 400 }
      );
    }

    // Map language to Bible Brain bible ID
    const bibleBrainIds = {
      'en': 'ENGESV',      // English ESV
      'om': 'HAEBIB',      // Afaan Oromoo fallback
      'am': 'AMHAAB',      // Amharic
      'fr': 'FRSBIB',      // French
      'sw': 'SWABIB',      // Swahili
      'ar': 'ARABIB',      // Arabic
      'ti': 'TIGBIB'       // Tigrinya
    };

    const bibleId = bibleBrainIds[language] || 'ENGESV';
    const apiKey = Deno.env.get('BIBLE_BRAIN_API_KEY');

    if (!apiKey) {
      return Response.json(
        { error: 'Bible Brain API key not configured' },
        { status: 500 }
      );
    }

    // Query Bible Brain for audio filesets
    const filesetResponse = await fetch(
      `https://api.biblebrain.com/v1/bibles/${bibleId}/filesets?type=audio&asset_id=mp3&key=${apiKey}`
    );

    if (!filesetResponse.ok) {
      console.warn(`Bible Brain audio not available for ${language}`);
      return Response.json({ audioUrl: null });
    }

    const filesetData = await filesetResponse.json();
    if (!filesetData.data || filesetData.data.length === 0) {
      return Response.json({ audioUrl: null });
    }

    const fileset = filesetData.data[0];
    const filesetId = fileset.id;

    // Fetch audio chapter
    const audioResponse = await fetch(
      `https://api.biblebrain.com/v1/audio/${filesetId}/${book}/${chapter}?key=${apiKey}`
    );

    if (!audioResponse.ok) {
      return Response.json({ audioUrl: null });
    }

    const audioData = await audioResponse.json();
    const audioUrl = audioData.data?.path || null;

    return Response.json({ audioUrl });
  } catch (error) {
    console.error('Bible Brain audio fetch error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});