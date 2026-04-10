import React, { createContext, useContext, useEffect, useState } from 'react';
import { coreTranslations, getTranslation } from './coreTranslations';
import { getLanguageConfig, isBibleAvailable, getActualBibleLanguage } from '@/lib/languageConfig';
import { detectLanguage, saveLanguage, getSavedLanguage, isSupportedLanguage, getSupportedLanguages, getLanguageLabel } from '@/lib/languageDetection';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [bibleLanguage, setBibleLanguageState] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language detection on app startup
  // Priority: saved language > device/browser detection
  useEffect(() => {
    let mounted = true;
    
    async function initializeLanguage() {
      try {
        // Check saved language first (manual selection always wins)
        const saved = getSavedLanguage();
        if (saved && isSupportedLanguage(saved) && coreTranslations[saved]) {
          if (mounted) {
            setLanguageState(saved);
            const actualBibleLang = getActualBibleLanguage(saved);
            setBibleLanguageState(actualBibleLang);
          }
        } else {
          // Fall back to device/browser detection
          const detected = await detectLanguage();
          if (mounted && coreTranslations[detected]) {
            setLanguageState(detected);
            const actualBibleLang = getActualBibleLanguage(detected);
            setBibleLanguageState(actualBibleLang);
          }
        }
      } catch (error) {
        console.warn('Language detection failed, using default:', error);
      } finally {
        if (mounted) {
          setIsInitialized(true);
        }
      }
    }
    
    initializeLanguage();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Update DOM attributes when language changes (browser-only)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;
    document.documentElement.dir = ['ar', 'am'].includes(language) ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (newLanguage) => {
    if (coreTranslations[newLanguage]) {
      setLanguageState(newLanguage);
      
      // Automatically set Bible language to match if available, else use fallback
      const actualBibleLang = getActualBibleLanguage(newLanguage);
      setBibleLanguageState(actualBibleLang);
      
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          saveLanguage(newLanguage);
          // Write to BOTH storage keys so all language systems stay in sync
          localStorage.setItem('faithlight_language', newLanguage);
          localStorage.setItem('app_language', newLanguage);
          localStorage.setItem('faithlight_bible_language', actualBibleLang);
        } catch {}
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLanguage;
        document.documentElement.dir = ['ar', 'am'].includes(newLanguage) ? 'rtl' : 'ltr';
      }
      // Sync Zustand language store if available
      try {
        const stored = JSON.parse(localStorage.getItem('faithlight-language-store') || '{}');
        if (stored?.state) {
          stored.state.uiLanguage = newLanguage;
          stored.state.bibleLanguage = newLanguage;
          stored.state.audioLanguage = newLanguage;
          stored.state.aiLanguage = newLanguage;
          localStorage.setItem('faithlight-language-store', JSON.stringify(stored));
        }
      } catch {}
    }
  };

  const setBibleLanguage = (newBibleLanguage) => {
    if (isBibleAvailable(newBibleLanguage)) {
      setBibleLanguageState(newBibleLanguage);
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('faithlight_bible_language', newBibleLanguage);
        } catch {}
      }
    }
  };

  const t = (key) => {
    return getTranslation(coreTranslations, language, key);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      languageLabel: getLanguageLabel(language),
      supportedLanguages: getSupportedLanguages(),
      bibleLanguage,
      setBibleLanguage,
      isBibleAvailable: isBibleAvailable(bibleLanguage),
      languageConfig: getLanguageConfig(language),
      bibleLanguageConfig: getLanguageConfig(bibleLanguage),
      t, 
      isInitialized 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}