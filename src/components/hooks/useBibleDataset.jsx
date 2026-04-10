import { useState, useEffect, useCallback } from 'react';
import {
  getVerse,
  getChapter,
  getAvailableBooks,
  getLanguageConfig,
  getAllLanguages,
  getLocalizedBookName,
} from '@/lib/bibleDatasetsService';

/**
 * React hook for loading Bible content with language support and fallback
 * 
 * @param {string} selectedLanguage - Language code (en, om, am, sw, ti)
 * @returns {Object} Hook state and methods
 * 
 * @example
 * const { loadVerse, verse, loading, error, fallbackUsed } = useBibleDataset('om');
 * 
 * useEffect(() => {
 *   loadVerse('john', 3, 16);
 * }, []);
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * 
 * return (
 *   <div>
 *     {fallbackUsed && <p>Note: Viewing in {verse.language}</p>}
 *     <p>{verse.text}</p>
 *   </div>
 * );
 */
export function useBibleDataset(selectedLanguage = 'en') {
  const [verse, setVerse] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [languageConfig, setLanguageConfig] = useState(null);

  // Initialize language config
  useEffect(() => {
    const config = getLanguageConfig(selectedLanguage);
    setLanguageConfig(config);
  }, [selectedLanguage]);

  // Load a single verse
  const loadVerse = useCallback(
    async (bookId, chapterNum, verseNum) => {
      setLoading(true);
      setError(null);
      setVerse(null);
      setFallbackUsed(false);

      try {
        const result = await getVerse({
          bookId,
          chapter: chapterNum,
          verse: verseNum,
          selectedLanguage,
        });

        if (result.success) {
          setVerse(result);
          setFallbackUsed(result.fallbackUsed);
        } else {
          setError(result.error);
          setVerse(null);
        }
      } catch (err) {
        setError(`Failed to load verse: ${err.message}`);
        setVerse(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedLanguage]
  );

  // Load a full chapter
  const loadChapter = useCallback(
    async (bookId, chapterNum) => {
      setLoading(true);
      setError(null);
      setChapter(null);
      setFallbackUsed(false);

      try {
        const result = await getChapter({
          bookId,
          chapter: chapterNum,
          selectedLanguage,
        });

        if (result.success) {
          setChapter(result);
          setFallbackUsed(result.fallbackUsed);
        } else {
          setError(result.error);
          setChapter(null);
        }
      } catch (err) {
        setError(`Failed to load chapter: ${err.message}`);
        setChapter(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedLanguage]
  );

  // Load available books for the language
  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAvailableBooks(selectedLanguage);
      setBooks(result);
    } catch (err) {
      setError(`Failed to load books: ${err.message}`);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLanguage]);

  // Get localized book name
  const getBookName = useCallback(
    async (bookId) => {
      try {
        return await getLocalizedBookName(bookId, selectedLanguage);
      } catch (err) {
        console.error(`Failed to get book name: ${err.message}`);
        return { id: bookId, name: bookId, language: selectedLanguage };
      }
    },
    [selectedLanguage]
  );

  return {
    // State
    verse,
    chapter,
    books,
    loading,
    error,
    fallbackUsed,
    languageConfig,

    // Methods
    loadVerse,
    loadChapter,
    loadBooks,
    getBookName,

    // Metadata
    selectedLanguage,
  };
}

/**
 * Hook for managing language selection with dataset awareness
 * Provides list of supported languages and their metadata
 * 
 * @returns {Object} Hook state and methods
 * 
 * @example
 * const { languages, selectedLanguage, setSelectedLanguage } = useLanguageSelector();
 * 
 * return (
 *   <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
 *     {languages.map(lang => (
 *       <option key={lang.code} value={lang.code}>
 *         {lang.native_name || lang.language_name}
 *       </option>
 *     ))}
 *   </select>
 * );
 */
export function useLanguageSelector(defaultLanguage = 'en') {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const allLangs = getAllLanguages();
    setLanguages(allLangs);
  }, []);

  const changeLanguage = useCallback((langCode) => {
    const config = getLanguageConfig(langCode);
    if (config) {
      setSelectedLanguage(langCode);
      return true;
    }
    return false;
  }, []);

  return {
    languages,
    selectedLanguage,
    setSelectedLanguage: changeLanguage,
  };
}