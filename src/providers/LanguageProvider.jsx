import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { coreTranslations, getTranslation } from "../components/i18n/coreTranslations";

import {
  detectLanguage,
  getLanguageLabel,
  getSupportedLanguages,
  isSupportedLanguage,
  saveLanguage
} from "../lib/languageDetection";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  changeLanguage: async () => {},
  t: (key, fallback) => fallback || key,
  ready: false,
  supportedLanguages: []
});

function getNestedValue(object, path) {
  if (!object || !path) return undefined;

  return path.split(".").reduce((current, part) => {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      return current[part];
    }
    return undefined;
  }, object);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initializeLanguage() {
      try {
        const detectedLanguage = await detectLanguage();

        if (isMounted && isSupportedLanguage(detectedLanguage)) {
          setLanguageState(detectedLanguage);
        }
      } catch (error) {
        console.warn("Failed to initialize language.", error);
      } finally {
        if (isMounted) {
          setReady(true);
        }
      }
    }

    initializeLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  const changeLanguage = useCallback(async (newLanguage) => {
    if (!isSupportedLanguage(newLanguage)) {
      console.warn(`Unsupported language: ${newLanguage}`);
      return;
    }

    setLanguageState(newLanguage);
    saveLanguage(newLanguage);
  }, []);

  const setLanguage = useCallback((newLanguage) => {
    if (!isSupportedLanguage(newLanguage)) {
      console.warn(`Unsupported language: ${newLanguage}`);
      return;
    }

    setLanguageState(newLanguage);
    saveLanguage(newLanguage);
  }, []);

  const t = useCallback(
    (key, fallback = "") => {
      const value = getTranslation(coreTranslations, language, key);
      return value || fallback || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      languageLabel: getLanguageLabel(language),
      setLanguage,
      changeLanguage,
      t,
      ready,
      supportedLanguages: getSupportedLanguages()
    }),
    [language, setLanguage, changeLanguage, t, ready]
  );

  if (!ready) {
    return null;
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}