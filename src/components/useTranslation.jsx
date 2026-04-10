import { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { OROMO_GLOSSARY } from '@/functions/translations';

/**
 * Hook to get translations for current language
 * Falls back to Oromo glossary for English keys, then English key itself
 */
export function useTranslation(languageCode = 'en') {
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!languageCode || inFlight.current) return;

    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        if (!languageCode) {
          setTranslations({});
          return;
        }

        if (languageCode !== 'en') {
          // Guard: Validate language code
          if (typeof languageCode !== 'string' || languageCode.length > 10) {
            throw new Error(`Invalid language code: ${languageCode}`);
          }

          // Guard: Check base44 is available
          if (!base44?.entities?.Translation) {
            console.warn('[useTranslation] Translation entity not available');
            setTranslations({});
            return;
          }

          const translationRecords = await base44.entities.Translation.filter({
            language_code: languageCode,
            status: 'published'
          });

          // Guard: Handle empty results safely
          if (!translationRecords || !Array.isArray(translationRecords)) {
            console.warn(`[useTranslation] No translations for ${languageCode}`);
            setTranslations({});
            return;
          }

          // Guard: Build dict safely (skip invalid records)
          const dict = {};
          translationRecords.forEach(t => {
            if (t && t.key && t.value) {
              dict[t.key] = t.value;
            }
          });
          setTranslations(dict);
        } else {
          setTranslations({});
        }
      } catch (error) {
        console.error('[useTranslation] Error loading translations:', error);
        // Fail gracefully - use defaults
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    inFlight.current = true;
    loadTranslations().finally(() => {
      inFlight.current = false;
    });
  }, [languageCode]);

  const t = (key, defaultValue) => {
    // Direct match in translations
    if (translations[key]) {
      return translations[key];
    }

    // Fallback to Oromo glossary if language is Oromo
    if (languageCode === 'om' && OROMO_GLOSSARY[key]) {
      return OROMO_GLOSSARY[key];
    }

    // Return provided default or the key itself
    return defaultValue || key;
  };

  return {
    t,
    isLoading,
    translations,
    currentLanguage: languageCode,
  };
}

/**
 * Get a single translation key synchronously (if available)
 */
export function translateKey(key, languageCode = 'en') {
  if (languageCode === 'om' && OROMO_GLOSSARY[key]) {
    return OROMO_GLOSSARY[key];
  }
  return key;
}