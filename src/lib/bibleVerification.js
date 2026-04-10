/**
 * Bible Accuracy Validation Module
 * Validates Bible verse/chapter data before display, share, or download.
 *
 * Content status values:
 *   "verified_source"          — text from a licensed Bible API (Bible Brain, API.Bible, etc.)
 *   "verified_source_fallback" — verified English shown because requested language unavailable
 *   "ai_translated_fallback"   — AI-assisted translation, clearly labeled
 */

// Valid Bible book codes
const VALID_BOOK_CODES = new Set([
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI',
  '1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER',
  'LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP',
  'HAG','ZEC','MAL',
  'MAT','MAR','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL',
  '1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN',
  '3JN','JUD','REV',
]);

const VALID_LANG_CODES = new Set(['en','om','am','sw','ti','ar','fr','pt','es','sw']);

const TRANSLATION_KEY_PATTERN = /^[a-z_]+\.[a-z_]+$/; // e.g. "bible.verse_not_found"

/**
 * Validate a single verse object.
 * Returns { valid: boolean, errors: string[], contentStatus: string }
 */
export function validateVerse(verse, requestedLang = 'en') {
  const errors = [];

  if (!verse || typeof verse !== 'object') {
    return { valid: false, errors: ['verse object is null or not an object'], contentStatus: null };
  }

  // 1. Text must exist and be non-empty
  if (!verse.text || typeof verse.text !== 'string' || verse.text.trim().length === 0) {
    errors.push('verse text is empty or missing');
  }

  // 2. Reference must exist
  if (!verse.reference || typeof verse.reference !== 'string' || verse.reference.trim().length === 0) {
    errors.push('verse reference is empty or missing');
  }

  // 3. Text must not be a raw translation key
  if (verse.text && TRANSLATION_KEY_PATTERN.test(verse.text.trim())) {
    errors.push('verse text appears to be a raw translation key');
  }

  // 4. Text must not be a placeholder/error string
  if (verse.text) {
    const lower = verse.text.toLowerCase();
    if (
      lower.includes('scripture text for this chapter is being prepared') ||
      lower.includes('coming soon') ||
      lower.includes('[translation pending]') ||
      lower.includes('verse not found') ||
      lower.trim() === '' ||
      lower.trim() === '""'
    ) {
      errors.push('verse text is a placeholder or error message, not real scripture');
    }
  }

  // 5. Language code must be valid if present
  if (verse.language && !VALID_LANG_CODES.has(verse.language)) {
    errors.push(`unknown language code: ${verse.language}`);
  }

  // 6. Provider/version metadata check
  const hasProviderMeta = verse.source_provider || verse.version || verse.bible_id || verse.versionId;
  // Not a hard error — just note absence for QA
  const missingMeta = !hasProviderMeta;

  // 7. Determine content status
  let contentStatus = verse.content_status || null;
  if (!contentStatus) {
    if (verse.is_fallback || verse.fallback_used) {
      contentStatus = 'verified_source_fallback';
    } else if (verse.is_ai_translated) {
      contentStatus = 'ai_translated_fallback';
    } else if (hasProviderMeta) {
      contentStatus = 'verified_source';
    } else {
      // Can't confirm — treat as unverified
      contentStatus = 'unverified';
    }
  }

  // 8. AI-translated text must be labeled (soft warning, not hard error)
  if (contentStatus === 'ai_translated_fallback' && !verse.fallback_notice) {
    errors.push('ai_translated_fallback content is missing fallback_notice field');
  }

  return {
    valid: errors.length === 0,
    errors,
    contentStatus,
    missingProviderMeta: missingMeta,
  };
}

/**
 * Validate a chapter object.
 * Returns { valid: boolean, errors: string[], verseErrors: object, contentStatus: string }
 */
