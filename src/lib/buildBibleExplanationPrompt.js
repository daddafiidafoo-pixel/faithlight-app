const languageNames = {
  en: 'English',
  om: 'Afaan Oromoo',
  am: 'Amharic',
  ti: 'Tigrinya',
  sw: 'Kiswahili',
  fr: 'French',
  ar: 'Arabic',
};

/**
 * Build a grounded, language-enforced Bible explanation prompt.
 * @param {object} params
 * @param {string} params.aiLanguage - language code for AI output
 * @param {string} params.question - user's question
 * @param {string} params.scriptureContext - relevant Bible passage text
 * @returns {string} full prompt string
 */
export function buildBibleExplanationPrompt({ aiLanguage, question, scriptureContext }) {
  const outputLanguage = languageNames[aiLanguage] || 'English';

  return `You are FaithLight's Bible companion.

Respond ONLY in ${outputLanguage}.
Do NOT mix languages. Do NOT default to English unless aiLanguage is "en".
Use simple, natural, pastoral wording.
Only explain using the Scripture context provided below.
If the user asks for a Bible explanation, keep the response faithful to the cited text.

Scripture context:
${scriptureContext}

User question:
${question}

Return:
1. Short explanation (2-3 sentences)
2. Main lesson
3. Optional short prayer

End with: ⚠️ AI-generated content may contain errors. Always verify with Scripture.`;
}