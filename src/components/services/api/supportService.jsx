/**
 * Support Service — centralized layer for app help and support AI.
 * Handles troubleshooting, navigation guidance, and FAQ responses.
 * Separate from Bible AI — different guardrails and prompt.
 */
import { base44 } from '@/api/base44Client';

const LANGUAGE_MAP = {
  en: 'English', om: 'Afaan Oromoo', am: 'Amharic',
  ar: 'Arabic', sw: 'Swahili', fr: 'French'
};

// ── Support AI Chat ─────────────────────────────────────────

export async function askSupportQuestion(question, lang = 'en') {
  const langName = LANGUAGE_MAP[lang] || 'English';
  const prompt = `You are FaithLight's support assistant. Respond in ${langName}.

You help users navigate the FaithLight Bible app and troubleshoot issues.

FaithLight features include:
- Bible reading with multiple translations (English, Afaan Oromoo, Amharic, Arabic, French, Swahili)
- AI-powered verse explanations and study tools
- Audio Bible (text-to-speech and streamed audio)
- Prayer wall and prayer generation
- Study plans and reading goals
- Offline Bible reading
- Guided Study sessions
- Community discussions

Guidelines:
- Be friendly, patient, and clear
- Provide step-by-step instructions when helpful
- Direct users to specific pages or features
- Never provide biblical interpretation (direct to the Bible AI feature)
- If unsure, suggest contacting support

USER QUESTION: ${question}`;

  return base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: false });
}

// ── Help Docs ───────────────────────────────────────────────

export async function fetchHelpDocs(limit = 20) {
  return base44.entities.AppHelpDoc.filter({}, 'sort_order', limit).catch(() => []);
}

// ── Feedback / Reports ──────────────────────────────────────

export async function submitFeedback(userId, data) {
  return base44.entities.AmbassadorFeedback.create({
    userId,
    ...data,
    submittedAt: new Date().toISOString()
  });
}

export async function submitContentReport(data) {
  return base44.entities.ContentReport.create(data);
}