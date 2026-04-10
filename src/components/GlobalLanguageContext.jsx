/**
 * FaithLight — Global Language Auto-Sync System
 *
 * Single source of truth for app language.
 * One `lang` code drives: UI text, Bible content, AI responses,
 * date/time locale, share images, and TTS.
 *
 * Usage:
 *   const { lang, setLanguage, refreshKey, localeCode } = useGlobalLanguage();
 *
 * `refreshKey` increments on every language change — use it as a
 * useEffect / useQuery dependency to auto-refetch language-sensitive data.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const GlobalLanguageContext = createContext();

// Canonical localStorage key — shared with I18nProvider
const LANG_KEY = 'faithlight_language';

// Maps language code → locale string (for date/time formatting)
export const LOCALE_MAP = {
  en: 'en-US',
  om: 'om',     // Afaan Oromoo (LTR)
  am: 'am-ET',  // Amharic
  ti: 'ti-ET',  // Tigrinya
  ar: 'ar-SA',  // Arabic (RTL)
  fr: 'fr-FR',
  sw: 'sw-KE',
  es: 'es-ES',
  pt: 'pt-PT',
  de: 'de-DE',
  zh: 'zh-CN',
  ru: 'ru-RU',
  hi: 'hi-IN',
};

// Fires the centralized language-changed event consumed by I18nProvider
// and any other listener in the app.
function dispatchLangChanged(code) {
  try {
    window.dispatchEvent(new CustomEvent('faithlight-lang-changed', { detail: code }));
    window.dispatchEvent(new CustomEvent('faithlight-content-lang-changed', { detail: code }));
  } catch {}
}

export function GlobalLanguageProvider({ children }) {
  // THE single language state for the whole app
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(LANG_KEY)
      || localStorage.getItem('faithlight_ui_lang')
      || 'en';
  });

  // Increments on every language change — use as useEffect/query dependency
  const [refreshKey, setRefreshKey] = useState(0);

  const [bibleTranslation, setBibleTranslationState] = useState(() => {
    return localStorage.getItem('faithlight_bible_translation') || 'WEB';
  });

  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ─── Single action: THE only way to change language app-wide ─────────────
  const setLanguage = useCallback((code) => {
    if (!code || code === lang) return;
    // 1. Update local state
    setLangState(code);
    // 2. Bump refresh key so all data consumers re-fetch
    setRefreshKey(k => k + 1);
    // 3. Persist immediately
    localStorage.setItem(LANG_KEY, code);
    localStorage.setItem('faithlight_ui_lang', code);
    localStorage.setItem('faithlight_content_lang', code);
    // 4. Broadcast to I18nProvider + any other listener
    dispatchLangChanged(code);
  }, [lang]);

  // ─── Listen for changes from I18nProvider's language switcher ────────────
  useEffect(() => {
    const handler = (e) => {
      const code = e.detail;
      if (!code || code === lang) return;
      setLangState(code);
      setRefreshKey(k => k + 1);
      localStorage.setItem(LANG_KEY, code);
      localStorage.setItem('faithlight_ui_lang', code);
      localStorage.setItem('faithlight_content_lang', code);
    };
    window.addEventListener('faithlight-lang-changed', handler);
    return () => window.removeEventListener('faithlight-lang-changed', handler);
  }, [lang]);

  // ─── Bible translation setter ─────────────────────────────────────────────
  const setBibleTranslation = useCallback((translation) => {
    setBibleTranslationState(translation);
    localStorage.setItem('faithlight_bible_translation', translation);
    if (user) updateUserSettings({ bible_translation: translation });
  }, [user]);

  // ─── Load user settings on mount ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated().catch(() => false);
        if (!isAuth) return;
        const currentUser = await base44.auth.me().catch(() => null);
        if (!currentUser) return;
        setUser(currentUser);

        // Prefer user profile language
        if (currentUser.preferred_language_code) {
          const code = currentUser.preferred_language_code;
          setLangState(code);
          localStorage.setItem(LANG_KEY, code);
          dispatchLangChanged(code);
        }

        // Then check UserSettings for bible translation
        const settings = await base44.entities.UserSettings.filter(
          { user_id: currentUser.id }, '-updated_date', 1
        ).catch(() => []);
        if (settings.length > 0) {
          const s = settings[0];
          if (s.bible_translation) setBibleTranslationState(s.bible_translation);
        }
      } catch (err) {
        console.debug('[GlobalLanguage] Init fallback:', err?.message);
      } finally {
        setIsInitialized(true);
      }
    })();
  }, []);

  // ─── Persist lang to DB (debounced) ──────────────────────────────────────
  const pendingRef = useRef({});
  const timerRef = useRef(null);

  const updateUserSettings = useCallback((updates) => {
    if (!user) return;
    pendingRef.current = { ...pendingRef.current, ...updates };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const batch = pendingRef.current;
      pendingRef.current = {};
      try {
        const settings = await base44.entities.UserSettings.filter(
          { user_id: user.id }, '-updated_date', 1
        );
        if (settings.length > 0) {
          await base44.entities.UserSettings.update(settings[0].id, batch);
        } else {
          await base44.entities.UserSettings.create({ user_id: user.id, ...batch });
        }
      } catch (err) {
        console.debug('[GlobalLanguage] Settings save failed (non-critical):', err?.message);
      }
    }, 600);
  }, [user]);

  useEffect(() => {
    if (user) updateUserSettings({ ui_lang: lang, content_lang: lang });
  }, [lang, user]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const localeCode = LOCALE_MAP[lang] || 'en-US';
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(lang);

  // AI language instruction — injected into every AI call
  const aiLanguageInstruction = `You MUST respond ONLY in the following language: ${lang}. Do not mix any other language. Do not use English unless the user explicitly requests it. Language code: ${lang}.`;

  const value = {
    // ── Primary API ──
    lang,                    // current language code, e.g. 'om'
    setLanguage,             // THE setter — use this everywhere
    refreshKey,              // increment dep for data re-fetching
    localeCode,              // e.g. 'om' for date/time formatting
    isRTL,                   // RTL layout flag
    aiLanguageInstruction,   // prepend to all AI prompts
    localeMap: LOCALE_MAP,

    // ── Bible translation ──
    bibleTranslation,
    setBibleTranslation,

    // ── State flags ──
    user,
    isInitialized,

    // ── Backward-compat aliases (deprecated — use lang / setLanguage) ──
    uiLang: lang,
    contentLang: lang,
    uiLanguage: lang,
    aiLanguage: lang,
    setUiLang: setLanguage,
    setContentLang: setLanguage,
    setUILanguage: setLanguage,
    setAILanguage: setLanguage,
  };

  return (
    <GlobalLanguageContext.Provider value={value}>
      {children}
    </GlobalLanguageContext.Provider>
  );
}

export function useGlobalLanguage() {
  const context = useContext(GlobalLanguageContext);
  if (!context) {
    throw new Error('useGlobalLanguage must be used within GlobalLanguageProvider');
  }
  return context;
}