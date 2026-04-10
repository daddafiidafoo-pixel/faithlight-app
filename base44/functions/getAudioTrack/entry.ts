import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Fetches audio track URL for a Bible verse in the specified language
 * Integrates with Bible audio providers
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { verseReference, language = 'en' } = await req.json();

    if (!verseReference) {
      return Response.json({ error: 'Missing verse reference' }, { status: 400 });
    }

    // Language to audio provider mapping
    const audioProviders = {
      'en': 'bible-brain-english',
      'sw': 'bible-brain-swahili',
      'om': 'bible-brain-oromo',
      'ar': 'bible-brain-arabic',
      'fr': 'bible-brain-french',
      'am': 'bible-brain-amharic',
      'ti': 'bible-brain-tigrinya',
    };

    const provider = audioProviders[language] || audioProviders['en'];

    // Parse verse reference
    const match = verseReference.match(/^(\d?\s*\w+)\s+(\d+):(\d+)/);
    if (!match) {
      return Response.json({ error: 'Invalid verse reference format' }, { status: 400 });
    }

    const [, bookName, chapter, verse] = match;

    // Normalize book name
    const normalizedBook = bookName.trim();

    // Try to fetch from Bible Brain API
    const bibleBrainKey = Deno.env.get('BIBLE_BRAIN_API_KEY');
    if (!bibleBrainKey) {
      console.warn('BIBLE_BRAIN_API_KEY not set');
      return Response.json(
        { error: 'Audio service not configured' },
        { status: 503 }
      );
    }

    // Query Bible Brain for audio filesets
    const audioUrl = `https://api.biblebrain.com/v1/filesets?fileset_type=audio&language=${language}&key=${bibleBrainKey}`;
    const res = await fetch(audioUrl);
    
    if (!res.ok) {
      console.error(`Bible Brain API error: ${res.status}`);
      return Response.json(
        { error: 'Failed to fetch audio availability' },
        { status: 503 }
      );
    }

    const data = await res.json();
    
    // Extract first available audio fileset
    if (!data.data || data.data.length === 0) {
      console.warn(`No audio available for language: ${language}`);
      return Response.json(
        { error: `Audio not available for ${language}` },
        { status: 404 }
      );
    }

    const fileset = data.data[0];
    const filesetId = fileset.id;

    // Construct signed audio URL via Bible Brain
    const signedUrl = `https://api.biblebrain.com/v1/filesets/${filesetId}/file?key=${bibleBrainKey}`;

    console.log(`Fetched audio for ${verseReference} in ${language}:`, filesetId);

    return Response.json({
      audioUrl: signedUrl,
      verseReference,
      language,
      filesetId,
    });
  } catch (error) {
    console.error('Error fetching audio track:', error);
    return Response.json(
      { error: 'Failed to fetch audio track', details: error.message },
      { status: 500 }
    );
  }
});