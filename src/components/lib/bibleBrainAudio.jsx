/**
 * Bible Brain Audio API Integration
 * Fetches audio URLs for Bible verses and provides playback metadata
 * https://www.biblebrain.com/
 */

// Map internal version IDs to Bible Brain audio fileset IDs
const BIBLE_BRAIN_FILESET_MAP = {
  // English
  'en_kjv': 'ENGJKV02DA', // King James Version
  'en_web': 'ENGWEB01DA', // World English Bible
  'en_nasb': 'ENGNASA02DA', // NASB
  
  // Kiswahili
  'sw_suv': 'SWAHSVU02DA', // Swahili Union Version
  
  // Amharic
  'am_amharic': 'AMHEWA01DA', // Amharic (Ethiopian Orthodox)
  
  // Afaan Oromoo
  'om_oromoo': 'OMOLUL01DA', // Oromo Ligeuu (if available)
};

/**
 * Fetch audio URL for a specific verse from Bible Brain API
 * Bible Brain API: GET /api/audioVerses?filesetId={filesetId}&bookId={bookId}&chapter={chapter}&verse={verse}
 */
export async function fetchBibleBrainAudio(versionId, bookId, chapter, verse = null) {
  try {
    const filesetId = BIBLE_BRAIN_FILESET_MAP[versionId];
    if (!filesetId) {
      return null; // Version not supported
    }

    // Build API query
    const params = new URLSearchParams({
      filesetId,
      bookId,
      chapter: String(chapter),
    });
    
    if (verse) {
      params.append('verse', String(verse));
    }

    // Call Bible Brain API
    const response = await fetch(
      `https://api.biblebrain.com/api/audioVerses?${params.toString()}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`[BibleBrain] API returned ${response.status} for ${versionId}`);
      return null;
    }

    const data = await response.json();
    
    // Extract audio data from response
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      return {
        versionId,
        bookId,
        chapter,
        verse: verse || null,
        audioUrl: data.data[0].audioUrl || data.data[0].url,
        duration: data.data[0].duration || null,
        verseText: data.data[0].verseText || null,
        timestamp: Date.now(),
      };
    }

    return null;
  } catch (error) {
    console.warn(`[BibleBrain] Failed to fetch audio for ${versionId}:`, error);
    return null;
  }
}

/**
 * Fetch audio for an entire chapter
 */
export async function fetchBibleBrainChapterAudio(versionId, bookId, chapter) {
  try {
    const filesetId = BIBLE_BRAIN_FILESET_MAP[versionId];
    if (!filesetId) {
      return null;
    }

    const response = await fetch(
      `https://api.biblebrain.com/api/audioVerses?filesetId=${filesetId}&bookId=${bookId}&chapter=${chapter}`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      return {
        versionId,
        bookId,
        chapter,
        verses: data.data.map((v) => ({
          verseNum: v.verseId,
          audioUrl: v.audioUrl || v.url,
          duration: v.duration,
          text: v.verseText,
        })),
        timestamp: Date.now(),
      };
    }

    return null;
  } catch (error) {
    console.warn(`[BibleBrain] Failed to fetch chapter audio:`, error);
    return null;
  }
}

/**
 * Check if audio is available for a version
 */
export async function isBibleBrainAudioAvailable(versionId) {
  return !!BIBLE_BRAIN_FILESET_MAP[versionId];
}

/**
 * Get list of supported audio versions
 */
export function getSupportedAudioVersions() {
  return Object.keys(BIBLE_BRAIN_FILESET_MAP);
}