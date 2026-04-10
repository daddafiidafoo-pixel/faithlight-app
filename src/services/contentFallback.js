/**
 * Strict content fallback policy.
 *
 * Rules:
 *  1. Try loading content in the requested language.
 *  2. If unavailable → return { ok: false, error: 'not_available' }
 *  3. If network error → return { ok: false, error: 'network' }
 *  4. NEVER silently swap to English.
 *  5. Caller must render a localized error message from LANGUAGES[lang].unavailableMessage
 */

import { getLangConfig } from '@/config/languages';

/**
 * Wrap any async content loader with the strict fallback policy.
 * @param {string} lang  — app language code
 * @param {() => Promise<any|null>} loader — returns content or null
 * @returns {Promise<{ ok: boolean, language: string, value?: any, error?: string, message?: string }>}
 */
export async function withLanguageFallback(lang, loader) {
  const config = getLangConfig(lang);
  try {
    const result = await loader();
    if (result != null) {
      return { ok: true, language: lang, value: result };
    }
    return {
      ok: false,
      language: lang,
      error: 'not_available',
      message: config.unavailableMessage,
    };
  } catch {
    return {
      ok: false,
      language: lang,
      error: 'network',
      message: config.networkErrorMessage,
    };
  }
}

/**
 * React-friendly hook helper: returns a localized "not available" message.
 */
export function getUnavailableMessage(lang) {
  return getLangConfig(lang).unavailableMessage;
}

export function getNetworkErrorMessage(lang) {
  return getLangConfig(lang).networkErrorMessage;
}