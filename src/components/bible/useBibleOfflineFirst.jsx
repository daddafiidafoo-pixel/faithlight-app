import { useState, useEffect, useCallback } from 'react';
import { getChapterText, getChapterAudio, getTranslations, getDefaultTranslation } from '@/functions/BibleLibrary';

export function useBibleOfflineFirst(languageCode, translationId) {
  const [translations, setTranslations] = useState([]);
  const [selectedTranslation, setSelectedTranslation] = useState(translationId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // 'online' or 'offline'

  // Load available translations
  useEffect(() => {
    const loadTranslations = async () => {
      const res = await getTranslations(languageCode);
      if (res.ok) {
        setTranslations(res.data);
        
        // Set default translation if not specified
        if (!translationId) {
          const defaultRes = await getDefaultTranslation(languageCode);
          if (defaultRes.ok) {
            setSelectedTranslation(defaultRes.data.translation_id);
          }
        }
      }
    };

    loadTranslations();
  }, [languageCode, translationId]);

  // Load chapter text with offline fallback
  const loadChapterText = useCallback(
    async (bookKey, chapterNumber) => {
      setIsLoading(true);
      setError(null);

      const res = await getChapterText({
        languageCode,
        translationId: selectedTranslation,
        bookKey,
        chapterNumber,
      });

      if (res.ok) {
        setSource(res.source);
        setIsLoading(false);
        return res.data;
      } else {
        setError(res.error);
        setIsLoading(false);
        return null;
      }
    },
    [languageCode, selectedTranslation]
  );

  // Load chapter audio with offline fallback
  const loadChapterAudio = useCallback(
    async (bookKey, chapterNumber) => {
      setIsLoading(true);
      setError(null);

      const res = await getChapterAudio({
        languageCode,
        translationId: selectedTranslation,
        bookKey,
        chapterNumber,
      });

      if (res.ok) {
        setSource(res.source);
        setIsLoading(false);
        return res.data;
      } else {
        setError(res.error);
        setIsLoading(false);
        return null;
      }
    },
    [languageCode, selectedTranslation]
  );

  return {
    translations,
    selectedTranslation,
    setSelectedTranslation,
    loadChapterText,
    loadChapterAudio,
    isLoading,
    error,
    source,
  };
}