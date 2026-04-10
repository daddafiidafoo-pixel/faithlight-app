import { Capacitor } from "@capacitor/core";

export const LANGUAGE_STORAGE_KEY = "app_language";
export const SUPPORTED_LANGUAGES = ["en", "hae", "gaz", "om", "am", "ti"];

export const LANGUAGE_LABELS = {
  en: "English",
  hae: "Afaan Oromoo (Bahaa)",
  gaz: "Afaan Oromoo (Lixaa Giddugaleessa)",
  om: "Afaan Oromoo",
  am: "አማርኛ",
  ti: "ትግርኛ"
};

function normalizeLocale(locale) {
  return (locale || "").toLowerCase().trim();
}

export function isSupportedLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language);
}

export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES.map((code) => ({
    code,
    label: LANGUAGE_LABELS[code] || code
  }));
}

export function getLanguageLabel(language) {
  return LANGUAGE_LABELS[language] || LANGUAGE_LABELS.en;
}

export function getSavedLanguage() {
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(savedLanguage) ? savedLanguage : null;
  } catch (error) {
    console.warn("Failed to read saved language from localStorage.", error);
    return null;
  }
}

export function saveLanguage(language) {
  try {
    if (isSupportedLanguage(language)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  } catch (error) {
    console.warn("Failed to save language to localStorage.", error);
  }
}

export function clearSavedLanguage() {
  try {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear saved language from localStorage.", error);
  }
}

export function mapLocaleToLanguage(locale) {
  const normalized = normalizeLocale(locale);

  if (!normalized) return "en";

  if (normalized.startsWith("om")) return "gaz"; // legacy om → West Central Oromo
  if (normalized.startsWith("am")) return "am";
  if (normalized.startsWith("ti")) return "ti";
  if (normalized.startsWith("en")) return "en";

  if (normalized.includes("-et") || normalized.includes("_et")) return "am";
  if (normalized.includes("-er") || normalized.includes("_er")) return "ti";

  return "en";
}

async function getNativeLocale() {
  try {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    const { Device } = await import("@capacitor/device");
    const result = await Device.getLanguageCode();

    return result?.value || null;
  } catch (error) {
    console.warn("Failed to detect native device language.", error);
    return null;
  }
}

function getBrowserLocale() {
  try {
    if (typeof navigator === "undefined") {
      return "en";
    }

    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      return navigator.languages[0];
    }

    return navigator.language || "en";
  } catch (error) {
    console.warn("Failed to detect browser language.", error);
    return "en";
  }
}

export async function detectLanguage() {
  const savedLanguage = getSavedLanguage();
  if (savedLanguage) {
    return savedLanguage;
  }

  const nativeLocale = await getNativeLocale();
  if (nativeLocale) {
    return mapLocaleToLanguage(nativeLocale);
  }

  const browserLocale = getBrowserLocale();
  return mapLocaleToLanguage(browserLocale);
}