/**
 * AI Bible Service — centralized layer for all Bible-related AI calls.
 * Handles verse explanations, study questions, cross-references, devotionals.
 * Each method has its own guardrails and prompt engineering.
 * All public functions return the standard { success, data } / { success, error } contract.
 */
import { base44 } from '@/api/base44Client';
import { wrap } from './apiContract';

const LANGUAGE_MAP = {
  en: 'English', om: 'Afaan Oromoo', am: 'Amharic',
  ar: 'Arabic', sw: 'Swahili', fr: 'French'
};

const BIBLE_GUARDRAILS = `Guidelines:
- Always cite Scripture references (Book Chapter:Verse)
- Ground responses in biblical truth, not personal opinion
- Be respectful of different theological traditions while maintaining biblical orthodoxy
- Never make medical, legal, or professional advice claims
- Keep responses accessible but substantive`;

function getLangInstruction(lang) {
  return `Respond in ${LANGUAGE_MAP[lang] || 'English'}.`;
}

// ── Verse Explanation ───────────────────────────────────────

export async function explainVerse(reference, verseText, lang = 'en') {
  const prompt = `You are a biblical teaching assistant. ${getLangInstruction(lang)}

${BIBLE_GUARDRAILS}

Explain the Bible verse "${reference}: ${verseText}" in a warm, accessible way.
Focus on: core spiritual meaning, historical context, and practical relevance for today.
3-4 paragraphs.`;

  return wrap(
    () => base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: { type: 'object', properties: { content: { type: 'string' } } }
    }),
    'AI_EXPLAIN_FAILED',
    'Could not generate an explanation. Please try again.'
  );
}

// ── Historical Context ──────────────────────────────────────

export async function getHistoricalContext(reference, lang = 'en') {
  const prompt = `You are a biblical historian. ${getLangInstruction(lang)}

${BIBLE_GUARDRAILS}

Give the historical and cultural context for "${reference}".
Include: who wrote it, when, the audience, cultural setting, and significance.
3-4 paragraphs.`;

  return wrap(
    () => base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: { type: 'object', properties: { content: { type: 'string' } } }
    }),
    'AI_CONTEXT_FAILED',
    'Could not load historical context. Please try again.'
  );
}

// ── Cross References ────────────────────────────────────────

export async function getCrossReferences(reference, verseText, lang = 'en') {
  const prompt = `You are a biblical cross-reference expert. ${getLangInstruction(lang)}

${BIBLE_GUARDRAILS}

List 4-5 cross-reference Bible verses that complement "${reference}: ${verseText}".
For each, give the reference and 1-2 sentences explaining the connection.`;

  return wrap(
    () => base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: { type: 'object', properties: { content: { type: 'string' } } }
    }),
    'AI_CROSSREF_FAILED',
    'Could not load cross references. Please try again.'
  );
}

// ── Reflection Questions ────────────────────────────────────

export async function generateReflectionQuestions(reference, verseText, lang = 'en') {
  const prompt = `You are a spiritual growth mentor. ${getLangInstruction(lang)}

${BIBLE_GUARDRAILS}

Write 3 thoughtful reflection questions based on "${reference}: ${verseText}".
Questions should help a believer apply this verse to daily life.`;

  return wrap(
    () => base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: { type: 'object', properties: { content: { type: 'string' } } }
    }),
    'AI_REFLECTION_FAILED',
    'Could not generate reflection questions. Please try again.'
  );
}

// ── Bible Chat (Passage Q&A) ────────────────────────────────

export async function askAboutPassage(question, passageRef, passageText, lang = 'en') {
  const prompt = `You are a biblical teaching assistant. ${getLangInstruction(lang)}

SCRIPTURE PASSAGE (${passageRef}):
${passageText}

${BIBLE_GUARDRAILS}
- If the verses don't fully answer, acknowledge and suggest related passages

USER QUESTION: ${question}`;

  return wrap(
    () => base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: false }),
    'AI_PASSAGE_QA_FAILED',
    'Could not answer your question. Please try again.'
  );
}

// ── General Bible AI Chat ───────────────────────────────────

export async function askBibleQuestion(question, lang = 'en') {
  const prompt = `You are FaithLight's AI biblical advisor. ${getLangInstruction(lang)}

You help Christians understand Scripture through:
1. Historical & cultural context
2. Theological depth
3. Practical application for daily living
4. Connection to other biblical passages

${BIBLE_GUARDRAILS}
- Encourage users to consult their pastor for complex theological topics

Remember: You assist faith growth, not replace pastoral care.

USER QUESTION: ${question}`;

  return wrap(
    () => base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: false }),
    'AI_QUESTION_FAILED',
    'Could not answer your question. Please try again.'
  );
}

// ── Track AI Usage ──────────────────────────────────────────

export async function trackAIUsage(userId) {
  if (!userId) return;
  return base44.functions.invoke('incrementAIUsage', { user_id: userId }).catch(() => {});
}