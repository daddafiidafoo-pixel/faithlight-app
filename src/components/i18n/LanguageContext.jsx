import React, { createContext, useContext, useState, useEffect } from 'react';
import { t, getAll } from './useLanguagePack';

const LanguageContext = createContext();

/**
 * LanguageProvider - Wrap your app with this to enable centralized language management
 */
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Try to get saved language from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('faithlight_language') || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    // Save language preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('faithlight_language', language);
    }
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: (path) => t(path, language),
    tAll: getAll,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useLanguage hook - Use in any component to access language functions
 * @returns {object} { language, setLanguage, t, tAll }
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export default LanguageContext;