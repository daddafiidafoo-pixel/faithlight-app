/**
 * Shared language validation utilities.
 * Used by: faithAIEngine (backend), LanguageValidationDashboard (frontend QA).
 */

export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'unknown';
  if (/[ء-ي\u0600-\u06FF]/.test(text)) return 'ar';
  if (/[ኀ-፿\u1200-\u137F]/.test(text)) return 'am';

  const lower = text.toLowerCase();
  if (/\b(waaqayyoo|yesus|kadhannaa|ayyaana|amantii|fayyina|cubbuu|kiristoos|macaafa|hafuura)\b/.test(lower)) return 'om';
  if (/\b(mungu|yesu|maombi|imani|neema|wokovu|bwana|roho)\b/.test(lower)) return 'sw';
  if (/\b(dieu|jésus|prière|grâce|foi|salut|seigneur|esprit)\b/.test(lower)) return 'fr';
  if (/[a-z]/i.test(text)) return 'en';

  return 'unknown';
}

export function hasEnglishLeak(expectedLang, text) {
  if (expectedLang === 'en' || !text) return false;
  const lower = text.toLowerCase();
  return /\b(the|and|this|that|grace|faith|prayer|reflection|salvation|verse|god|jesus|holy|spirit|love|peace|hope|blessing|scripture)\b/.test(lower);
}

export function validateGeneratedLanguage(expectedLang, fields) {
  const issues = new Set();
  const detected = new Set();

  for (const value of (fields || []).filter(Boolean)) {
    const lang = detectLanguage(value);
    detected.add(lang);

    if (lang === 'en' && expectedLang !== 'en') issues.add('english_leak');
    if (lang !== 'unknown' && lang !== expectedLang && expectedLang !== 'en') issues.add('wrong_language');
    if (hasEnglishLeak(expectedLang, value)) issues.add('mixed_language');
  }

  return {
    valid: issues.size === 0,
    detected: Array.from(detected),
    issues: Array.from(issues),
  };
}

export function isLaunchReady({ ui, ai, bible, rtl = true }) {
  return !!(ui && ai && bible && rtl);
}