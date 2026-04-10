import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supportedLanguages, isRTL, translate } from "@/i18n";

const LanguageContext = createContext(null);

const STORAGE_KEY = "faithlight-language";

const detectBrowserLanguage = () => {
  const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
  return supportedLanguages.includes(browserLang) ? browserLang : "en";
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const lang =
      (saved && supportedLanguages.includes(saved)) ? saved : detectBrowserLanguage();
    setLanguage(lang);
    setIsInitialized(true);
  }, []);

  // Update DOM and storage when language changes
  useEffect(() => {
    if (!isInitialized) return;
    
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL(language) ? "rtl" : "ltr";
    
    // Update body text direction for better RTL support
    if (isRTL(language)) {
      document.body.style.direction = "rtl";
      document.body.style.textAlign = "right";
    } else {
      document.body.style.direction = "ltr";
      document.body.style.textAlign = "left";
    }
  }, [language, isInitialized]);

  const value = useMemo(() => {
    return {
      language,
      setLanguage,
      supportedLanguages,
      t: (section, key) => translate(language, section, key),
      isRTL: isRTL(language),
      isInitialized,
    };
  }, [language, isInitialized]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use language context
 * Must be called inside LanguageProvider
 */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}