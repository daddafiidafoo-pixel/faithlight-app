/**
 * Chapter Summary Utility Functions
 * Handles prompt building, TTS pacing, and line-break formatting
 */

// Language to TTS language code mapping
export const TTS_LANGUAGE_CODES = {
  en: 'en-US',
  sw: 'sw',      // Swahili
  'fr-CA': 'fr-CA' // French (Canada)
};

// Language-specific prompt instructions
export const LANGUAGE_INSTRUCTIONS = {
  en: {
    instruction: 'Provide a spoken summary of the following Bible chapter.'
  },
  sw: {
    instruction: 'Toa muhtasari wa hotuba wa sura ifuatayo ya Biblia.'
  },
  'fr-CA': {
    instruction: 'Fournir un résumé parlé du chapitre biblique suivant.'
  }
};

/**
 * Build chapter summary prompt (translation-aware and language-aware)
 */
export function buildChapterSummaryPrompt({
  translation_name,
  translation_code,
  book_name,
  chapter,
  chapter_text,
  language_code = 'en'
}) {
  const instruction = LANGUAGE_INSTRUCTIONS[language_code]?.instruction || LANGUAGE_INSTRUCTIONS.en.instruction;
  
  return `${instruction}

Translation: ${translation_name} (${translation_code})
Book: ${book_name}
Chapter: ${chapter}

Bible Text:
"""
${chapter_text}
"""

Summary requirements:
- Length: 45–75 seconds when spoken (approximately 112-187 words)
- Use simple, conversational language appropriate for ${language_code === 'en' ? 'English' : language_code === 'sw' ? 'Swahili' : 'French'} speakers
- Explain the main theme and message
- Do not list verses or verse numbers
- Do not analyze theology deeply
- Do not say "this chapter teaches" repeatedly
- Write with natural pauses and short sentences

End with ONE calm reflective statement (not a question).

Provide ONLY the summary text, no introduction or preamble.`;
}

/**
 * Convert summary text into TTS-optimized format
 * Creates 3–6 "thought lines" with \n separators for natural pacing
 */
export function formatSummaryForTTS(text) {
  if (!text || typeof text !== 'string') return '';

  let processed = text.trim();

  // Remove AI preambles
  processed = processed.replace(/^(As an AI|As an assistant).*?[.!?]\s*/i, '');

  // Split into sentences
  const sentences = processed
    .split(/([.!?]+)/)
    .reduce((acc, part, i) => {
      if (i % 2 === 0) {
        acc.push(part);
      } else {
        acc[acc.length - 1] += part;
      }
      return acc;
    }, [])
    .filter(s => s.trim().length > 0);

  // Group sentences into 3–6 "thought lines"
  const thoughtLines = [];
  let currentLine = [];
  let currentLength = 0;
  const targetLength = 25; // words per thought line

  for (const sentence of sentences) {
    const wordCount = sentence.trim().split(/\s+/).length;
    
    if (currentLength + wordCount > targetLength && currentLine.length > 0) {
      // Start new thought line
      thoughtLines.push(currentLine.join(' '));
      currentLine = [sentence.trim()];
      currentLength = wordCount;
    } else {
      currentLine.push(sentence.trim());
      currentLength += wordCount;
    }
  }

  // Add remaining line
  if (currentLine.length > 0) {
    thoughtLines.push(currentLine.join(' '));
  }

  // Limit to 3–6 lines for clarity
  const limitedLines = thoughtLines.slice(0, 6);
  if (limitedLines.length < 3 && thoughtLines.length > 0) {
    // If too few lines, recombine
    return thoughtLines.join('\n\n').trim();
  }

  // Join with \n for TTS pacing
  return limitedLines.join('\n\n').trim();
}

/**
 * Validate chapter summary (similar to verse explanation)
 */
export function validateChapterSummary(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, issue: 'empty' };
  }

  const wordCount = text.trim().split(/\s+/).length;
  // Max ~230 words for 75 seconds at 150 WPM
  if (wordCount > 230) {
    return { valid: false, issue: 'too_long' };
  }

  // Min ~90 words for 45 seconds at 150 WPM
  if (wordCount < 90) {
    return { valid: false, issue: 'too_short' };
  }

  // Check for preachy language
  if (/\byou\s+(must|should|need to|have to)/i.test(text)) {
    return { valid: false, issue: 'preachy' };
  }

  // Check for verse citations (should summarize, not cite)
  if (/\b(\d+:\d+|verse|verses?)\b/i.test(text)) {
    return { valid: false, issue: 'cites_verses' };
  }

  // Check for translation comparisons
  if (/(compared to|unlike|instead of|other translations?)/i.test(text)) {
    return { valid: false, issue: 'compares_translations' };
  }

  return { valid: true };
}

/**
 * Build retry prompt for chapter summary
 */
export function buildChapterRetryPrompt(originalPrompt, failureReason) {
  const addendum = `
[RETRY - IMPORTANT: Previous attempt had issues. Please fix:]
${failureReason === 'preachy' ? '- Rewrite without commanding language. Use "This reveals..." or "The passage shows..."' : ''}
${failureReason === 'too_long' ? '- Reduce to 100-120 words. Be concise.' : ''}
${failureReason === 'too_short' ? '- Expand to 100-150 words. Include main themes.' : ''}
${failureReason === 'cites_verses' ? '- Do not mention verse numbers. Summarize the message instead.' : ''}
${failureReason === 'compares_translations' ? '- Focus only on provided text. Do not mention other versions.' : ''}
- Keep it calm, clear, and suitable for audio listening.`;

  return originalPrompt + addendum;
}