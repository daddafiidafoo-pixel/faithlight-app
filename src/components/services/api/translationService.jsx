/**
 * Translation Service — centralized layer for all UI translation operations.
 * Keeps translation data separate from Bible text, audio, and AI content.
 */
import { base44 } from '@/api/base44Client';
import { serviceCache } from '@/components/services/cache/serviceCache';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — translations change rarely

// ── UI Translations ──────────────────────────────────────────

/**
 * Fetch all translations for a given language.
 * Cached per language to avoid repeated DB round-trips.
 */
export async function fetchUITranslations(language = 'en') {
  const cacheKey = `ui_translations:${language}`;
  const cached = serviceCache.get(cacheKey);
  if (cached) return cached;

  const rows = await base44.entities.Translation.filter(
    { language }, null, 1000
  ).catch(() => []);

  // Convert array to key→value map for fast lookups
  const map = {};
  (rows || []).forEach(row => { map[row.translation_key] = row.value; });

  serviceCache.set(cacheKey, map, CACHE_TTL_MS);
  return map;
}

/**
 * Get a single translation value.
 * Falls back to the key itself if not found.
 */
export async function getTranslation(key, language = 'en', fallback = null) {
  const map = await fetchUITranslations(language);
  return map[key] ?? fallback ?? key;
}

// ── Locale Strings (local JSON bundles) ──────────────────────

/**
 * Supported UI languages.
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English',       nativeLabel: 'English',        rtl: false },
  { code: 'om', label: 'Afaan Oromoo',  nativeLabel: 'Afaan Oromoo',   rtl: false },
  { code: 'am', label: 'Amharic',       nativeLabel: 'አማርኛ',           rtl: false },
  { code: 'ar', label: 'Arabic',        nativeLabel: 'العربية',         rtl: true  },
  { code: 'fr', label: 'French',        nativeLabel: 'Français',        rtl: false },
  { code: 'sw', label: 'Swahili',       nativeLabel: 'Kiswahili',       rtl: false },
];

export function isRTL(languageCode) {
  return SUPPORTED_LANGUAGES.find(l => l.code === languageCode)?.rtl ?? false;
}

export function getLanguageLabel(languageCode) {
  return SUPPORTED_LANGUAGES.find(l => l.code === languageCode)?.nativeLabel ?? languageCode;
}

// ── Translation Review ───────────────────────────────────────

export async function submitTranslationFeedback(userId, key, language, suggestedValue) {
  return base44.entities.TranslationReview.create({
    user_id: userId,
    translation_key: key,
    language,
    suggested_value: suggestedValue,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  });
}