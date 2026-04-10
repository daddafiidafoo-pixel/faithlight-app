/**
 * Enhanced Translation Helper with Debug Logging
 * Catches missing translations & English fallbacks immediately
 * 
 * Usage:
 * import { t } from '@/components/testing/i18nDebugHelper';
 * import labels from '@/i18n/journalpack.json';
 * 
 * <button>{t(labels.journal.save, "journal.save")}</button>
 */

import { getGlobalLanguage } from '@/components/lib/translationHelper';

export function t(labelObj, keyName = '') {
  const lang = getGlobalLanguage();
  
  if (!labelObj) {
    console.warn(`[i18n] ❌ NULL label${keyName ? ` (${keyName})` : ''}`);
    return 'MISSING';
  }

  const value = labelObj[lang];

  // 🚨 Missing translation - use English as fallback
  if (!value) {
    const englishValue = labelObj.en;
    console.warn(
      `[i18n] ⚠️ Missing "${lang}" translation${keyName ? ` for key="${keyName}"` : ''}`,
      { label: labelObj, currentLang: lang, englishFallback: englishValue }
    );
    
    // Return English with visual indicator in dev
    if (!import.meta.env.PROD) {
      return `[EN] ${englishValue || 'NO_TRANSLATION'}`;
    }
    return englishValue || '';
  }

  return value;
}

/**
 * Debug: List all missing translations for a language pack
 * 
 * Usage in console:
 * auditLanguagePack(journalpack, 'om', 'Journal')
 */
export function auditLanguagePack(pack, language, packName = 'Pack') {
  console.log(`\n📊 Auditing ${packName} for ${language}...\n`);
  
  const missing = [];
  let total = 0;

  function traverse(obj, path = '') {
    Object.entries(obj).forEach(([key, val]) => {
      if (typeof val === 'string') {
        total++;
        if (!val) {
          missing.push(`${path}${key} = "${val}"`);
        }
      } else if (typeof val === 'object') {
        traverse(val, `${path}${key}.`);
      }
    });
  }

  traverse(pack[language] || {});

  if (missing.length === 0) {
    console.log(`✅ ${packName}: All ${total} labels present for ${language}\n`);
  } else {
    console.log(`❌ ${packName}: Missing ${missing.length}/${total} labels:\n`);
    missing.forEach(m => console.log(`  - ${m}`));
    console.log();
  }

  return { language, packName, total, missing: missing.length, coverage: ((total - missing.length) / total * 100).toFixed(0) + '%' };
}

/**
 * Console helper: Check which components are using English fallback right now
 * 
 * Usage in console:
 * showEnglishFallbacks()
 */
export function showEnglishFallbacks() {
  const logs = [];
  const originalWarn = console.warn;

  console.warn = function(...args) {
    if (args[0]?.includes('[i18n]') && args[0]?.includes('Missing')) {
      logs.push(args);
    }
    originalWarn.apply(console, args);
  };

  // Trigger all components to re-render
  setTimeout(() => {
    console.warn = originalWarn;
    
    if (logs.length === 0) {
      console.log('✅ No English fallbacks detected');
    } else {
      console.log(`❌ Found ${logs.length} missing translations:`);
      logs.forEach(log => console.log(log));
    }
  }, 1000);
}