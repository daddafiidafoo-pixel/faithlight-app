import { useState, useCallback } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { isBibleAvailable, getActualBibleLanguage } from '@/lib/languageConfig';

/**
 * Hook for handling Bible language selection with fallback modal
 * When a language without Bible support is selected, shows fallback option
 */
export function useBibleLanguageWithFallback() {
  const { language, bibleLanguage, setBibleLanguage } = useLanguage();
  const [showFallback, setShowFallback] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState(null);

  const handleLanguageChangeWithBibleCheck = useCallback((newLanguage) => {
    // Check if Bible is available in requested language
    if (isBibleAvailable(newLanguage)) {
      // Bible is available, use it
      setBibleLanguage(newLanguage);
      setShowFallback(false);
    } else {
      // Bible not available, show fallback modal
      setPendingLanguage(newLanguage);
      setShowFallback(true);
    }
  }, [setBibleLanguage]);

  const handleConfirmEnglishFallback = useCallback(() => {
    // User confirmed they want to use English Bible
    setBibleLanguage('en');
    setShowFallback(false);
    setPendingLanguage(null);
  }, [setBibleLanguage]);

  const handleCancelFallback = useCallback(() => {
    setShowFallback(false);
    setPendingLanguage(null);
  }, []);

  return {
    bibleLanguage,
    showFallback,
    pendingLanguage,
    handleLanguageChangeWithBibleCheck,
    handleConfirmEnglishFallback,
    handleCancelFallback,
  };
}