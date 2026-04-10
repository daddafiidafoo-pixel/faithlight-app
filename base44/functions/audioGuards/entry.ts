/**
 * Production Guards for Audio Bible & Translation system
 * Prevents 500 errors by validating inputs and handling missing data safely
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
 * Safely fetches translations, returns 404 if none exist
 * Returns: { ok: true, data: [...] } or { ok: false, error: string, status: 404 }
 */
export async function getTranslationsByLanguage(languageCode) {
  try {
    // Guard: Validate input
    assert(languageCode, 'languageCode is required');
    assert(typeof languageCode === 'string', 'languageCode must be a string');
    assert(languageCode.length <= 10, 'languageCode too long');
    
    // Guard: Skip fetch for English (no translations needed)
    if (languageCode === 'en') {
      return { ok: true, data: [] };
    }

    // Query database
    const records = await base44.entities.Translation.filter({
      language_code: languageCode,
      status: 'published'
    });

    // Guard: Check if empty (404, not 500)
    if (!records || records.length === 0) {
      console.warn(`No translations found for language: ${languageCode}`);
      return { ok: false, error: 'No translations available for this language', status: 404 };
    }

    // Build dictionary safely
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
 * All 4 parameters required & validated
 * Returns: { ok: true, data: [...] } or { ok: false, error: string, status: number }
 */
export async function getChapterAudio({ languageCode, translationId, bookKey, chapterNumber }) {
  try {
    // Guard: Validate all 4 required fields
    assert(languageCode, 'languageCode is required');
    assert(translationId, 'translationId is required');
    assert(bookKey, 'bookKey is required');
    assert(chapterNumber !== undefined && chapterNumber !== null, 'chapterNumber is required');

    // Guard: Type checking
    assert(typeof languageCode === 'string', 'languageCode must be string');
    assert(typeof translationId === 'string', 'translationId must be string');
    assert(typeof bookKey === 'string', 'bookKey must be string');
    assert(typeof chapterNumber === 'number' || !isNaN(parseInt(chapterNumber)), 'chapterNumber must be numeric');

    // Guard: Reasonable bounds
    assert(chapterNumber > 0 && chapterNumber <= 200, 'chapterNumber out of range');

    const chapterNum = parseInt(chapterNumber);

    // Query database safely
    const verses = await base44.entities.BibleVerse.filter({
      book_code: bookKey,
      chapter_number: chapterNum,
      version: translationId
    }, 'verse_number', 500);

    // Guard: No verses found (404, not 500)
    if (!verses || verses.length === 0) {
      console.warn(`No verses found: ${bookKey} ${chapterNum} (${translationId})`);
      return { 
        ok: false, 
        error: `Audio not available for ${bookKey} ${chapterNum} in ${translationId}`, 
        status: 404 
      };
    }

    // Guard: Validate verses have required fields before returning
    // Map entity field names (verse_number, verse_text) to expected (verse, text)
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
 * When user changes language, verify translation belongs to that language
 * If not, reset to default translation for that language
 * Returns: { ok: true, translation: string } or { ok: false, error: string }
 */
export async function ensureTranslationForLanguage(currentTranslation, targetLanguage) {
  try {
    // Guard: Validate inputs
    assert(currentTranslation, 'currentTranslation is required');
    assert(targetLanguage, 'targetLanguage is required');

    // No-op for English
    if (targetLanguage === 'en') {
      return { ok: true, translation: currentTranslation };
    }

    // Query if translation exists for this language
    const translations = await base44.entities.Translation.filter({
      language_code: targetLanguage,
      translation_id: currentTranslation,
      status: 'published'
    }, '-created_date', 1);

    // If translation found for this language, keep it
    if (translations && translations.length > 0) {
      return { ok: true, translation: currentTranslation };
    }

    // Otherwise, try to find DEFAULT translation for this language
    // (assume first published translation is default)
    const defaultTranslation = await base44.entities.Translation.filter({
      language_code: targetLanguage,
      status: 'published'
    }, 'created_date', 1);

    if (defaultTranslation && defaultTranslation.length > 0) {
      const newTranslation = defaultTranslation[0].translation_id || 'WEB';
      console.log(`[audioGuards] Resetting translation from ${currentTranslation} to ${newTranslation}`);
      return { ok: true, translation: newTranslation, reset: true };
    }

    // Fallback to WEB if nothing found
    console.warn(`No translations for language ${targetLanguage}, using WEB`);
    return { ok: true, translation: 'WEB', reset: true };
  } catch (error) {
    console.error('[audioGuards] ensureTranslationForLanguage error:', error);
    // Return current translation as safe fallback
    return { ok: true, translation: currentTranslation, error: error?.message };
  }
}

/**
 * HELPER: Safe verse access
 * Prevents null reference errors when accessing verse data
 */
export function getSafeVerse(verses, index) {
  if (!verses || !Array.isArray(verses)) return null;
  const verse = verses[index];
  if (!verse || !verse.verse || !verse.text) return null;
  return verse;
}