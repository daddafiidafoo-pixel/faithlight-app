import { base44 } from '@/api/base44Client';
import {
  getTextOffline,
  setTextOffline,
  isAudioCached,
  getCachedAudioBlobUrl,
} from './BibleOfflineStorage';

// ==================== Online Fetch (Base44) ====================
export async function fetchChapterTextOnline({
  languageCode,
  translationId,
  bookKey,
  chapterNumber,
}) {
  if (!languageCode || !translationId || !bookKey || !chapterNumber) {
    return { ok: false, status: 400, error: 'Missing required parameters' };
  }

  try {
    const rows = await base44.entities.BibleTextChapter.filter({
      language_code: languageCode,
      translation_id: translationId,
      book_key: bookKey,
      chapter_number: chapterNumber,
    });

    if (!rows?.length) {
      return { ok: false, status: 404, error: 'Chapter not found' };
    }

    return { ok: true, data: rows[0].verses_json };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      error: e?.message || 'Server error fetching text',
    };
  }
}

export async function fetchChapterAudioUrlOnline({
  languageCode,
  translationId,
  bookKey,
  chapterNumber,
}) {
  if (!languageCode || !translationId || !bookKey || !chapterNumber) {
    return { ok: false, status: 400, error: 'Missing required parameters' };
  }

  try {
    const rows = await base44.entities.AudioChapter.filter({
      language_code: languageCode,
      translation_id: translationId,
      book_key: bookKey,
      chapter_number: chapterNumber,
    });

    if (!rows?.length) {
      return { ok: false, status: 404, error: 'Audio not available' };
    }

    return { ok: true, data: rows[0].audio_url };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      error: e?.message || 'Server error fetching audio URL',
    };
  }
}

// ==================== Key Builder ====================
export function makeChapterKey({
  languageCode,
  translationId,
  bookKey,
  chapterNumber,
}) {
  return `${languageCode}:${translationId}:${bookKey}:${chapterNumber}`;
}

// ==================== Unified getChapter (Offline-First) ====================
export async function getChapter({
  languageCode,
  translationId,
  bookKey,
  chapterNumber,
}) {
  // Validate inputs
  if (!languageCode || !translationId || !bookKey || !chapterNumber) {
    return {
      ok: false,
      status: 400,
      error: 'Missing required parameters',
      text: null,
      audio: null,
      textSource: 'none',
      audioSource: 'none',
    };
  }

  const key = makeChapterKey({
    languageCode,
    translationId,
    bookKey,
    chapterNumber,
  });

  // ===== TEXT (Offline-First) =====
  let text = null;
  let textSource = 'none';

  // Try offline first
  const offlineText = await getTextOffline(key);
  if (offlineText) {
    text = offlineText;
    textSource = 'offline';
  } else {
    // Try online
    const onlineTextResult = await fetchChapterTextOnline({
      languageCode,
      translationId,
      bookKey,
      chapterNumber,
    });

    if (onlineTextResult.ok) {
      text = onlineTextResult.data;
      textSource = 'online';

      // Cache it for next time
      await setTextOffline(key, text).catch((e) => {
        console.warn('Failed to cache text:', e);
      });
    }
  }

  // ===== AUDIO (Offline-First) =====
  let audio = null;
  let audioSource = 'none';

  // Try cached audio first
  const cachedAudioUrl = await isAudioCached(key);
  if (cachedAudioUrl) {
    const blobUrl = await getCachedAudioBlobUrl(key);
    if (blobUrl) {
      audio = blobUrl;
      audioSource = 'offline';
    }
  }

  // If not cached, try online
  if (!audio) {
    const onlineAudioResult = await fetchChapterAudioUrlOnline({
      languageCode,
      translationId,
      bookKey,
      chapterNumber,
    });

    if (onlineAudioResult.ok) {
      audio = onlineAudioResult.data; // Stream URL
      audioSource = 'online';
    }
  }

  // Return result
  return {
    ok: !!(text || audio), // Success if we have either text or audio
    key,
    text,
    audio,
    textSource,
    audioSource,
  };
}