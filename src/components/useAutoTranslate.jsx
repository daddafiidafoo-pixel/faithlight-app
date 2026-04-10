/**
 * useAutoTranslate — lightweight hook for translating dynamic content on demand.
 *
 * Use ONLY for non-Bible dynamic content: devotionals, articles, help text, user notes.
 * Bible verses must NEVER be auto-translated — always use approved Bible translation sources.
 *
 * Translations are cached in sessionStorage to avoid repeated LLM calls.
 */
import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from './I18nProvider';

const CACHE_KEY_PREFIX = 'faithlight_autotrans_';

function cacheKey(lang, text) {
  // Use a short hash of the text to keep keys manageable
  const short = text.slice(0, 80).replace(/\s+/g, ' ');
  return `${CACHE_KEY_PREFIX}${lang}_${btoa(encodeURIComponent(short)).slice(0, 40)}`;
}

function getCached(lang, text) {
  try {
    return sessionStorage.getItem(cacheKey(lang, text));
  } catch {
    return null;
  }
}

function setCache(lang, text, translated) {
  try {
    sessionStorage.setItem(cacheKey(lang, text), translated);
  } catch {
    // sessionStorage full or unavailable — silently skip
  }
}

/**
 * @param {string} text — the source English text to translate
 * @param {object} options
 * @param {boolean} options.skip — skip translation (e.g. already in correct language)
 * @returns {{ translated: string, isTranslating: boolean }}
 */
export function useAutoTranslate(text, { skip = false } = {}) {
  const { lang } = useI18n();
  const [translated, setTranslated] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const lastTextRef = useRef(null);

  useEffect(() => {
    // No translation needed for English or empty text
    if (!text || lang === 'en' || skip) {
      setTranslated(text);
      return;
    }

    // Avoid re-running for same text+lang pair
    const key = `${lang}::${text}`;
    if (lastTextRef.current === key) return;
    lastTextRef.current = key;

    // Check cache first
    const cached = getCached(lang, text);
    if (cached) {
      setTranslated(cached);
      return;
    }

    let cancelled = false;
    setIsTranslating(true);

    base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following text into ${lang}. Return only the translated text with no explanation or quotes:\n\n${text}`,
    }).then(result => {
      if (cancelled) return;
      const output = typeof result === 'string' ? result : result?.text || text;
      setTranslated(output);
      setCache(lang, text, output);
    }).catch(() => {
      if (!cancelled) setTranslated(text); // fallback to original
    }).finally(() => {
      if (!cancelled) setIsTranslating(false);
    });

    return () => { cancelled = true; };
  }, [text, lang, skip]);

  return { translated, isTranslating };
}