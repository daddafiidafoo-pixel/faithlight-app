import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  detectInitialLanguage,
  getLanguageDirection,
  normalizeLanguage,
} from "../lib/i18n";

export const supportedLanguages = [
  { code: 'en', label: 'English', badge: 'GB' },
  { code: 'om', label: 'Afaan Oromoo', badge: 'ET' },
  { code: 'sw', label: 'Kiswahili', badge: 'TZ' },
  { code: 'ar', label: 'العربية', badge: 'SA' },
  { code: 'fr', label: 'Français', badge: 'FR' },
  { code: 'am', label: 'አማርኛ', badge: 'ET' },
  { code: 'ti', label: 'ትግርኛ', badge: 'ER' },
];

const initialLang = detectInitialLanguage();

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      uiLanguage: initialLang,
      bibleLanguage: initialLang,
      audioLanguage: initialLang,
      aiLanguage: initialLang,

      setUiLanguage: (lang) => {
        const normalized = normalizeLanguage(lang);
        localStorage.setItem("faithlight_language", normalized);
        localStorage.setItem("app_language", normalized); // keep both keys in sync
        document.documentElement.lang = normalized;
        document.documentElement.dir = getLanguageDirection(normalized);
        set({ uiLanguage: normalized });
      },

      setBibleLanguage: (lang) => set({ bibleLanguage: lang }),
      setAudioLanguage: (lang) => set({ audioLanguage: lang }),
      setAiLanguage: (lang) => set({ aiLanguage: lang }),

      // Sync all language keys at once
      setLanguage: (lang) => {
        const normalized = normalizeLanguage(lang);
        localStorage.setItem("faithlight_language", normalized);
        localStorage.setItem("app_language", normalized); // keep both keys in sync
        document.documentElement.lang = normalized;
        document.documentElement.dir = getLanguageDirection(normalized);
        set({
          uiLanguage: normalized,
          bibleLanguage: normalized,
          audioLanguage: normalized,
          aiLanguage: normalized,
        });
      },

      initializeLanguage: () => {
        const lang = get().uiLanguage;
        document.documentElement.lang = lang;
        document.documentElement.dir = getLanguageDirection(lang);
      },
    }),
    {
      name: 'faithlight-language-store',
    }
  )
);