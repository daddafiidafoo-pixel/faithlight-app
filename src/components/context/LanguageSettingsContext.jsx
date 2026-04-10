import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageSettingsContext = createContext(null);

export function LanguageSettingsProvider({ children }) {
  const [uiLanguage, setUiLanguage] = useState(() => {
    try {
      return localStorage.getItem('faithlight_ui_language') || 'en';
    } catch {
      return 'en';
    }
  });

  const [bibleLanguage, setBibleLanguage] = useState(() => {
    try {
      return localStorage.getItem('faithlight_bible_language') || 'en';
    } catch {
      return 'en';
    }
  });

  const [audioLanguage, setAudioLanguage] = useState(() => {
    try {
      return localStorage.getItem('faithlight_audio_language') || 'en';
    } catch {
      return 'en';
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('faithlight_ui_language', uiLanguage);
    } catch {
      // Ignore errors
    }
  }, [uiLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem('faithlight_bible_language', bibleLanguage);
    } catch {
      // Ignore errors
    }
  }, [bibleLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem('faithlight_audio_language', audioLanguage);
    } catch {
      // Ignore errors
    }
  }, [audioLanguage]);

  const value = useMemo(
    () => ({
      uiLanguage,
      setUiLanguage,
      bibleLanguage,
      setBibleLanguage,
      audioLanguage,
      setAudioLanguage,
    }),
    [uiLanguage, bibleLanguage, audioLanguage]
  );

  return (
    <LanguageSettingsContext.Provider value={value}>
      {children}
    </LanguageSettingsContext.Provider>
  );
}

export function useLanguageSettings() {
  const context = useContext(LanguageSettingsContext);
  if (!context) {
    // Return safe defaults from localStorage if used outside provider
    const uiLanguage = (() => { try { return localStorage.getItem('faithlight_ui_language') || 'en'; } catch { return 'en'; } })();
    const bibleLanguage = (() => { try { return localStorage.getItem('faithlight_bible_language') || 'en'; } catch { return 'en'; } })();
    const audioLanguage = (() => { try { return localStorage.getItem('faithlight_audio_language') || 'en'; } catch { return 'en'; } })();
    return { uiLanguage, setUiLanguage: () => {}, bibleLanguage, setBibleLanguage: () => {}, audioLanguage, setAudioLanguage: () => {} };
  }
  return context;
}