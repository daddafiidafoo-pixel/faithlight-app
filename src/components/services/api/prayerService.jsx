/**
 * Prayer Service — centralized API layer for all prayer operations.
 */
import { base44 } from '@/api/base44Client';

const LANGUAGE_MAP = {
  en: 'English', om: 'Afaan Oromoo', am: 'Amharic',
  ar: 'Arabic', sw: 'Swahili', fr: 'French'
};

// ── Prayer Requests ─────────────────────────────────────────

export async function fetchPrayerRequests(options = {}) {
  const { userId, isPublic = true, limit = 30 } = options;
  const filter = isPublic ? {} : { user_id: userId };
  return base44.entities.PrayerRequest.filter(filter, '-created_date', limit).catch(() => []);
}

export async function createPrayerRequest(data) {
  return base44.entities.PrayerRequest.create(data);
}

export async function deletePrayerRequest(id) {
  return base44.entities.PrayerRequest.delete(id);
}

// ── Prayer Support ──────────────────────────────────────────

export async function addPrayerSupport(prayerRequestId, userId) {
  return base44.entities.PrayerSupport.create({
    prayer_request_id: prayerRequestId,
    user_id: userId,
    supported_at: new Date().toISOString()
  });
}

// ── AI Prayer Generation ────────────────────────────────────

export async function generatePrayer(verseReference, verseText, lang = 'en') {
  const langName = LANGUAGE_MAP[lang] || 'English';
  const prompt = `You are a Christian prayer writer. Respond in ${langName}.

Write a sincere, personal prayer (8-10 sentences) inspired by "${verseReference}: ${verseText}".
Address God directly, reference the verse's themes, and close with thanksgiving.

Guidelines:
- Be warm, genuine, and encouraging
- Include gratitude, petition, and surrender
- Ground the prayer in scriptural truth`;

  return base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: { type: 'object', properties: { content: { type: 'string' } } }
  });
}

export async function generatePrayerFromTopic(topic, lang = 'en') {
  const langName = LANGUAGE_MAP[lang] || 'English';
  const prompt = `You are a Christian prayer writer. Respond in ${langName}.

Write a sincere prayer (6-8 sentences) about: "${topic}".
Include relevant Scripture references and close with "Amen."

Guidelines:
- Be warm, genuine, and encouraging
- Reference relevant Bible verses
- Include gratitude, petition, and surrender`;

  return base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: { type: 'object', properties: { content: { type: 'string' } } }
  });
}

// ── Prayer Journal ──────────────────────────────────────────

export async function fetchPrayerJournalEntries(userId, limit = 20) {
  if (!userId) return [];
  return base44.entities.PrayerJournal.filter(
    { user_id: userId }, '-created_date', limit
  ).catch(() => []);
}

export async function savePrayerJournalEntry(userId, data) {
  return base44.entities.PrayerJournal.create({ user_id: userId, ...data });
}