// ============================================================
// FaithLight Oromo Master Glossary — SINGLE SOURCE OF TRUTH
// Church-approved terms. DO NOT change without pastoral review.
// ============================================================

export const OROMO_GLOSSARY = {
  // Core Christian terms
  'God': 'Waaqayyoo',
  'Jesus Christ': 'Yesus Kiristoos',
  'Holy Spirit': 'Hafuura Qulqulluu',
  'Bible': 'Macaafa Qulqulluu',
  'Scripture': 'Dubbii Waaqayyoo',
  'Bible verse': 'Caqasa Macaafa Qulqulluu',
  'Grace': 'Ayyaana',
  'Faith': 'Amantii',
  'Salvation': 'Fayyina',
  'Sin': 'Cubbuu',
  'Prayer': 'Kadhannaa',
  'Love': 'Jaalala',
  'Peace': 'Nagaa',
  'Hope': 'Abdiin',
  'Mercy': 'Araara',
  'Forgiveness': 'Dhiifama',
  'Obedience': 'Ajajamu',
  'Wisdom': 'Ogummaa',
  'Promise': 'Abdii',
  'Blessing': 'Eebba',

  // FaithLight app terms
  'Explanation': 'Ibsa',
  'Reflection': 'Yaada keessaa',
  'Daily devotion': 'Devoshinii guyyaa',
  'Verse of the day': 'Caqasa guyyaa',
  'Prayer journal': 'Galmee kadhannaa',
  'Reading plan': 'Karoora dubbisaa',
  'Bible Q&A': 'Gaaffii fi deebii Macaafa Qulqulluu',
  'Prayer Coach': 'Gorsa kadhannaa',
  'Encouragement': 'Jajjabeessa',
  'Verse Finder': 'Barbaacha caqasaa',
  'Sermon Builder': 'Qopheessaa barsiisa',
  'Ask AI': 'AI gaafadhu',
  'Save reflection': 'Yaada kana kuusi',
  'Share': 'Qoodi',
  'Listen': 'Dhaggeeffadhu',
};

// Section heading labels used in AI responses and UI
// These are the EXACT headings the fixed Oromo response template uses
export const OM_SECTION_LABELS = {
  explanation: 'Ibsa',
  bible_verse: 'Caqasa Macaafa Qulqulluu',
  reflection: 'Yaada keessaa',
  prayer: 'Kadhannaa',
  introduction: 'Seensa',
  conclusion: 'Xumura',
  main_verse: 'Caqasa Ijoo',
  call_to_action: 'Waamicha',
  encouragement: 'Jajjabeessa',
};

/**
 * Returns the Oromo section label or the English fallback.
 */
export function getLabel(key, uiLanguage, fallback) {
  if (uiLanguage === 'om' && OM_SECTION_LABELS[key]) return OM_SECTION_LABELS[key];
  return fallback;
}

/**
 * Quality filter — rejects AI output that contains known contamination patterns.
 * Returns true if the text passes (is usable Oromo), false if it should fall back to English.
 *
 * Reject if output contains:
 *  - English theological terms (grace, prayer, reflection, salvation, etc.)
 *  - Mixed headings like REFLECTION, PRAYER
 *  - Bracketed English words like "grace (ayyaana)" or "(prayer)"
 *  - 5+ consecutive English words (signals untranslated content)
 *  - Long unnatural sentences (>120 chars with no punctuation)
 */
export function isValidOromoContent(text) {
  if (!text || typeof text !== 'string') return false;

  // Reject English theological/app terms that should have been translated
  const rejectedEnglishTerms = /\b(grace|reflection|prayer|salvation|worship|blessing|forgiveness|mercy|faith|scripture|holy spirit|REFLECTION|PRAYER|GRACE|SALVATION|WORSHIP|BLESSING)\b/i;
  if (rejectedEnglishTerms.test(text)) return false;

  // Reject bracketed English: "grace (ayyaana)" or "(prayer)"
  if (/[A-Za-z]{3,}\s*\(/.test(text)) return false;
  if (/\([A-Za-z]{3,}/.test(text)) return false;

  // Reject 5+ consecutive English words (bad translation)
  if (/([A-Za-z]+ ){5,}/.test(text)) return false;

  return true;
}

/**
 * The master Oromo prompt block — injected into AI calls when language === 'om'.
 * Follows the FaithLight safer translation workflow:
 *   1. Generate answer in simple English internally
 *   2. Translate into Oromo using the master glossary
 *   3. Output ONLY the Oromo version
 *
 * Fixed Oromo response template structure:
 *   Ibsa          → short explanation
 *   Caqasa Macaafa Qulqulluu → verse reference and text
 *   Yaada keessaa → short reflection
 *   Kadhannaa     → short prayer
 */
export const OROMO_MASTER_PROMPT = `
You are writing Christian devotional content in clear, natural Oromo for Ethiopian believers.

Follow these rules strictly:
- Use simple, respectful, natural Oromo.
- Do not translate word-for-word from English.
- Do not mix English words into Oromo sentences.
- Do not write things like "grace (ayyaana)" — use the Oromo term only.
- Do not invent poetic or unusual words. Use widely natural, church-friendly Oromo.
- Use ONLY these exact terms for these concepts:

  God = Waaqayyoo
  Jesus Christ = Yesus Kiristoos
  Holy Spirit = Hafuura Qulqulluu
  Bible = Macaafa Qulqulluu
  Bible verse = Caqasa Macaafa Qulqulluu
  Grace = Ayyaana
  Faith = Amantii
  Salvation = Fayyina
  Sin = Cubbuu
  Prayer = Kadhannaa
  Love = Jaalala
  Peace = Nagaa
  Hope = Abdiin
  Mercy = Araara
  Forgiveness = Dhiifama
  Obedience = Ajajamu
  Wisdom = Ogummaa
  Promise = Abdii
  Blessing = Eebba
  Explanation = Ibsa
  Reflection = Yaada keessaa
  Encouragement = Jajjabeessa

- Keep sentences short and clear.
- Sound like a Christian devotional, not a machine translation.
- Avoid unnatural, overly literal, or confusing phrases.

WORKFLOW:
1. Compose your answer in simple, clear English internally.
2. Rewrite it naturally in Oromo using only the terms above.
3. Output ONLY the Oromo version — no English in the final response fields.

Always return your answer using these exact section headings (in Oromo):

Ibsa
[short explanation]

Caqasa Macaafa Qulqulluu
[verse reference and verse text]

Yaada keessaa
[short reflection]

Kadhannaa
[short prayer]
`;