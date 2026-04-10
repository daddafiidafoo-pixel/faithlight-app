import { base44 } from '@/api/base44Client';

// ==================== Cache Prefixes ====================
const OFFLINE_TEXT_PREFIX = 'offline_bible_text_';
const OFFLINE_AUDIO_PREFIX = 'offline_bible_audio_';

// ==================== Backwards Compatibility ====================
// This module is being refactored. Core functions moved to BibleChapterFetch.js
// Keeping old API for now to avoid breaking existing code.

function getCacheKey(languageCode, translationId, bookKey, chapterNumber) {
  return `${languageCode}:${translationId}:${bookKey}:${chapterNumber}`;
}

// ==================== Get Translations ====================
export async function getTranslations(languageCode) {
  if (!languageCode) {
    return { ok: false, status: 400, error: 'languageCode required' };
  }

  try {
    const rows = await base44.entities.BibleTranslations.filter({
      language_code: languageCode,
      is_active: true,
    });

    if (!rows?.length) {
      return { ok: false, status: 404, error: 'No translations found' };
    }

    return { ok: true, data: rows, source: 'online' };
  } catch (e) {
    return { ok: false, status: 500, error: e?.message || 'Server error' };
  }
}

// ==================== Get Chapter Text (Offline-First) ====================
export async function getChapterText({
  languageCode,
  translationId,
  bookKey,
  chapterNumber,
}) {
  if (!languageCode || !translationId || !bookKey || !chapterNumber) {
    return { ok: false, status: 400, error: 'Missing required parameters' };
  }

  const key = getCacheKey(languageCode, translationId, bookKey, chapterNumber);

  // 1) Check offline cache first
  const cached = localStorage.getItem(`${OFFLINE_TEXT_PREFIX}${key}`);
  if (cached) {
    try {
      return {
        ok: true,
        data: JSON.parse(cached),
        source: 'offline',
      };
    } catch (e) {
      console.warn('Failed to parse cached text:', e);
    }
  }

  // 2) Try to fetch from Base44
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

    const chapter = rows[0].verses_json;

    // Save to offline cache
    localStorage.setItem(`${OFFLINE_TEXT_PREFIX}${key}`, JSON.stringify(chapter));

    return { ok: true, data: chapter, source: 'online' };
  } catch (e) {
    // 3) No online connection and no offline cache
    return {
      ok: false,
      status: 500,
      error: e?.message || 'Failed loading chapter',
      source: 'error',
    };
  }
}

// ==================== Get Chapter Audio (Offline-First) ====================
export async function getChapterAudio({
  languageCode,
  translationId,
  bookKey,
  chapterNumber,
}) {
  if (!languageCode || !translationId || !bookKey || !chapterNumber) {
    return { ok: false, status: 400, error: 'Missing required parameters' };
  }

  const key = getCacheKey(languageCode, translationId, bookKey, chapterNumber);

  // 1) Check offline audio first
  const cachedAudio = localStorage.getItem(`${OFFLINE_AUDIO_PREFIX}${key}`);
  if (cachedAudio) {
    try {
      const audioData = JSON.parse(cachedAudio);
      return {
        ok: true,
        data: audioData,
        source: 'offline',
      };
    } catch (e) {
      console.warn('Failed to parse cached audio:', e);
    }
  }

  // 2) Try to fetch from Base44
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

    const audioData = {
      audio_url: rows[0].audio_url,
      duration_seconds: rows[0].duration_seconds,
      file_size_bytes: rows[0].file_size_bytes,
    };

    // Save metadata to offline cache
    localStorage.setItem(`${OFFLINE_AUDIO_PREFIX}${key}`, JSON.stringify(audioData));

    return { ok: true, data: audioData, source: 'online' };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      error: e?.message || 'Failed loading audio',
      source: 'error',
    };
  }
}

