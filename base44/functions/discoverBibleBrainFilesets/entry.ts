/**
 * Bible Brain Fileset Discovery & Verification
 * 
 * Tests each language to find working text + audio filesets.
 * Results show which FilesetIDs work for each language.
 * 
 * Usage: Call with empty payload {} to discover all filesets
 */

const LANGUAGES = {
  om: 'Afaan Oromoo',
  am: 'Amharic',
  sw: 'Swahili',
  fr: 'Français',
  ti: 'Tigrinya',
  ar: 'العربية',
};

const TEST_CHAPTERS = [
  { book: 'PSA', chapter: 23, name: 'Psalm 23' },
  { book: 'PSA', chapter: 25, name: 'Psalm 25' },
  { book: 'MAT', chapter: 1, name: 'Matthew 1' },
  { book: 'JHN', chapter: 3, name: 'John 3' },
];

/**
 * Fetch available filesets from Bible Brain for a language
 */
async function getFilesets(languageCode, apiKey) {
  try {
    const response = await fetch(
      `https://4.dbt.io/api/bibles?language=${languageCode}&limit=100&key=${apiKey}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching filesets for ${languageCode}:`, error.message);
    return [];
  }
}

/**
 * Test if a text fileset has a specific chapter
 */
async function testTextFileset(filesetId, book, chapter, apiKey) {
  try {
    const response = await fetch(
      `https://4.dbt.io/api/bibles/filesets/${filesetId}/${book}/${chapter}?key=${apiKey}`
    );
    if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
    
    const data = await response.json();
    const hasVerses = data.data && Array.isArray(data.data) && data.data.length > 0;
    return {
      success: hasVerses,
      verseCount: data.data?.length || 0,
      sampleVerse: data.data?.[0] || null,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test if an audio fileset has a specific chapter
 */
async function testAudioFileset(filesetId, book, chapter, apiKey) {
  try {
    const response = await fetch(
      `https://4.dbt.io/api/audio/filesets/${filesetId}/${book}/${chapter}?key=${apiKey}`
    );
    if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
    
    const data = await response.json();
    const hasAudio = data.data && Array.isArray(data.data) && data.data.length > 0;
    return {
      success: hasAudio,
      trackCount: data.data?.length || 0,
      sampleTrack: data.data?.[0] || null,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Discover best text fileset for a language
 */
async function discoverTextFileset(languageCode, apiKey) {
  const filesets = await getFilesets(languageCode, apiKey);
  const textFilesets = filesets.filter(fs => fs.type === 'text');
  
  if (textFilesets.length === 0) {
    return { filesetId: null, reason: 'No text filesets found' };
  }

  // Test each fileset for Psalm 23 (most reliable test)
  for (const fs of textFilesets) {
    const test = await testTextFileset(fs.id, 'PSA', 23, apiKey);
    if (test.success) {
      return {
        filesetId: fs.id,
        name: fs.name,
        description: fs.description,
        verified: true,
      };
    }
  }

  return {
    filesetId: null,
    reason: `Found ${textFilesets.length} text fileset(s), but none returned Psalm 23`,
    candidates: textFilesets.map(fs => ({ id: fs.id, name: fs.name })),
  };
}

/**
 * Discover best audio fileset for a language
 */
async function discoverAudioFileset(languageCode, apiKey) {
  const filesets = await getFilesets(languageCode, apiKey);
  const audioFilesets = filesets.filter(fs => fs.type === 'audio' || fs.type === 'audio_drama');
  
  if (audioFilesets.length === 0) {
    return { filesetId: null, reason: 'No audio filesets found' };
  }

  // Test each fileset for Psalm 23
  for (const fs of audioFilesets) {
    const test = await testAudioFileset(fs.id, 'PSA', 23, apiKey);
    if (test.success) {
      return {
        filesetId: fs.id,
        name: fs.name,
        description: fs.description,
        type: fs.type,
        verified: true,
      };
    }
  }

  return {
    filesetId: null,
    reason: `Found ${audioFilesets.length} audio fileset(s), but none returned Psalm 23`,
    candidates: audioFilesets.map(fs => ({ id: fs.id, name: fs.name, type: fs.type })),
  };
}

/**
 * Full discovery workflow
 */
Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('VITE_BIBLE_BRAIN_API_KEY');
    if (!apiKey) {
      return Response.json(
        { error: 'VITE_BIBLE_BRAIN_API_KEY not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Starting Bible Brain Fileset Discovery...');
    const results = {};

    for (const [langCode, langName] of Object.entries(LANGUAGES)) {
      console.log(`\n📖 Testing ${langName} (${langCode})...`);
      
      const textResult = await discoverTextFileset(langCode, apiKey);
      const audioResult = await discoverAudioFileset(langCode, apiKey);

      results[langCode] = {
        language: langName,
        text: textResult,
        audio: audioResult,
        ready: textResult.verified && audioResult.verified,
      };

      console.log(`  Text: ${textResult.verified ? '✅' : '❌'} ${textResult.filesetId || 'Not found'}`);
      console.log(`  Audio: ${audioResult.verified ? '✅' : '❌'} ${audioResult.filesetId || 'Not found'}`);
    }

    console.log('\n✅ Discovery Complete');
    return Response.json({
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total_languages: Object.keys(LANGUAGES).length,
        ready: Object.values(results).filter(r => r.ready).length,
        next_step: 'Copy verified FilesetIDs to lib/bibleBrainFilesetsConfig.js',
      },
    });
  } catch (error) {
    console.error('Discovery error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});