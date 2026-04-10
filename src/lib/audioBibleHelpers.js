import { getAudioConfig, isAudioEnabledFor } from "@/lib/bibleBrainRuntimeConfig";

export async function fetchBibleBrainAudioTrack({
  language,
  bookId,
  chapter,
  apiKey,
}) {
  // Check if audio is enabled and configured for this language
  if (!isAudioEnabledFor(language)) {
    const msg = language === 'om'
      ? 'Sagaleen Afaan Oromootiin amma hin mirkanoofne.'
      : 'Audio not available for this language.';
    throw new Error(msg);
  }

  const config = getAudioConfig(language);
  const audioFilesetId = config.audioFilesetId;

  if (!audioFilesetId) {
    const msg = language === 'om'
      ? 'Sagaleen Afaan Oromootiin amma hin jiru.'
      : 'Audio not available for this language.';
    throw new Error(msg);
  }

  const url = `https://4.dbt.io/api/bibles/filesets/${audioFilesetId}/${bookId}/${chapter}?key=${apiKey}`;

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(
      language === 'om'
        ? 'Baasii irratti dhufe. Maaloo konkolaachuu irra ga\'adi.'
        : 'Network error. Please check your connection.'
    );
  }

  if (!res.ok) {
    const msg = language === 'om'
      ? 'Sagaleen boqonnaa kanaaf amma hin jiru.'
      : 'Audio not available for this chapter.';
    throw new Error(msg);
  }

  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw new Error(
      language === 'om'
        ? 'Deetaa hammaamu. Maaloo irra gaafi.'
        : 'Failed to load audio data.'
    );
  }

  // Extract playable signed URL from Bible Brain response
  const audioUrl =
    json?.data?.[0]?.path ||
    json?.data?.path ||
    json?.data?.audio_url ||
    null;

  if (!audioUrl) {
    const msg = language === 'om'
      ? 'Sagaleen boqonnaa kanaaf amma hin jiru.'
      : 'Audio not available for this chapter.';
    throw new Error(msg);
  }

  return {
    url: audioUrl,
    language,
    bookId,
    chapter,
    title: `${bookId} ${chapter}`,
  };
}

/**
 * Verify that a URL is playable before marking as enabled
 */
export async function verifyPlayableAudio(url) {
  return new Promise((resolve) => {
    const audio = new Audio();
    let timeoutId = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
    };

    const onLoaded = () => {
      cleanup();
      resolve(true);
    };

    const onError = () => {
      cleanup();
      resolve(false);
    };

    // Set 10 second timeout for metadata load
    timeoutId = setTimeout(() => {
      cleanup();
      resolve(false);
    }, 10000);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
    audio.src = url;
    audio.load();
  });
}

/**
 * Format audio errors with user-safe messages
 */
export function formatAudioError(error, language = "en") {
  if (!error) return null;

  const message = typeof error === "string" ? error : error?.message || "Audio error";

  // User-safe messages by language
  const messages = {
    om: {
      unavailable: "Sagaleen Afaan Oromootiin amma hin mirkanoofne.",
      network: "Cubbiin baasii irratti dhufe.",
      generic: "Sagaleen seequun dhabame.",
    },
    en: {
      unavailable: "Audio is not available for this chapter.",
      network: "Network error while loading audio.",
      generic: "Failed to load audio.",
    },
  };

  const lang = messages[language] || messages.en;

  if (message.includes("404") || message.includes("No playable audio")) {
    return lang.unavailable;
  }
  if (message.toLowerCase().includes("network")) {
    return lang.network;
  }

  return lang.generic;
}

export async function loadChapterAudio({ language, bookId, chapter, apiKey }) {
  return fetchBibleBrainAudioTrack({ language, bookId, chapter, apiKey });
}