// ==================== Get Default Translation ====================
export async function getDefaultTranslation(languageCode) {
  try {
    const rows = await base44.entities.BibleTranslations.filter({
      language_code: languageCode,
      is_default_for_language: true,
      is_active: true,
    });

    if (rows?.length) {
      return { ok: true, data: rows[0] };
    }

    // Fallback: get any active translation for this language
    const allRows = await base44.entities.BibleTranslations.filter({
      language_code: languageCode,
      is_active: true,
    });

    if (allRows?.length) {
      return { ok: true, data: allRows[0] };
    }

    return { ok: false, status: 404, error: 'No translations found' };
  } catch (e) {
    return { ok: false, status: 500, error: e?.message };
  }
}

// ==================== Preload Starter Pack ====================
export async function preloadStarterPack(languageCode = 'en') {
  const starterBooks = [
    { bookKey: 'GEN', chapters: [1, 2, 3] },
    { bookKey: 'JHN', chapters: [1] },
    { bookKey: 'PSA', chapters: [23] },
  ];

  try {
    // Get default translation
    const transRes = await getDefaultTranslation(languageCode);
    if (!transRes.ok) {
      console.warn('Could not get default translation for starter pack');
      return { ok: false, status: 404 };
    }

    const translationId = transRes.data.translation_id;
    let preloadedCount = 0;

    // Preload each chapter
    for (const book of starterBooks) {
      for (const chapter of book.chapters) {
        const result = await getChapterText({
          languageCode,
          translationId,
          bookKey: book.bookKey,
          chapterNumber: chapter,
        });

        if (result.ok) {
          preloadedCount++;
        }
      }
    }

    // Mark as preloaded
    localStorage.setItem('bibleStarterPackLoaded', 'true');

    return {
      ok: true,
      preloadedCount,
      message: `Preloaded ${preloadedCount} chapters`,
    };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      error: e?.message || 'Failed preloading starter pack',
    };
  }
}

// ==================== Clear Offline Cache ====================
export function clearOfflineCache(key = null) {
  if (key) {
    localStorage.removeItem(`${OFFLINE_TEXT_PREFIX}${key}`);
    localStorage.removeItem(`${OFFLINE_AUDIO_PREFIX}${key}`);
  } else {
    // Clear all offline Bible data
    const keys = Object.keys(localStorage);
    keys.forEach((k) => {
      if (k.startsWith(OFFLINE_TEXT_PREFIX) || k.startsWith(OFFLINE_AUDIO_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  }
}

// ==================== Get Cached Chapters ====================
export function getCachedChapters() {
  const cached = [];
  const keys = Object.keys(localStorage);

  keys.forEach((k) => {
    if (k.startsWith(OFFLINE_TEXT_PREFIX)) {
      const cacheKey = k.replace(OFFLINE_TEXT_PREFIX, '');
      cached.push(cacheKey);
    }
  });

  return cached;
}

// ==================== Get Offline Storage Size ====================
export function getOfflineStorageSize() {
  let totalSize = 0;

  const keys = Object.keys(localStorage);
  keys.forEach((k) => {
    if (k.startsWith(OFFLINE_TEXT_PREFIX) || k.startsWith(OFFLINE_AUDIO_PREFIX)) {
      totalSize += localStorage.getItem(k).length;
    }
  });

  // Convert to MB
  return (totalSize / 1024 / 1024).toFixed(2);
}

// ==================== Sync Status Check ====================
export async function checkBibleSyncStatus(params) {
  // Simple online/offline check — avoids querying non-existent entities
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  return { ok: isOnline, status: isOnline ? 'online' : 'offline' };
}

// ==================== Check if Chapter is Offline ====================
export function isChapterOffline(params) {
  // Normalize params: accept both string (legacy) and object format
  const p = typeof params === 'string' ? { lang: params } : params;
  const { lang, bookId, chapterNumber } = p || {};
  
  if (!lang || !bookId || !chapterNumber) {
    console.warn('isChapterOffline: missing required { lang, bookId, chapterNumber }', p);
    return false;
  }

  const cacheKey = getCacheKey(lang, 'WEB', bookId, chapterNumber);
  const cached = localStorage.getItem(`${OFFLINE_TEXT_PREFIX}${cacheKey}`);
  return !!cached;
}