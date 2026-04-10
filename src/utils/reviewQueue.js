/**
 * Client-side helper to enqueue a translation review item.
 * Silently no-ops on failure — never blocks the user.
 */
import { base44 } from '@/api/base44Client';

export async function enqueueTranslationReview({
  user_id,
  session_id,
  page_context,
  lang_expected,
  lang_detected,
  content_sample,
  issues,
}) {
  try {
    await base44.entities.AITranslationReviewQueue.create({
      user_id: user_id || 'anonymous',
      session_id: session_id || crypto.randomUUID(),
      page_context: page_context || 'other',
      lang_expected,
      lang_detected: lang_detected || 'unknown',
      content_sample: (content_sample || '').slice(0, 500),
      issues: issues || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'pending',
    });
  } catch (err) {
    console.warn('[reviewQueue] enqueue failed:', err?.message || err);
  }
}