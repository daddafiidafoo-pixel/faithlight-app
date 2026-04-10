/**
 * i18n Debug Badge - Shows current language in bottom-right
 * 
 * Only shows in development mode
 * Add to Layout.js: <I18nDebugBadge />
 */

import React, { useState, useEffect } from 'react';
import { getGlobalLanguage } from '@/components/lib/translationHelper';

const LANGUAGE_NAMES = {
  en: 'English',
  om: 'Afaan Oromoo',
  am: 'Amharic',
  ar: 'العربية',
  fr: 'Français',
  sw: 'Kiswahili',
};

export default function I18nDebugBadge() {
  const [lang, setLang] = useState('en');
  const [fallbackCount, setFallbackCount] = useState(0);

  useEffect(() => {
    setLang(getGlobalLanguage());

    // Listen for language changes
    const handler = () => setLang(getGlobalLanguage());
    window.addEventListener('faithlight-language-changed', handler);
    return () => window.removeEventListener('faithlight-language-changed', handler);
  }, []);

  // Count console warnings for missing translations
  useEffect(() => {
    const originalWarn = console.warn;
    let count = 0;

    console.warn = function(...args) {
      if (args[0]?.includes('[i18n]') && args[0]?.includes('Missing')) {
        count++;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      setFallbackCount(count);
      console.warn = originalWarn;
    };
  }, [lang]);

  // Hide in production
  if (import.meta.env.PROD) {
    return null;
  }

  const langDisplay = LANGUAGE_NAMES[lang] || lang;
  const hasIssues = fallbackCount > 0;

  return (
    <div
      className={`fixed bottom-24 right-4 z-50 rounded-lg px-3 py-2 text-xs font-bold shadow-lg pointer-events-none ${
        hasIssues
          ? 'bg-red-600 text-white'
          : 'bg-green-600 text-white'
      }`}
      title={hasIssues ? `${fallbackCount} missing translations` : 'No issues detected'}
    >
      <div>🌍 {langDisplay}</div>
      {hasIssues && <div className="text-red-200">⚠️ {fallbackCount} fallbacks</div>}
    </div>
  );
}