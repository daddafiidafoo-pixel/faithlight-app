/**
 * Validates AI Bible response against guardrails
 * Returns { ok, errors } where errors is an array of issues found
 */
export function validateBibleAIResponse(response, context = {}) {
  const { langCode = 'en', contextText = '', originalQuestion = '' } = context;
  const errors = [];

  if (!response || typeof response !== 'object') {
    errors.push('Invalid response structure');
    return { ok: false, errors };
  }

  // 1. Language leak detection
  if (langCode && langCode !== 'en') {
    const englishPatterns = [
      /\b(Explanation|Application|Bible Verse|Key Insight|Prayer|Reflection)\b/gi,
      /\b(In conclusion|Therefore|Point \d+|Furthermore|However)\b/gi,
    ];

    let englishCount = 0;
    let totalWords = (response.answer || '').split(/\s+/).length;

    englishPatterns.forEach(pattern => {
      const matches = (response.answer || '').match(pattern);
      if (matches) englishCount += matches.length;
    });

    const englishPercentage = totalWords > 0 ? (englishCount / totalWords) * 100 : 0;
    if (englishPercentage > 20) {
      errors.push(`Language leak detected: ${Math.round(englishPercentage)}% English in ${langCode} response`);
    }
  }

  // 2. Reference validation
  if (response.references && Array.isArray(response.references)) {
    const bibleBooks = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
      '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
      'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Songs',
      'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
      'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
      'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
      'Matthew', 'Mark', 'Luke', 'John',
      'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
      'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
      'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
      'Jude', 'Revelation'
    ];

    response.references.forEach((ref, idx) => {
      if (!ref.ref) {
        errors.push(`Reference ${idx + 1}: missing 'ref' field`);
        return;
      }

      // Parse book chapter:verse
      const match = ref.ref.match(/^([A-Za-z0-9 ]+)\s+(\d+):(\d+)$/);
      if (!match) {
        errors.push(`Reference ${idx + 1}: invalid format "${ref.ref}"`);
        return;
      }

      const [, book, chapter, verse] = match;
      const bookExists = bibleBooks.some(b => b.toLowerCase() === book.toLowerCase());
      if (!bookExists) {
        errors.push(`Reference ${idx + 1}: book "${book}" not recognized`);
      }

      const chapterNum = parseInt(chapter);
      const verseNum = parseInt(verse);
      if (chapterNum < 1 || chapterNum > 150 || verseNum < 1 || verseNum > 176) {
        errors.push(`Reference ${idx + 1}: chapter/verse out of plausible range`);
      }
    });
  }

  // 3. Quote verification (must be in context)
  if (contextText && response.references && Array.isArray(response.references)) {
    response.references.forEach((ref, idx) => {
      if (ref.quote && ref.source === 'Bible text provided') {
        // Check if quote appears in context
        const normalizedQuote = ref.quote.toLowerCase().trim();
        const normalizedContext = contextText.toLowerCase();

        if (!normalizedContext.includes(normalizedQuote)) {
          errors.push(`Reference ${idx + 1}: quote not found in provided context`);
          ref.source = 'Not quoted';
        }
      }
    });
  }

  // 4. Response completeness check
  if (!response.answer || response.answer.trim().length < 20) {
    errors.push('Answer too short or missing');
  }

  if (!response.language) {
    errors.push('Missing language field');
  }

  // 5. Confidence downgrade if no context provided
  if (!contextText && response.confidence === 'high') {
    response.confidence = 'medium';
    if (!response.disclaimer || !response.disclaimer.includes('verify')) {
      response.disclaimer = (response.disclaimer || '') + ' Please verify exact wording in your Bible text.';
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    response: response, // Always return response, even if validation failed (frontend decides what to do)
  };
}

/**
 * Build repair prompt for retry after validation failures
 */
export function buildRepairPrompt(basePrompt, validationErrors, langName) {
  const errorSummary = validationErrors.join('; ');
  return `${basePrompt}

REPAIR ISSUES:
${errorSummary}

Please regenerate the response:
- Only use references you are absolutely certain exist
- Only quote from the Context provided
- Ensure answer is entirely in ${langName}
- Do not add information not in the Context`;
}