import {
  fetchChapterTextOnline,
  fetchChapterAudioUrlOnline,
  makeChapterKey,
} from './BibleChapterFetch';
import { setTextOffline, cacheAudioFile } from './BibleOfflineStorage';

/**
 * Download a chapter (text + audio) for offline use
 * Handles partial success: text-only is still valuable even if audio fails
 */
export async function downloadChapter({
  languageCode,
  translationId,
  bookKey,
  chapterNumber,
}) {
  // Validate params
  if (!languageCode || !translationId || !bookKey || !chapterNumber) {
    return {
      ok: false,
      status: 400,
      error: 'Missing required parameters',
      textDownloaded: false,
      audioDownloaded: false,
      audioUnavailable: false,
      errors: [{ part: 'all', message: 'Missing required parameters' }],
    };
  }

  const key = makeChapterKey({
    languageCode,
    translationId,
    bookKey,
    chapterNumber,
  });

  const errors = [];
  let textDownloaded = false;
  let audioDownloaded = false;
  let audioUnavailable = false;

  // ===== TEXT DOWNLOAD =====
  try {
    const textResult = await fetchChapterTextOnline({
      languageCode,
      translationId,
      bookKey,
      chapterNumber,
    });

    if (textResult.ok && textResult.data) {
      await setTextOffline(key, textResult.data);
      textDownloaded = true;
    } else if (textResult.status === 404) {
      errors.push({ part: 'text', message: 'Chapter not found' });
    } else {
      errors.push({ part: 'text', message: textResult.error || 'Text download failed' });
    }
  } catch (e) {
    errors.push({ part: 'text', message: e?.message || 'Text download error' });
  }

  // ===== AUDIO DOWNLOAD =====
  try {
    const audioResult = await fetchChapterAudioUrlOnline({
      languageCode,
      translationId,
      bookKey,
      chapterNumber,
    });

    if (audioResult.ok && audioResult.data) {
      const cached = await cacheAudioFile(key, audioResult.data);
      if (cached) {
        audioDownloaded = true;
      } else {
        errors.push({ part: 'audio', message: 'Failed to cache audio file' });
      }
    } else if (audioResult.status === 404) {
      audioUnavailable = true; // This translation has no audio for this chapter
    } else {
      errors.push({ part: 'audio', message: audioResult.error || 'Audio download failed' });
    }
  } catch (e) {
    errors.push({ part: 'audio', message: e?.message || 'Audio download error' });
  }

  // ===== RETURN RESULT =====
  // Success if at least text downloaded (audio is optional)
  return {
    ok: textDownloaded || audioDownloaded,
    key,
    textDownloaded,
    audioDownloaded,
    audioUnavailable,
    errors,
  };
}

/**
 * Check if chapter is already downloaded
 */
export async function isChapterDownloaded({
  languageCode,
  translationId,
  bookKey,
  chapterNumber,
}) {
  const { textSource, audioSource } = await (async () => {
    const { getTextOffline } = await import('./BibleOfflineStorage');
    const { isAudioCached } = await import('./BibleOfflineStorage');
    const key = makeChapterKey({
      languageCode,
      translationId,
      bookKey,
      chapterNumber,
    });

    const text = await getTextOffline(key);
    const audio = await isAudioCached(key);

    return {
      textSource: text ? 'offline' : 'none',
      audioSource: audio ? 'offline' : 'none',
    };
  })();

  return {
    isFullyDownloaded: textSource === 'offline' && audioSource === 'offline',
    hasText: textSource === 'offline',
    hasAudio: audioSource === 'offline',
  };
}