/**
 * useLocale — one-stop hook for all localization needs.
 *
 * Combines the live language from I18nProvider with all localization helpers
 * so every component gets a single, consistent API.
 *
 * Usage:
 *   import { useLocale } from '@/components/lib/useLocale';
 *
 *   const { lang, t, safeT, bookName, ref, locVal, verseText } = useLocale();
 *
 *   bookName(book)                     → "Faarfannaa" | "Psalms"
 *   ref({ bookCode:"PSA", chapter:103, verse:12 })  → "Faarfannaa 103:12"
 *   locVal(entity, "description")      → entity.description_om | entity.description_en
 *   safeT("home.title", "FaithLight")  → translated or fallback, never raw key
 *   verseText(verse)                   → verse.text_om | verse.text_en | verse.text
 */

import { useI18n } from '../I18nProvider';
import {
  getLocalizedValue,
  getLocalizedBookName,
  getLocalizedReference,
  getLocalizedVerseText,
  getLocalizedPlanTitle,
  getLocalizedDescription,
  getLocalizedSearchLabel,
  getBillingLabel,
  safeT as _safeT,
} from './localization';

export function useLocale() {
  const { lang, setLang, t, isRTL, isLoading } = useI18n();

  /** Safely translate a UI key. Never returns raw key string. */
  const safeT = (key, fallbackText = '') => _safeT(t, key, fallbackText);

  /** Localized Bible book name */
  const bookName = (bookOrCode) => getLocalizedBookName(bookOrCode, lang);

  /** Localized Bible reference string: { bookCode, chapter, verse? } */
  const ref = ({ bookCode, chapter, verse } = {}) =>
    getLocalizedReference({ bookCode, chapter, verse, language: lang });

  /** Localized entity field: locVal(entity, "name") */
  const locVal = (entity, baseField, fallbackLang = 'en') =>
    getLocalizedValue(entity, baseField, lang, fallbackLang);

  /** Localized verse text */
  const verseText = (verse) => getLocalizedVerseText(verse, lang);

  /** Localized plan title */
  const planTitle = (plan) => getLocalizedPlanTitle(plan, lang);

  /** Localized description */
  const description = (entity) => getLocalizedDescription(entity, lang);

  /** Localized search result label */
  const searchLabel = (result) => getLocalizedSearchLabel(result, lang);

  /** Billing period labels */
  const billingLabel = (key) => getBillingLabel(key, lang);

  return {
    lang,
    setLang,
    t,
    safeT,
    isRTL,
    isLoading,
    // helpers
    bookName,
    ref,
    locVal,
    verseText,
    planTitle,
    description,
    searchLabel,
    billingLabel,
  };
}