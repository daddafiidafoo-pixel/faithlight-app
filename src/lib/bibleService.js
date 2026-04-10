import { base44 } from '@/api/base44Client';
import { validateVerse, validateChapter, logValidationFailure } from './bibleVerification';
import { isBibleAvailableForLanguage } from './bibleAvailability';

// Client-side cache
const memoryCache = new Map();

function getCachedLocal(key) {
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  try {
    const stored = localStorage.getItem(`bible_cache:${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.expiresAt > Date.now()) {
        memoryCache.set(key, parsed);
        return parsed.data;
      } else {
        localStorage.removeItem(`bible_cache:${key}`);
      }
    }
  } catch {}
  return null;
}

function setCachedLocal(key, data, ttlMinutes = 1440) {
  const entry = { data, expiresAt: Date.now() + ttlMinutes * 60 * 1000 };
  memoryCache.set(key, entry);
  try { localStorage.setItem(`bible_cache:${key}`, JSON.stringify(entry)); } catch {}
}

function getCurrentLang() {
  try {
    const store = JSON.parse(localStorage.getItem('faithlight-language-store') || '{}');
    return store?.state?.bibleLanguage || store?.state?.uiLanguage || 'en';
  } catch {
    return 'en';
  }
}

export async function getVerseOfDay(lang) {
  const l = lang || getCurrentLang();
  const cacheKey = `verse-of-day:${l}`;
  const cached = getCachedLocal(cacheKey);
  if (cached) return cached;

  try {
    const response = await base44.functions.invoke('bibleAPI', {
      endpoint: '/bible/verse-of-day',
      lang: l,
    });
    if (response.data?.success && response.data.verse) {
      const verse = response.data.verse;
      // Validate before caching
      const { valid, errors, contentStatus } = validateVerse(verse, l);
      if (!valid) {
        logValidationFailure('getVerseOfDay', errors, verse?.reference);
      }
      verse.content_status = verse.content_status || contentStatus;
      setCachedLocal(cacheKey, verse, 1440);
      return verse;
    }
  } catch (err) {
    console.error('Error fetching verse of day:', err);
  }
  return { unavailable: true, message: 'verse_unavailable', language: l };
}

export async function getVerseByReference(ref, lang) {
  if (!ref) return null;
  const l = lang || getCurrentLang();
  const cacheKey = `verse_ref:${l}:${ref}`;
  const cached = getCachedLocal(cacheKey);
  if (cached) return cached;

  try {
    const response = await base44.functions.invoke('bibleAPI', {
      endpoint: '/bible/verse',
      ref,
      lang: l,
    });
    if (response.data?.success && response.data.verse) {
      const verse = response.data.verse;
      const { valid, errors, contentStatus } = validateVerse(verse, l);
      if (!valid) {
        logValidationFailure('getVerseByReference', errors, ref);
      }
      verse.content_status = verse.content_status || contentStatus;
      setCachedLocal(cacheKey, verse, 10080);
      return verse;
    }
  } catch (err) {
    console.error('Error fetching verse:', err);
  }
  return null;
}

export async function getChapter(book, chapter, lang) {
  if (!book || !chapter) return null;
  const l = lang || getCurrentLang();
  const cacheKey = `chapter:${l}:${book}:${chapter}`;
  const cached = getCachedLocal(cacheKey);
  if (cached) return cached;

  // Check if requested language is actually available before calling API
  const isBibleAvailable = isBibleAvailableForLanguage(l);
  if (!isBibleAvailable) {
    console.warn(`Bible not available for language: ${l}, defaulting to English`);
    return { unavailable: true, language: l, message: `Bible content not available in ${l}`, shouldFallbackToEnglish: true };
  }

  try {
    const response = await base44.functions.invoke('bibleAPI', {
      endpoint: '/bible/chapter',
      book,
      chapter: String(chapter),
      lang: l,  // Explicitly pass the language code to prevent silent English fallbacks
    });
    if (response.data?.chapter) {
      const chapterData = response.data.chapter;
      // Ensure language code is preserved in returned data
      if (!chapterData.language) {
        chapterData.language = l;
      }
      const { valid, errors } = validateChapter(chapterData, l);
      if (!valid) {
        logValidationFailure('getChapter', errors, `${book} ${chapter}`);
      }
      // Only cache valid chapters with real content
      if (valid || (chapterData.verses && chapterData.verses.length > 0)) {
        setCachedLocal(cacheKey, chapterData, 10080);
      }
      return chapterData;
    }
  } catch (err) {
    console.error(`Error fetching chapter in language ${l}:`, err);
  }
  return null;
}

export async function getBibleBooks(lang) {
  const l = lang || getCurrentLang();
  const cacheKey = `books-list:${l}`;
  const cached = getCachedLocal(cacheKey);
  if (cached) return cached;

  try {
    const response = await base44.functions.invoke('bibleAPI', {
      endpoint: '/bible/books',
      lang: l,
    });
    if (response.data?.success && response.data.books) {
      setCachedLocal(cacheKey, response.data.books, 43200);
      return response.data.books;
    }
  } catch (err) {
    console.error('Error fetching books:', err);
  }
  return [];
}