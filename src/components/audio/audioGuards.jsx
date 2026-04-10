/**
 * Production Guards for Audio Bible & Translation system
 * Prevents 500 errors by validating inputs and handling missing data safely
 * This is a FRONTEND utility — uses base44 client directly.
 */

import { base44 } from '@/api/base44Client';

// Simple assert helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`[Guard] ${message}`);
  }
}

/**
 * 1️⃣ GET TRANSLATIONS BY LANGUAGE
 * Safely fetches translations, returns empty/error object if none exist
 */
export async function getTranslationsByLanguage(languageCode) {
  try {
    assert(languageCode, 'languageCode is required');
    assert(typeof languageCode === 'string', 'languageCode must be a string');
    assert(languageCode.length <= 10, 'languageCode too long');

    if (languageCode === 'en') {
      return { ok: true, data: [] };
    }

    const records = await base44.entities.Translation.filter({
      language_code: languageCode,
      status: 'published'
    }).catch(() => []);

    if (!records || records.length === 0) {
      console.warn(`No translations found for language: ${languageCode}`);
      return { ok: false, error: 'No translations available for this language', status: 404 };
    }

    const dict = {};
    records.forEach(record => {
      if (record && record.key && record.value) {
        dict[record.key] = record.value;
      }
    });

    return { ok: true, data: dict };
  } catch (error) {
    console.error('[audioGuards] getTranslationsByLanguage error:', error);
    return { ok: false, error: error?.message || 'Failed to load translations', status: 500 };
  }
}

/**
 * 2️⃣ GET CHAPTER AUDIO
 * Safely fetches Bible verses for audio playback
 */
export async function getChapterAudio({ languageCode, translationId, bookKey, chapterNumber }) {
  try {
    assert(languageCode, 'languageCode is required');
    assert(translationId, 'translationId is required');
    assert(bookKey, 'bookKey is required');
    assert(chapterNumber !== undefined && chapterNumber !== null, 'chapterNumber is required');
    assert(typeof bookKey === 'string', 'bookKey must be string');
    assert(typeof chapterNumber === 'number' || !isNaN(parseInt(chapterNumber)), 'chapterNumber must be numeric');
    assert(chapterNumber > 0 && chapterNumber <= 200, 'chapterNumber out of range');

    const chapterNum = parseInt(chapterNumber);

    // Normalize translationId → version field format used in entity (e.g. "WEB" → "en_web")
    const VERSION_MAP = {
      WEB: 'en_web', KJV: 'en_kjv', ESV: 'en_esv', NIV: 'en_niv',
      AMHEVG: 'am_default', SWHNEN: 'sw_default', ARBVDV: 'ar_default',
      FRALSG: 'fr_default', ORMWHM: 'om_default',
    };
    const normalizedVersion = VERSION_MAP[translationId] || translationId.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Try with normalized version first, then raw translationId as fallback
    let verses = [];
    try {
      verses = await base44.entities.BibleVerse.filter({
        book_code: bookKey,
        chapter_number: chapterNum,
        version: normalizedVersion,
      }, 'verse_number', 500);
    } catch (err) {
      console.warn('[audioGuards] BibleVerse.filter (normalized) failed:', err?.message);
    }

    if (!verses || verses.length === 0) {
      try {
        verses = await base44.entities.BibleVerse.filter({
          book_code: bookKey,
          chapter_number: chapterNum,
          version: translationId,
        }, 'verse_number', 500);
      } catch (err) {
        console.warn('[audioGuards] BibleVerse.filter (raw) failed:', err?.message);
      }
    }

    if (!verses || verses.length === 0) {
      console.warn(`No verses found: ${bookKey} ${chapterNum} (${translationId})`);
      return {
        ok: false,
        error: `Audio not available for ${bookKey} ${chapterNum} in ${translationId}`,
        status: 404
      };
    }

    const validVerses = verses
      .filter(v => v && (v.verse_number || v.verse) && (v.verse_text || v.text))
      .map(v => ({ ...v, verse: v.verse_number ?? v.verse, text: v.verse_text ?? v.text }));

    if (validVerses.length === 0) {
      return { ok: false, error: 'Corrupted verse data', status: 500 };
    }

    return { ok: true, data: validVerses };
  } catch (error) {
    console.error('[audioGuards] getChapterAudio error:', error);
    return { ok: false, error: error?.message || 'Failed to load chapter audio', status: 500 };
  }
}

/**
 * 3️⃣ TRANSLATION RESET ON LANGUAGE CHANGE
 */
export async function ensureTranslationForLanguage(currentTranslation, targetLanguage) {
  try {
    assert(currentTranslation, 'currentTranslation is required');
    assert(targetLanguage, 'targetLanguage is required');

    if (targetLanguage === 'en') {
      return { ok: true, translation: currentTranslation };
    }

    const translations = await base44.entities.Translation.filter({
      language_code: targetLanguage,
      translation_id: currentTranslation,
      status: 'published'
    }, '-created_date', 1).catch(() => []);

    if (translations && translations.length > 0) {
      return { ok: true, translation: currentTranslation };
    }

    const defaultTranslation = await base44.entities.Translation.filter({
      language_code: targetLanguage,
      status: 'published'
    }, 'created_date', 1).catch(() => []);

    if (defaultTranslation && defaultTranslation.length > 0) {
      const newTranslation = defaultTranslation[0].translation_id || 'WEB';
      console.log(`[audioGuards] Resetting translation from ${currentTranslation} to ${newTranslation}`);
      return { ok: true, translation: newTranslation, reset: true };
    }

    console.warn(`No translations for language ${targetLanguage}, using WEB`);
    return { ok: true, translation: 'WEB', reset: true };
  } catch (error) {
    console.error('[audioGuards] ensureTranslationForLanguage error:', error);
    return { ok: true, translation: currentTranslation, error: error?.message };
  }
}

/**
 * HELPER: Safe verse access
 */
export function getSafeVerse(verses, index) {
  if (!verses || !Array.isArray(verses)) return null;
  const verse = verses[index];
  if (!verse || !verse.verse || !verse.text) return null;
  return verse;
}