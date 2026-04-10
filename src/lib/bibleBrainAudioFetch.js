/**
 * Fetch audio URLs from Bible Brain API for language-specific filesets
 * Handles audio retrieval and error states
 */

export async function fetchBibleAudio({
  audioFilesetId,
  bookId,
  chapter,
  apiKey,
}) {
  if (!audioFilesetId) {
    throw new Error('Audio not configured for this language');
  }

  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const url = `https://4.dbt.io/api/bibles/filesets/${audioFilesetId}/${bookId}/${chapter}?key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Audio not available for this chapter');
      }
      throw new Error(`Bible audio fetch failed: ${res.status}`);
    }

    const json = await res.json();

    // Bible Brain API returns audio data with verse-level timing
    // We'll return the first audio track URL if multiple exist
    const audioData = json?.data || json?.verses || [];

    if (!Array.isArray(audioData) || audioData.length === 0) {
      throw new Error('No audio found for this chapter');
    }

    // Extract audio URL from the response
    // Bible Brain returns verse-level audio or chapter-level audio file
    const firstAudio = audioData[0];
    
    // Handle different response formats from Bible Brain
    const audioUrl = 
      firstAudio?.audio_path ||
      firstAudio?.file_path ||
      firstAudio?.url ||
      null;

    if (!audioUrl) {
      throw new Error('No audio URL available');
    }

    // Ensure full URL (Bible Brain may return relative paths)
    const fullUrl = audioUrl.startsWith('http')
      ? audioUrl
      : `https://4.dbt.io${audioUrl}`;

    return {
      audioUrl: fullUrl,
      duration: firstAudio?.duration || null,
      format: firstAudio?.format || 'audio/mpeg',
    };
  } catch (error) {
    // Re-throw with context
    if (error.message.includes('fetch')) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Format error message for UI display
 */
export function formatAudioError(error, languageName = 'Language') {
  if (error.message.includes('not configured')) {
    return `Audio not available in ${languageName}`;
  }
  if (error.message.includes('not available for this chapter')) {
    return `Audio not available for this chapter`;
  }
  if (error.message.includes('not found')) {
    return `Audio not found in ${languageName}`;
  }
  if (error.message.includes('Network')) {
    return 'Connection failed. Check your internet.';
  }
  if (error.message.includes('No audio')) {
    return 'No audio available for this chapter';
  }
  return `Failed to load audio: ${error.message}`;
}