/**
 * Fetch Bible chapter text from Bible Brain API
 * Handles text conversion and error states
 */

export async function fetchBibleChapter({
  filesetId,
  bookId,
  chapter,
  apiKey,
}) {
  if (!filesetId) {
    throw new Error('Text not configured for this language');
  }

  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const url = `https://4.dbt.io/api/bibles/filesets/${filesetId}/${bookId}/${chapter}?key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Chapter not found in this language');
      }
      throw new Error(`Bible text fetch failed: ${res.status}`);
    }

    const json = await res.json();

    // Handle both response formats
    const verses = json?.data || json?.verses || [];

    if (!Array.isArray(verses) || verses.length === 0) {
      throw new Error('No verses found for this chapter');
    }

    // Map to consistent format: { verse: number, text: string }
    return verses.map((v) => ({
      verse: v.verse_start || v.verse,
      text: v.verse_text || v.text,
    }));
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
export function formatTextError(error, language = 'Language') {
  if (error.message.includes('not configured')) {
    return `Text not available in ${language}`;
  }
  if (error.message.includes('not found')) {
    return `Chapter not found in ${language}`;
  }
  if (error.message.includes('Network')) {
    return 'Connection failed. Check your internet.';
  }
  if (error.message.includes('No verses')) {
    return 'No verses available for this chapter';
  }
  return `Failed to load text: ${error.message}`;
}