/**
 * FaithLight Global Localization Helpers
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for all localized value resolution.
 * Import these helpers everywhere instead of accessing raw _en / _om fields.
 *
 * Usage:
 *   import { getLocalizedValue, getLocalizedBookName,
 *            getLocalizedReference, safeT } from '@/components/lib/localization';
 */

import { BIBLE_BOOKS_BY_CODE } from './bibleBooks';

// ─── 1. Core field resolver ───────────────────────────────────────
/**
 * Read a localized field from any entity object.
 *
 * getLocalizedValue(book, "name", "om")
 *   → book.name_om  (if present)
 *   → book.name_en  (fallback)
 *   → ""            (safe empty)
 *
 * @param {object} entity        - any object with bilingual fields
 * @param {string} baseField     - field prefix: "name", "title", "description", "text", "content"
 * @param {string} language      - selected language code e.g. "en" | "om"
 * @param {string} fallbackLang  - fallback language code (default "en")
 * @returns {string}
 */
export function getLocalizedValue(entity, baseField, language, fallbackLang = 'en') {
  if (!entity || !baseField) return '';
  const primary = entity[`${baseField}_${language}`];
  if (primary && typeof primary === 'string' && primary.trim()) return primary.trim();
  const fallback = entity[`${baseField}_${fallbackLang}`];
  if (fallback && typeof fallback === 'string' && fallback.trim()) return fallback.trim();
  // Last resort: return bare field if it exists (un-suffixed, e.g. entity.name)
  const bare = entity[baseField];
  if (bare && typeof bare === 'string' && bare.trim()) return bare.trim();
  return '';
}

// ─── 2. Bible book name ───────────────────────────────────────────
/**
 * Return the correctly localized Bible book name.
 *
 * getLocalizedBookName(book, "om")  → "Faarfannaa"
 * getLocalizedBookName(book, "en")  → "Psalms"
 *
 * @param {object|string} book   - book object from BIBLE_BOOKS or a code string
 * @param {string} language
 * @returns {string}
 */
export function getLocalizedBookName(bookOrCode, language) {
  if (!bookOrCode) return '';
  let book = bookOrCode;
  if (typeof bookOrCode === 'string') {
    book = BIBLE_BOOKS_BY_CODE[bookOrCode.toUpperCase()] || null;
    if (!book) return bookOrCode; // unknown code — return as-is
  }
  if (language === 'om') return book.name_om || book.name_en || '';
  return book.name_en || '';
}

// ─── 3. Localized Bible reference ────────────────────────────────
/**
 * Build a correctly localized reference string.
 *
 * getLocalizedReference({ bookCode: "PSA", chapter: 103, verse: 12, language: "om" })
 *   → "Faarfannaa 103:12"
 *
 * getLocalizedReference({ bookCode: "JHN", chapter: 3, verse: 16, language: "en" })
 *   → "John 3:16"
 *
 * @param {{ bookCode, chapter, verse, language }}
 * @returns {string}
 */
export function getLocalizedReference({ bookCode, chapter, verse, language = 'en' }) {
  const book = BIBLE_BOOKS_BY_CODE[bookCode?.toUpperCase()] || null;
  const bookName = book ? getLocalizedBookName(book, language) : (bookCode || '');
  if (!chapter) return bookName;
  if (verse) return `${bookName} ${chapter}:${verse}`;
  return `${bookName} ${chapter}`;
}

// ─── 4. Safe translation wrapper ─────────────────────────────────
/**
 * Safely translate a UI key without ever returning a raw key string.
 *
 * safeT(t, "home.title", "FaithLight")  → translated value or "FaithLight"
 *
 * @param {Function} tFn          - the t() function from useI18n()
 * @param {string}   key          - i18n translation key
 * @param {string}   fallbackText - text to show if key is missing
 * @returns {string}
 */
export function safeT(tFn, key, fallbackText = '') {
  if (typeof tFn !== 'function') return fallbackText;
  const result = tFn(key, null); // pass null so we can detect missing
  // If result equals the key itself, it means no translation found
  if (!result || result === key) return fallbackText;
  return result;
}

// ─── 5. Localized plan/description helpers ───────────────────────
/**
 * Return localized plan title: checks title_om / title_en / title.
 */
export function getLocalizedPlanTitle(plan, language) {
  return getLocalizedValue(plan, 'title', language) || plan?.title || '';
}

/**
 * Return localized description: checks description_om / description_en / description.
 */
export function getLocalizedDescription(entity, language) {
  return getLocalizedValue(entity, 'description', language) || entity?.description || '';
}

// ─── 6. Search result labels ─────────────────────────────────────
/**
 * Return a localized label for a search result (book match, reference, etc.)
 *
 * @param {object} result  - { type, bookCode, text, ref }
 * @param {string} language
 * @returns {string}
 */
export function getLocalizedSearchLabel(result, language) {
  if (!result) return '';
  if (result.bookCode) {
    const book = BIBLE_BOOKS_BY_CODE[result.bookCode?.toUpperCase()];
    if (book) return getLocalizedBookName(book, language);
  }
  return result.text || result.ref || '';
}

// ─── 7. Verse text resolver ──────────────────────────────────────
/**
 * Return the correct verse text for the selected language.
 *
 * @param {object} verse    - verse object with text_en / text_om / text fields
 * @param {string} language
 * @returns {string}
 */
export function getLocalizedVerseText(verse, language) {
  if (!verse) return '';
  return getLocalizedValue(verse, 'text', language) || verse.text || '';
}

// ─── 8. localStorage language persistence (non-React) ────────────
const STORAGE_KEY = 'faithlight_language';

export function getCurrentLanguage() {
  try { return localStorage.getItem(STORAGE_KEY) || 'en'; } catch { return 'en'; }
}

export function setCurrentLanguage(lang) {
  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
}

// ─── 9. Pricing / service text ───────────────────────────────────
const BILLING_LABELS = {
  en: { perMonth: 'per month', perYear: 'per year', startingFrom: 'starting from', freeTrial: 'free trial', free: 'Free' },
  om: { perMonth: 'ji\'a tokkotti', perYear: 'waggaa tokkotti', startingFrom: 'irraa jalqabee', freeTrial: 'yaalii bilisaa', free: 'Bilisaa' },
};

export function getBillingLabel(key, language) {
  const labels = BILLING_LABELS[language] || BILLING_LABELS.en;
  return labels[key] || BILLING_LABELS.en[key] || key;
}