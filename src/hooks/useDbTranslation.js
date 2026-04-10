import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// In-memory cache for translations
const translationCache = new Map();

export function useDbTranslation(languageCode) {
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      // Check cache first
      if (translationCache.has(languageCode)) {
        setTranslations(translationCache.get(languageCode));
        setLoading(false);
        return;
      }

      try {
        const records = await base44.entities.Translation.filter(
          { language_code: languageCode },
          undefined,
          1000
        );
        
        const trans = {};
        records.forEach(record => {
          trans[record.key] = record.text;
        });
        
        translationCache.set(languageCode, trans);
        setTranslations(trans);
      } catch (error) {
        console.error(`Failed to load translations for ${languageCode}:`, error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [languageCode]);

  const t = (key, fallback = key) => {
    return translations[key] || fallback;
  };

  return { t, loading, translations };
}