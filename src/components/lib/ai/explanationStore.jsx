import { base44 } from '@/api/base44Client';

export async function createExplanationThread({ me, reference, translationId, passageText, verseKeys, aiJson }) {
  const now = new Date().toISOString();
  const payload = {
    user_id: me.id,
    reference,
    translation_id: translationId || null,
    passage_text: passageText,
    verse_keys: verseKeys || [],
    summary: aiJson.summary || "",
    context: aiJson.context || "",
    themes: aiJson.themes || [],
    application: aiJson.application || [],
    saved: false,
    categories: [],
    is_shared: false,
    share_id: null,
    guardrails_passed: true,
  };

  const thread = await base44.entities.AIExplanationThread.create(payload);

  const breakdown = Array.isArray(aiJson.verseBreakdown) ? aiJson.verseBreakdown : [];
  for (const row of breakdown) {
    if (!row?.verseKey) continue;
    await base44.entities.AIExplanationVerseNote.create({
      thread_id: thread.id,
      verse_key: row.verseKey,
      breakdown: row.explanation || "",
      qa: [],
      saved: false,
    });
  }
  return thread;
}

export async function loadThreadWithVerseNotes(threadId) {
  const [threads, notes] = await Promise.all([
    base44.entities.AIExplanationThread.filter({ id: threadId }, null, 1),
    base44.entities.AIExplanationVerseNote.filter({ thread_id: threadId }, 'verse_key', 300),
  ]);
  return { thread: threads[0] || null, notes: notes || [] };
}

export async function toggleThreadSaved(threadId, saved) {
  return base44.entities.AIExplanationThread.update(threadId, { saved: !!saved });
}

export async function updateThreadCategories(threadId, categories) {
  return base44.entities.AIExplanationThread.update(threadId, { categories: categories || [] });
}

export function ensureGuardrailsOrThrow(aiJson, kind = "thread") {
  const g = aiJson?.guardrails || {};
  if (kind === "thread") {
    if (!g.usedOnlyProvidedPassageText || !g.didNotAddOtherScriptureReferences) {
      throw new Error("AI guardrails failed");
    }
  } else {
    if (!g.usedOnlyProvidedVerseText || !g.didNotAddOtherScriptureReferences) {
      throw new Error("AI guardrails failed");
    }
  }
}

export async function appendVerseQA({ noteId, existingQA, question, answer }) {
  const now = new Date().toISOString();
  const nextQA = Array.isArray(existingQA) ? [...existingQA] : [];
  nextQA.push({ q: question, a: answer, createdAt: now });
  await base44.entities.AIExplanationVerseNote.update(noteId, { qa: nextQA });
  return nextQA;
}

export async function toggleVerseSaved(noteId, saved) {
  await base44.entities.AIExplanationVerseNote.update(noteId, { saved: !!saved });
}

export async function ensureShareId(thread) {
  if (thread.share_id && thread.is_shared) return thread.share_id;
  const shareId = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  await base44.entities.AIExplanationThread.update(thread.id, { share_id: shareId, is_shared: true });
  return shareId;
}

export async function setThreadShared(threadId, isShared) {
  await base44.entities.AIExplanationThread.update(threadId, { is_shared: !!isShared });
}