/**
 * Bible Data Service
 *
 * Language → translation_code mapping:
 *   en → english_bible
 *   om → oromo_bible
 *   am → amharic_bible
 *
 * Rule: Scripture text comes ONLY from verified StructuredBibleVerse rows.
 *       Never machine-translate. Never AI-generate verse text.
 *
 * Actions:
 *   getChapter    - all verses for a translation_code + book_key + chapter
 *   getVerse      - single verse
 *   search        - keyword search within a language dataset
 *   getVerseOfDay - resolve today's day_key reference → verse text for a language
 *   getBooks      - list of books for a given translation_code
 *   getTranslations - list all active translations
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Language → translation_code map
const TRANSLATION_MAP = {
  en: 'english_bible',
  om: 'oromo_bible',
  am: 'amharic_bible',
  fr: 'french_bible',
  sw: 'swahili_bible',
  pt: 'portuguese_bible',
  es: 'spanish_bible',
  ar: 'arabic_bible',
};

const MISSING_MSG = {
  om: 'Aayatni afaan kanaan amma hin argamu.',
  am: 'ይህ ቁጥር በዚህ ቋንቋ አልተገኘም።',
  en: 'This verse is not yet available in the selected language.',
};

function missingMsg(lang) {
  return MISSING_MSG[lang] || MISSING_MSG.en;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, language, translation_code: explicitCode, book_key, chapter, verse, keyword, day_key } = body;

    if (!action) return Response.json({ error: 'action is required' }, { status: 400 });

    // Resolve translation_code: caller may pass explicitly, or we derive from language
    const translationCode = explicitCode || (language ? TRANSLATION_MAP[language] : null);
    if (!translationCode && action !== 'getTranslations') {
      return Response.json({ error: 'language or translation_code is required' }, { status: 400 });
    }

    // ── GET TRANSLATIONS ────────────────────────────────────────────────────────
    if (action === 'getTranslations') {
      const list = await base44.asServiceRole.entities.BibleTranslation.filter(
        { is_active: true }, 'language_code', 50
      );
      return Response.json({ translations: list || [] });
    }

    // ── GET BOOKS ───────────────────────────────────────────────────────────────
    if (action === 'getBooks') {
      const books = await base44.asServiceRole.entities.BibleBook.filter(
        { translation_code: translationCode }, 'book_order', 100
      );
      return Response.json({ books: books || [], translation_code: translationCode });
    }

    // ── GET CHAPTER ─────────────────────────────────────────────────────────────
    if (action === 'getChapter') {
      if (!book_key || chapter == null) {
        return Response.json({ error: 'book_key and chapter are required' }, { status: 400 });
      }

      const verses = await base44.asServiceRole.entities.StructuredBibleVerse.filter(
        { translation_code: translationCode, book_key, chapter },
        'verse', 1000
      );

      if (!verses || verses.length === 0) {
        return Response.json({
          verses: [],
          missing: true,
          translation_code: translationCode,
          message: missingMsg(language)
        });
      }

      return Response.json({ verses, translation_code: translationCode });
    }

    // ── GET SINGLE VERSE ────────────────────────────────────────────────────────
    if (action === 'getVerse') {
      if (!book_key || chapter == null || verse == null) {
        return Response.json({ error: 'book_key, chapter and verse are required' }, { status: 400 });
      }

      const results = await base44.asServiceRole.entities.StructuredBibleVerse.filter(
        { translation_code: translationCode, book_key, chapter, verse },
        'verse', 1
      );

      if (!results || results.length === 0) {
        return Response.json({
          verse: null,
          missing: true,
          translation_code: translationCode,
          message: missingMsg(language)
        });
      }

      return Response.json({ verse: results[0], translation_code: translationCode });
    }

    // ── SEARCH ──────────────────────────────────────────────────────────────────
    if (action === 'search') {
      if (!keyword || keyword.trim().length < 2) {
        return Response.json({ error: 'keyword must be at least 2 characters' }, { status: 400 });
      }

      const allVerses = await base44.asServiceRole.entities.StructuredBibleVerse.filter(
        { translation_code: translationCode },
        'book_order', 5000
      );

      const lower = keyword.toLowerCase();
      const matches = (allVerses || [])
        .filter(v => v.text && v.text.toLowerCase().includes(lower))
        .slice(0, 50);

      return Response.json({ results: matches, total: matches.length, translation_code: translationCode });
    }

    // ── VERSE OF THE DAY ────────────────────────────────────────────────────────
    if (action === 'getVerseOfDay') {
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const key = day_key || `${mm}-${dd}`;

      // Step 1: get the reference for this day
      const refs = await base44.asServiceRole.entities.VerseOfDay.filter(
        { day_key: key }, 'day_key', 1
      );

      const ref = (refs && refs.length > 0)
        ? refs[0]
        : { book_key: 'james', chapter: 1, verse: 17 }; // default fallback reference

      // Step 2: fetch verse text from correct language dataset
      const results = await base44.asServiceRole.entities.StructuredBibleVerse.filter(
        { translation_code: translationCode, book_key: ref.book_key, chapter: ref.chapter, verse: ref.verse },
        'verse', 1
      );

      if (!results || results.length === 0) {
        return Response.json({
          verse: null,
          missing: true,
          ref,
          translation_code: translationCode,
          message: missingMsg(language)
        });
      }

      return Response.json({ verse: results[0], ref, translation_code: translationCode });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });

  } catch (error) {
    console.error('[bibleDataService] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});