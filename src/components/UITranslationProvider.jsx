import React, { createContext, useContext, useMemo } from 'react';
import { useUITranslation } from './useUITranslation';

const UITranslationContext = createContext(null);

export function UITranslationProvider({ children, languageCode = 'en' }) {
  const { t, translations, isLoading } = useUITranslation(languageCode);

  const value = useMemo(
    () => ({ t, translations, isLoading, languageCode }),
    [t, translations, isLoading, languageCode]
  );

  return (
    <UITranslationContext.Provider value={value}>
      {children}
    </UITranslationContext.Provider>
  );
}

export function useUITranslationContext() {
  const context = useContext(UITranslationContext);
  if (!context) {
    throw new Error('useUITranslationContext must be used within UITranslationProvider');
  }
  return context;
}