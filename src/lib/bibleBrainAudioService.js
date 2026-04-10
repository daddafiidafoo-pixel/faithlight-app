/**
 * Bible Brain Audio Service
 * Fetches audio chapter data from Bible Brain Digital Bible Platform (DBP) v4
 */

import { getAudioConfig, isAudioAvailable } from "@/data/bibleBrainAudioConfig";

const BIBLE_BRAIN_API = "https://api.scripture.api.bible/v1";

/**
 * Fetch audio chapter URL from Bible Brain
 * @param {Object} request
 * @param {string} request.language - Language code (en, om, am, fr, sw, ar, ti)
 * @param {string} request.book - Bible book code (JHN, PSA, GEN, etc.)
 * @param {number} request.chapter - Chapter number
 * @returns {Promise<Object>} { ok: boolean, audioUrl?: string, filesetId?: string, errorCode?: string }
 */
export async function fetchBibleBrainAudioChapter(request) {
  const { language, book, chapter } = request;

  // 1. Validate language and check if audio is available
  if (!isAudioAvailable(language)) {
    return {
      ok: false,
      errorCode: "AUDIO_NOT_AVAILABLE_FOR_LANGUAGE",
    };
  }

  const config = getAudioConfig(language);
  const filesetId = config.filesetId;
  const apiKey = import.meta.env.VITE_BIBLE_BRAIN_API_KEY;

  if (!apiKey) {
    console.error("Bible Brain API key not configured");
    return {
      ok: false,
      errorCode: "API_KEY_MISSING",
    };
  }

  try {
    // 2. Call Bible Brain API to get chapter audio
    // Format: /v1/bibles/{filesetId}/chapters/{bookId}.{chapter}/audio
    const url = `${BIBLE_BRAIN_API}/bibles/${filesetId}/chapters/${book}.${chapter}/audio`;

    const response = await fetch(url, {
      headers: {
        "api-key": apiKey,
      },
    });

    if (!response.ok) {
      // 3. Handle specific error codes
      if (response.status === 404) {
        return {
          ok: false,
          errorCode: "CHAPTER_NOT_FOUND",
        };
      }
      if (response.status === 403) {
        return {
          ok: false,
          errorCode: "UNAUTHORIZED",
        };
      }

      console.error(
        `Bible Brain API error: ${response.status}`,
        await response.text()
      );
      return {
        ok: false,
        errorCode: "API_ERROR",
      };
    }

    const data = await response.json();

    // 4. Extract audio URL from response
    // Bible Brain typically returns data.data.audioUrl or similar structure
    const audioUrl =
      data.data?.audioUrl ||
      data.data?.audioByType?.default?.url ||
      data.audioUrl;

    if (!audioUrl) {
      return {
        ok: false,
        errorCode: "NO_AUDIO_URL",
      };
    }

    // 5. Return success with audio URL
    return {
      ok: true,
      audioUrl,
      filesetId,
      languageCode: language,
      book,
      chapter,
    };
  } catch (error) {
    console.error("Bible Brain audio fetch error:", error.message);
    return {
      ok: false,
      errorCode: "NETWORK_ERROR",
    };
  }
}

/**
 * Get available audio filesets for a language from Bible Brain
 * (For discovery/caching purposes)
 */
export async function discoverAudioFilesets(languageCode) {
  const apiKey = import.meta.env.VITE_BIBLE_BRAIN_API_KEY;

  if (!apiKey) {
    console.error("Bible Brain API key not configured");
    return [];
  }

  try {
    // Call Bible Brain Available Content API filtered by language and audio format
    const url = `${BIBLE_BRAIN_API}/bibles?language=${languageCode}&format=audio`;

    const response = await fetch(url, {
      headers: {
        "api-key": apiKey,
      },
    });

    if (!response.ok) {
      console.error(`Failed to discover filesets: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to discover filesets:", error.message);
    return [];
  }
}