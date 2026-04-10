import { useLanguageStore } from '@/components/languageStore';
import { flattenLocale } from '@/components/i18n/index';

/**
 * Hook to safely translate keys using the selected UI language.
 * Reads from Zustand languageStore (kept in sync with I18nProvider).
 * Falls back to English if key not found in active language.
 */
export function useTranslation() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const translations = flattenLocale(uiLanguage);
  const fallback = flattenLocale('en');

  return (key) => {
    return translations[key] ?? fallback[key] ?? key;
  };
}