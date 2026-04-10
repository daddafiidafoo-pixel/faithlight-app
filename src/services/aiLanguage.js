/**
 * AI language guard.
 * Ensures all AI responses stay in the user's selected language.
 * Uses a strict system prompt + optional single retry on wrong-language response.
 */

import { getLangConfig } from '@/config/languages';
import { base44 } from '@/api/base44Client';

/**
 * Build a language-locked prompt pair { systemPrompt, userPrompt }.
 */
export function buildLanguageLockedPrompt(lang, userText) {
  const { aiName } = getLangConfig(lang);
  const system = `You are FaithLight AI, a respectful and clear Bible companion.
CRITICAL RULE: You MUST respond ENTIRELY in ${aiName}. No exceptions.
Do NOT use English unless the user explicitly writes in English.
Do NOT mix languages in a single response.
If quoting a Bible verse, keep the explanation in ${aiName}.
Keep your tone warm, clear, and spiritually grounded.`.trim();

  return { system, user: userText };
}

/**
 * Basic heuristic: does the response look like it might be in the wrong language?
 * Checks for unexpected Latin script in non-Latin languages.
 */
function looksWrongLanguage(lang, text) {
  if (!text || text.length < 20) return false;
  // For Arabic: expect high density of Arabic Unicode characters
  if (lang === 'ar') {
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    return arabicChars / text.length < 0.2;
  }
  // For Amharic/Tigrinya: expect Ethiopic script
  if (lang === 'am' || lang === 'ti') {
    const ethiopicChars = (text.match(/[\u1200-\u137F]/g) || []).length;
    return ethiopicChars / text.length < 0.1;
  }
  // For Oromo/Swahili/French: Latin script OK, just a basic check
  return false;
}

/**
 * Invoke the AI with language locking + one automatic retry if response is wrong language.
 * @param {string} lang  — app language code
 * @param {string} userText — the user's question/prompt
 * @param {object} [options] — optional: response_json_schema, file_urls, model
 */
export async function generateLanguageLockedResponse(lang, userText, options = {}) {
  const { aiName } = getLangConfig(lang);
  const { system, user } = buildLanguageLockedPrompt(lang, userText);

  // Combine system context into the prompt (InvokeLLM uses a single 'prompt' field)
  const fullPrompt = `${system}\n\n---\n\n${user}`;

  let answer = await base44.integrations.Core.InvokeLLM({
    prompt: fullPrompt,
    ...options,
  });

  // If it looks like the wrong language, retry once with explicit correction
  if (typeof answer === 'string' && looksWrongLanguage(lang, answer)) {
    const retryPrompt = `${system}

IMPORTANT: Your previous answer appears to be in the wrong language.
You MUST rewrite your entire answer in ${aiName} only.

User's original question:
${user}`;

    answer = await base44.integrations.Core.InvokeLLM({
      prompt: retryPrompt,
      ...options,
    });
  }

  return answer;
}