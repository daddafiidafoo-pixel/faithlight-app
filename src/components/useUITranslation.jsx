import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const TRANSLATION_CACHE = {};
// Track in-flight requests to avoid duplicate parallel calls
const IN_FLIGHT = {};

export function useUITranslation(languageCode = 'en') {
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTranslations = async () => {
      if (!languageCode || typeof languageCode !== 'string') return;

      // Serve from cache immediately
      if (TRANSLATION_CACHE[languageCode]) {
        setTranslations(TRANSLATION_CACHE[languageCode]);
        return;
      }

      // Only fetch if user is authenticated — avoids 500s for guests
      let authenticated = false;
      try { authenticated = await base44.auth.isAuthenticated(); } catch { return; }
      if (!authenticated) return;

      // Deduplicate concurrent calls for the same language
      if (IN_FLIGHT[languageCode]) {
        const result = await IN_FLIGHT[languageCode];
        setTranslations(result);
        return;
      }

      setIsLoading(true);
      IN_FLIGHT[languageCode] = (async () => {
        try {
          const data = await base44.entities.Translation.filter(
            { language_code: languageCode, status: 'published' },
            '-created_date', 1000
          );
          const map = {};
          if (Array.isArray(data)) {
            data.forEach((t) => { if (t?.key && t?.value) map[t.key] = t.value; });
          }
          TRANSLATION_CACHE[languageCode] = map;
          return map;
        } catch {
          return {};
        } finally {
          delete IN_FLIGHT[languageCode];
        }
      })();

      const result = await IN_FLIGHT[languageCode].catch(() => ({}));
      setTranslations(result);
      setIsLoading(false);
    };

    fetchTranslations();
  }, [languageCode]);

  // Return a function that translates keys with fallbacks
  const t = (key, defaultValue = key) => {
    return translations[key] || defaultValue;
  };

  return { t, translations, isLoading };
}