export function validateChapter(chapter, requestedLang = 'en') {
  const errors = [];
  const verseErrors = {};

  if (!chapter || typeof chapter !== 'object') {
    return { valid: false, errors: ['chapter object is null'], contentStatus: null };
  }

  if (!chapter.book) errors.push('chapter.book is missing');
  if (!chapter.chapter || isNaN(Number(chapter.chapter))) errors.push('chapter.chapter is invalid');
  if (!Array.isArray(chapter.verses) || chapter.verses.length === 0) errors.push('chapter.verses is empty or missing');

  // Check for placeholder chapter (single verse with placeholder text)
  if (Array.isArray(chapter.verses) && chapter.verses.length === 1) {
    const v = chapter.verses[0];
    if (v?.text?.toLowerCase().includes('being prepared')) {
      errors.push('chapter contains only a placeholder verse — not real scripture');
    }
  }

  // Validate individual verses
  if (Array.isArray(chapter.verses)) {
    chapter.verses.forEach((v, i) => {
      if (!v.text || v.text.trim().length === 0) {
        verseErrors[i + 1] = `verse ${v.verse || i + 1} has empty text`;
      }
    });
  }

  const contentStatus = chapter.content_status ||
    (chapter.is_fallback ? 'verified_source_fallback' :
     chapter.is_ai_translated ? 'ai_translated_fallback' :
     chapter.source_provider ? 'verified_source' : 'unverified');

  return {
    valid: errors.length === 0 && Object.keys(verseErrors).length === 0,
    errors,
    verseErrors,
    contentStatus,
  };
}

/**
 * Get user-facing notice for a content status + language combo.
 * Returns null if no notice needed (verified_source, requested language matches).
 */
export function getContentStatusNotice(contentStatus, langCode) {
  const notices = {
    verified_source_fallback: {
      en: 'This verse is not yet available in the selected language. Showing English.',
      om: 'Aayanni kun afaan filatameen hin argamne. Inglifaan dhiyaata.',
      am: 'ይህ ጥቅስ በተመረጠው ቋንቋ የለም። በእንግሊዝኛ ይታያል።',
      sw: 'Mstari huu haupatikani kwa lugha iliyochaguliwa. Kuonyesha kwa Kiingereza.',
      ti: 'እዚ ጥቅሲ ብዝተመርጸ ቋንቋ ኣይርከብን። ብእንግሊዝኛ ይረኣይ ኣሎ።',
      ar: 'هذه الآية غير متاحة باللغة المختارة. يتم العرض بالإنجليزية.',
    },
    ai_translated_fallback: {
      en: 'AI-assisted translation. For devotion and reference only — not a licensed Bible version.',
      om: 'Hiika AI — kadhannaa fi wabii qofa. Macaafa Qulqulluu mirkanaafame miti.',
      am: 'የ AI ትርጉም — ለጸሎትና ለማጣቀሻ ብቻ። የተፈቀደ የመጽሐፍ ቅዱስ ስሪት አይደለም።',
      sw: 'Tafsiri ya AI — kwa sala na marejeo tu. Sio toleo rasmi la Biblia.',
      ti: 'ናይ AI ትርጉም — ንጸሎትን ንጥቕሲን ጥራይ። ዝተፈቀደ ትርጉም ቅዱሳት መጻሕፍቲ ኣይኮነን።',
      ar: 'ترجمة بمساعدة الذكاء الاصطناعي — للصلاة والمرجع فقط. ليست نسخة كتاب مقدس مرخصة.',
    },
    unverified: {
      en: 'Source unverified. Please confirm this verse independently.',
      om: null,
      am: null,
      sw: null,
    },
  };

  if (contentStatus === 'verified_source') return null;
  const langNotices = notices[contentStatus];
  if (!langNotices) return null;
  return langNotices[langCode] || langNotices.en || null;
}

/**
 * Log a validation failure (client-side — for internal QA).
 */
export function logValidationFailure(context, errors, verseRef = '') {
  console.warn(`[BibleValidation] FAIL [${context}] ref="${verseRef}"`, errors);
}