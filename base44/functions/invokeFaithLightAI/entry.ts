/**
 * invokeFaithLightAI
 * 
 * Unified wrapper for all AI generation calls.
 * Enforces feature gating (premium bypass, daily limits) before calling InvokeLLM.
 * 
 * Usage:
 * const result = await base44.functions.invoke('invokeFaithLightAI', {
 *   featureKey: 'ai.explain_passage',
 *   prompt: 'Explain John 3:16...',
 * });
 * 
 * Returns: {
 *   success: true,
 *   data: {...},  // or
 *   error: 'LIMIT_REACHED' | 'PREMIUM_REQUIRED'
 * }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const AI_FEATURES = {
  'ai.explain_passage': 'ai.explain_passage',
  'ai.study_plan_generate': 'ai.study_plan_generate',
  'ai.sermon_builder_generate': 'ai.sermon_builder_generate',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { featureKey, prompt, response_json_schema, add_context_from_internet, file_urls } = body;

    if (!featureKey || !prompt) {
      return Response.json(
        { error: 'featureKey and prompt are required' },
        { status: 400 }
      );
    }

    // Get user and check feature access
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }

    // Check feature access
    const accessResult = await base44.asServiceRole.functions.invoke('checkFeatureAccess', {
      featureKey,
    });

    const { allowed, reason } = accessResult.data;

    if (!allowed) {
      return Response.json({
        success: false,
        error: reason === 'premium_required' ? 'PREMIUM_REQUIRED' : 'LIMIT_REACHED',
        used: accessResult.data.used,
        limit: accessResult.data.limit,
        resets_at: accessResult.data.resets_at,
      });
    }

    // Call InvokeLLM
    const llmResult = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema,
      add_context_from_internet: add_context_from_internet || false,
      file_urls,
    });

    // If daily limit feature, increment usage
    if (user && ['ai.explain_passage', 'ai.study_plan_generate', 'ai.sermon_builder_generate'].includes(featureKey)) {
      const today = new Date().toISOString().split('T')[0];
      const usage = await base44.asServiceRole.entities.DailyUsage.filter({
        user_id: user.id,
        feature_key: featureKey,
        date: today,
      });

      if (usage.length === 0) {
        await base44.asServiceRole.entities.DailyUsage.create({
          user_id: user.id,
          feature_key: featureKey,
          date: today,
          count: 1,
        });
      } else {
        await base44.asServiceRole.entities.DailyUsage.update(usage[0].id, {
          count: (usage[0].count || 0) + 1,
        });
      }
    }

    return Response.json({
      success: true,
      data: llmResult,
    });
  } catch (error) {
    console.error('invokeFaithLightAI error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});