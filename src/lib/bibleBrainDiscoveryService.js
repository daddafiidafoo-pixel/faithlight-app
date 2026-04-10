/**
 * Bible Brain Fileset Discovery Service
 * 
 * Auto-discovers correct text and audio filesets by language.
 * Does NOT guess IDs — queries Bible Brain API for official truth.
 * 
 * Important:
 * - Bible Brain supports multiple filesets per Bible version
 * - Text and audio filesets have different IDs and are not safe to assume from naming
 * - Discovery + verification must happen before enabling a language
 * - Cache results to avoid repeated API calls
 */

const API_BASE = 'https://4.dbt.io/api/bibles';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Discover available filesets for a language
 * 
 * @param {string} languageCode - ISO language code (om, am, sw, ar, fr, ti)
 * @returns {Promise<Object>} - Discovered filesets
 */
export async function discoverFilesets(languageCode) {
  const apiKey = import.meta.env.VITE_BIBLE_BRAIN_API_KEY;
  
  if (!apiKey) {
    console.warn('[Discovery] No API key configured');
    return { language: languageCode, textFilesetId: null, audioFilesetId: null, error: 'No API key' };
  }

  try {
    // Query Bible Brain for all available filesets in this language
    const url = `${API_BASE}?language=${languageCode}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[Discovery] API error for ${languageCode}: ${response.status}`);
      return { language: languageCode, textFilesetId: null, audioFilesetId: null, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const bibles = data.data || [];

    if (bibles.length === 0) {
      console.warn(`[Discovery] No Bibles found for ${languageCode}`);
      return { language: languageCode, textFilesetId: null, audioFilesetId: null, error: 'No Bibles available' };
    }

    // For each Bible, extract text and audio filesets
    let textFilesetId = null;
    let audioFilesetId = null;

    for (const bible of bibles) {
      const filesets = bible.filesets || [];

      for (const fileset of filesets) {
        const type = fileset.type || '';

        // Text content types
        if ((type.includes('text') || type.includes('text_plain')) && !textFilesetId) {
          textFilesetId = fileset.id;
        }

        // Audio content types
        if ((type.includes('audio') || type.includes('audio_mp3')) && !audioFilesetId) {
          audioFilesetId = fileset.id;
        }

        // Stop searching once we have both
        if (textFilesetId && audioFilesetId) break;
      }

      if (textFilesetId && audioFilesetId) break;
    }

    return {
      language: languageCode,
      textFilesetId,
      audioFilesetId,
      discoveredAt: new Date().toISOString(),
      textVerified: false, // Verification happens next
      audioVerified: false,
    };
  } catch (err) {
    console.error(`[Discovery] Error for ${languageCode}:`, err);
    return { language: languageCode, textFilesetId: null, audioFilesetId: null, error: err.message };
  }
}

/**
 * Verify a text fileset by fetching a known chapter
 * 
 * @param {string} languageCode
 * @param {string} filesetId
 * @returns {Promise<boolean>}
 */
export async function verifyTextFileset(languageCode, filesetId) {
  if (!filesetId) return false;

  const apiKey = import.meta.env.VITE_BIBLE_BRAIN_API_KEY;
  if (!apiKey) return false;

  try {
    // Test with John 3 (common test chapter)
    const url = `${API_BASE}/filesets/${filesetId}/JHN/3?key=${apiKey}`;
    const response = await fetch(url, { timeout: 5000 });

    if (!response.ok) return false;

    const data = await response.json();
    const verses = Array.isArray(data) ? data : data.data || [];

    // Text is verified if we get verses with non-empty text
    const hasValidVerses = verses.length > 0 && verses.some(v => v.text && v.text.trim().length > 0);
    
    if (hasValidVerses) {
      console.log(`[Verification] Text fileset ${filesetId} verified for ${languageCode}`);
    }

    return hasValidVerses;
  } catch (err) {
    console.warn(`[Verification] Text fileset ${filesetId} failed for ${languageCode}:`, err.message);
    return false;
  }
}

/**
 * Verify an audio fileset by checking metadata
 * 
 * @param {string} languageCode
 * @param {string} filesetId
 * @returns {Promise<boolean>}
 */
export async function verifyAudioFileset(languageCode, filesetId) {
  if (!filesetId) return false;

  const apiKey = import.meta.env.VITE_BIBLE_BRAIN_API_KEY;
  if (!apiKey) return false;

  try {
    // Test with Psalms 23 (common audio test)
    const url = `${API_BASE}/filesets/${filesetId}/PSA/23?key=${apiKey}`;
    const response = await fetch(url, { timeout: 5000 });

    if (!response.ok) return false;

    const data = await response.json();
    const audioFiles = Array.isArray(data) ? data : data.data || [];

    // Audio is verified if we get playable audio references
    const hasValidAudio = audioFiles.length > 0 && audioFiles.some(a => a.path || a.url);
    
    if (hasValidAudio) {
      console.log(`[Verification] Audio fileset ${filesetId} verified for ${languageCode}`);
    }

    return hasValidAudio;
  } catch (err) {
    console.warn(`[Verification] Audio fileset ${filesetId} failed for ${languageCode}:`, err.message);
    return false;
  }
}

/**
 * Full discovery + verification workflow for a language
 * 
 * @param {string} languageCode
 * @returns {Promise<Object>} - Complete discovery result with verification status
 */
export async function discoverAndVerifyLanguage(languageCode) {
  console.log(`[Discovery] Starting for ${languageCode}...`);

  // Step 1: Discover available filesets
  const discovered = await discoverFilesets(languageCode);

  if (!discovered.textFilesetId && !discovered.audioFilesetId) {
    console.warn(`[Discovery] No filesets found for ${languageCode}`);
    return discovered;
  }

  // Step 2: Verify text fileset if found
  if (discovered.textFilesetId) {
    discovered.textVerified = await verifyTextFileset(languageCode, discovered.textFilesetId);
    if (!discovered.textVerified) {
      discovered.textFilesetId = null; // Disable if verification failed
    }
  }

  // Step 3: Verify audio fileset if found
  if (discovered.audioFilesetId) {
    discovered.audioVerified = await verifyAudioFileset(languageCode, discovered.audioFilesetId);
    if (!discovered.audioVerified) {
      discovered.audioFilesetId = null; // Disable if verification failed
    }
  }

  discovered.lastVerifiedAt = new Date().toISOString();

  console.log(`[Discovery] Complete for ${languageCode}:`, {
    textFilesetId: discovered.textFilesetId || 'NONE',
    audioFilesetId: discovered.audioFilesetId || 'NONE',
    textVerified: discovered.textVerified,
    audioVerified: discovered.audioVerified,
  });

  return discovered;
}

/**
 * Discover all target languages
 * 
 * @param {string[]} languages - Language codes to discover (om, am, sw, ar, fr, ti)
 * @returns {Promise<Object>} - Map of language -> discovery result
 */
export async function discoverAllLanguages(languages = ['om', 'am', 'sw', 'ar']) {
  const results = {};

  for (const lang of languages) {
    results[lang] = await discoverAndVerifyLanguage(lang);
  }

  return results;
}