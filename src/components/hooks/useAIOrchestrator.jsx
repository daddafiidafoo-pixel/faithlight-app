/**
 * useAIOrchestrator
 * 
 * Single hook for ALL AI calls in FaithLight.
 * Routes through the backend orchestrator (cache → model → guardrail).
 * 
 * ─── Supported features ────────────────────────────────────────────────────
 * Bible AI   : verse_explain | verse_reflect | crossref | devotional
 *              bible_context | topic_verses
 * Prayer AI  : prayer | prayer_journal
 * Study AI   : study_explain | study_context | study_reflect
 *              study_prayer | study_plan
 * Sermon AI  : sermon_explain | sermon_reflect | sermon_prayer | sermon_ask
 * Support AI : support
 * General    : ask_ai
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * Usage:
 *   const { generate, loading, error } = useAIOrchestrator();
 * 
 *   // Verse explanation (cached, cheap):
 *   const result = await generate('verse_explain', {
 *     reference: 'Isaiah 41:10',
 *     verseText: 'Fear not, for I am with you...',
 *     language: 'en',
 *   });
 * 
 *   // Prayer (cached, cheap):
 *   const prayer = await generate('prayer', { topic: 'anxiety', language: 'om' });
 * 
 *   // Sermon Q&A (heavy model, not cached):
 *   const answer = await generate('sermon_ask', {
 *     sermonTitle: 'Renew Your Mind',
 *     mainVerse: 'Romans 12:2',
 *     outline: ['Do not conform', 'Be transformed'],
 *     question: 'How do I apply this daily?',
 *     sessionId: 'abc123',
 *     language: 'en',
 *   }, { isPremium: true, userId: user.id });
 * 
 *   // Study plan (heavy model, saves to user):
 *   const plan = await generate('study_plan', {
 *     topic: 'Overcoming Anxiety',
 *     days: 7,
 *     language: 'en',
 *   }, { userId: user.id });
 * 
 * Error shape:
 *   { type: 'RATE_LIMIT' | 'AI_TIMEOUT' | 'AI_EMPTY' | 'INTERNAL_ERROR' | 'UNKNOWN_FEATURE',
 *     message: string, used?: number, limit?: number }
 */

import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useAIOrchestrator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // 'cache' | 'generated'
  const [modelTier, setModelTier] = useState(null); // 'fast' | 'heavy'

  const generate = useCallback(async (feature, params = {}, options = {}) => {
    setLoading(true);
    setError(null);
    setSource(null);
    setModelTier(null);

    try {
      const res = await base44.functions.invoke('aiOrchestrator', {
        feature,
        params,
        userId: options.userId || null,
        isPremium: options.isPremium || false,
      });

      const data = res.data;

      if (!data?.success) {
        setError({ type: data?.error || 'UNKNOWN', message: data?.message || 'Something went wrong.', used: data?.used, limit: data?.limit });
        return null;
      }

      setSource(data.source || 'generated');
      setModelTier(data.model || null);
      return data.result || null;

    } catch (err) {
      setError({ type: 'NETWORK_ERROR', message: 'Unable to connect. Please check your connection and try again.' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Convenience: clear error state */
  const clearError = useCallback(() => setError(null), []);

  return { generate, loading, error, source, modelTier, clearError };
}