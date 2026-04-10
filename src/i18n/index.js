import { commonTranslations } from "./common";
import { navigationTranslations } from "./navigation";
import { authTranslations } from "./auth";
import { privacyTranslations } from "./privacy";
import { errorTranslations } from "./errors";
import { notificationTranslations } from "./notifications";
import { profileTranslations } from "./profile";
import { discipleshipTranslations } from "./discipleship";
import { onboardingTranslations } from "./onboarding";
import { safetyTranslations } from "./safety";
import { termsTranslations } from "./terms";
import { adminTranslations } from "./admin";
import { visionValuesTranslations } from "./visionValues";

export const translations = {
  common: commonTranslations,
  navigation: navigationTranslations,
  auth: authTranslations,
  privacy: privacyTranslations,
  errors: errorTranslations,
  notifications: notificationTranslations,
  profile: profileTranslations,
  discipleship: discipleshipTranslations,
  onboarding: onboardingTranslations,
  safety: safetyTranslations,
  terms: termsTranslations,
  admin: adminTranslations,
  visionValues: visionValuesTranslations,
};

export const supportedLanguages = ["en", "om", "fr", "es", "am", "sw", "ar"];

export const isRTL = (lang) => lang === "ar";

export const translate = (lang, namespace, key) => {
  const ns = translations[namespace];
  if (!ns) return key;
  const locale = ns[lang] || ns["en"];
  return locale?.[key] ?? key;
};

export const t = (lang, namespace, key) => {
  const ns = translations[namespace];
  if (!ns) return key;
  const locale = ns[lang] || ns["en"];
  return locale?.[key] ?? key;
};

export const formatDate = (date, lang) => {
  const localeMap = { en: "en-US", om: "om", fr: "fr-FR", es: "es-ES", am: "am-ET", sw: "sw-KE", ar: "ar-SA" };
  return new Intl.DateTimeFormat(localeMap[lang] || "en-US").format(new Date(date));
};

export const formatNumber = (num, lang) => {
  const localeMap = { en: "en-US", om: "om", fr: "fr-FR", es: "es-ES", am: "am-ET", sw: "sw-KE", ar: "ar-SA" };
  return new Intl.NumberFormat(localeMap[lang] || "en-US").format(num);
};