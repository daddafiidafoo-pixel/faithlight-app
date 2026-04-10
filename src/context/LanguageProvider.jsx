import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "@/i18n";

const LanguageContext = createContext(null);

const STORAGE_KEY = "faithlight-language";
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["en", "om", "fr", "es", "am", "sw", "ar"];
const RTL_LANGUAGES = ["ar"];

const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

const isRTL = (language) => RTL_LANGUAGES.includes(language);

const normalizeLanguage = (language) => {
  if (!language) return DEFAULT_LANGUAGE;
  const normalized = language.toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : DEFAULT_LANGUAGE;
};

const detectBrowserLanguage = () => {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;
  return normalizeLanguage(navigator.language);
};

const getStoredLanguage = () => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    return savedLanguage ? normalizeLanguage(savedLanguage) : detectBrowserLanguage();
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const applyDocumentLanguageSettings = (language) => {
  if (typeof document === "undefined") return;
  const rtl = isRTL(language);
  document.documentElement.lang = language;
  document.documentElement.dir = rtl ? "rtl" : "ltr";
  document.body.dir = rtl ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", rtl);
  document.body.classList.toggle("ltr", !rtl);
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialLanguage = getStoredLanguage();
    setLanguageState(initialLanguage);
    applyDocumentLanguageSettings(initialLanguage);
    setIsInitialized(true);
  }, []);

  const setLanguage = (newLanguage) => {
    const normalizedLanguage = normalizeLanguage(newLanguage);
    setLanguageState(normalizedLanguage);
    applyDocumentLanguageSettings(normalizedLanguage);
    try {
      localStorage.setItem(STORAGE_KEY, normalizedLanguage);
    } catch {
      // Ignore localStorage errors
    }
  };

  const t = (section, key, fallback) => {
    const sectionTranslations = translations?.[section];
    if (!sectionTranslations) return fallback ?? key;

    const currentLanguageData = sectionTranslations[language] || sectionTranslations[DEFAULT_LANGUAGE] || {};
    const fallbackLanguageData = sectionTranslations[DEFAULT_LANGUAGE] || {};

    return (
      getNestedValue(currentLanguageData, key) ??
      getNestedValue(fallbackLanguageData, key) ??
      fallback ??
      key
    );
  };

  const hasTranslation = (section, key, lang = language) => {
    const sectionTranslations = translations?.[section];
    if (!sectionTranslations) return false;
    return getNestedValue(sectionTranslations[lang], key) !== undefined;
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    hasTranslation,
    isRTL: isRTL(language),
    supportedLanguages: SUPPORTED_LANGUAGES,
    isInitialized,
  }), [language, isInitialized]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}