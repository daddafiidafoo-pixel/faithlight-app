/**
 * VerseExplainer Utility Functions
 * Handles error codes, post-processing, guardrails, and validation
 */

// Language to TTS language code mapping
export const TTS_LANGUAGE_CODES = {
  en: 'en-US',
  sw: 'sw',      // Swahili
  'fr-CA': 'fr-CA' // French (Canada)
};

// Language-specific prompts (tone, phrasing)
export const LANGUAGE_PROMPTS = {
  en: {
    tone: 'calm, encouraging',
    audience: 'general Christian audience',
    language: 'English'
  },
  sw: {
    tone: 'kali, karimu',
    audience: 'jamii ya Kikristo',
    language: 'Swahili'
  },
  'fr-CA': {
    tone: 'calme, encourageant',
    audience: 'public chrétien général',
    language: 'French'
  }
};

// Standardized error codes
export const ERROR_CODES = {
  MISSING_VERSE: 'missing_verse',
  MISSING_TEXT: 'missing_text',
  AI_TIMEOUT: 'ai_timeout',
  AI_FAILED: 'ai_failed',
  AI_EMPTY: 'ai_empty',
  TTS_FAILED: 'tts_failed',
  NETWORK_OFFLINE: 'network_offline',
  VALIDATION_FAILED: 'validation_failed'
};

// Friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.MISSING_VERSE]: 'Passage not available in this translation.',
  [ERROR_CODES.MISSING_TEXT]: 'Passage not available in this translation.',
  [ERROR_CODES.AI_TIMEOUT]: 'Explanation took too long. Try again.',
  [ERROR_CODES.AI_FAILED]: 'Explanation isn\'t available right now.',
  [ERROR_CODES.AI_EMPTY]: 'Explanation isn\'t available right now.',
  [ERROR_CODES.TTS_FAILED]: 'Couldn\'t play explanation audio.',
  [ERROR_CODES.NETWORK_OFFLINE]: 'Can\'t fetch explanation offline. Keep listening.',
  [ERROR_CODES.VALIDATION_FAILED]: 'Explanation isn\'t available right now.'
};

/**
 * Post-process explanation text for TTS
 * - Add line breaks for pacing
 * - Remove AI preambles
 * - Enforce length limits
 */
export function postProcessForTTS(text) {
  if (!text || typeof text !== 'string') return '';

  let processed = text.trim();

  // Remove "As an AI..." or similar preambles
  processed = processed.replace(/^(As an AI|As an assistant).*?[.!?]\s*/i, '');

  // Remove excessive ellipsis or repeated punctuation
  processed = processed.replace(/\.{2,}/g, '.');
  processed = processed.replace(/!{2,}/g, '!');
  processed = processed.replace(/\?{2,}/g, '?');

  // Add line breaks before major sentence breaks for pacing
  processed = processed.replace(/([.!?])\s+(?=[A-Z])/g, '$1\n');

  return processed.trim();
}

/**
 * Estimate word count (rough for 30-60s / 45-75s constraints)
 * At 150 WPM speaking: 75-150 words ≈ 30-60s
 * At 150 WPM speaking: 112-187 words ≈ 45-75s
 */
export function getWordCount(text) {
  return text.trim().split(/\s+/).length;
}

/**
 * Validate explanation output against guardrails
 * Returns { valid: boolean, issue?: string }
 */
export function validateExplanation(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, issue: 'empty' };
  }

  const wordCount = getWordCount(text);
  // Max ~200 words (safer upper bound for ~60s at 150 WPM)
  if (wordCount > 200) {
    return { valid: false, issue: 'too_long' };
  }

  // Check for preachy language
  if (/\byou\s+(must|should|need to|have to)/i.test(text)) {
    return { valid: false, issue: 'preachy' };
  }

  // Check for explicit comparisons to other translations
  if (/(compared to|unlike|instead of|other translations?|other versions?)/i.test(text)) {
    return { valid: false, issue: 'compares_translations' };
  }

  // Check for denomination-specific language
  if (/\b(calvinist|calvinian|arminian|pentecostal|reformed|catholic doctrine)\b/i.test(text)) {
    return { valid: false, issue: 'denominational' };
  }

  return { valid: true };
}

/**
 * Build strict retry prompt for guardrail failures
 */
export function buildRetryPrompt(originalPrompt, failureReason) {
  const addendum = `
[RETRY - IMPORTANT: Previous attempt had issues. Please fix:]
${failureReason === 'preachy' ? '- Rewrite without commanding language. Use "This suggests..." or "Notice..."' : ''}
${failureReason === 'too_long' ? '- Shorten to 75-120 words. Be concise.' : ''}
${failureReason === 'compares_translations' ? '- Do not mention other translations. Focus only on provided text.' : ''}
${failureReason === 'denominational' ? '- Use neutral language. Avoid theology arguments.' : ''}
- Be brief, kind, and based only on provided Bible text.`;

  return originalPrompt + addendum;
}

/**
 * Determine if explanation should retry
 */
export function shouldRetry(attemptsRemaining) {
  return attemptsRemaining > 0;
}

/**
 * Toast helper (returns object for caller to handle)
 */
export function makeToastMessage(errorCode, friendlyOverride) {
  return {
    errorCode,
    message: friendlyOverride || ERROR_MESSAGES[errorCode] || 'Something went wrong.',
    type: 'error'
  };
}