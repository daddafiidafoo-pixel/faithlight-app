/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         FaithLight AI Orchestrator  v2                      ║
 * ║                                                              ║
 * ║  Single entry-point for ALL AI calls in FaithLight.         ║
 * ║                                                              ║
 * ║  Pipeline:                                                   ║
 * ║    Request → Validate → Cache Lookup → Route → Generate     ║
 * ║            → Guardrail → Save → Respond                     ║
 * ║                                                              ║
 * ║  Cache key patterns:                                         ║
 * ║    verse_explain : en : ISA : 41 : 10                       ║
 * ║    prayer        : om : anxiety                              ║
 * ║    devotional    : en : PHI : 4 : 6                         ║
 * ║    study_reflect : en : PHI : 4 : 6-7                       ║
 * ║    crossref      : en : JHN : 3 : 16                        ║
 * ║    topic_verses  : sw : hope                                 ║
 * ║    sermon_explain: {sessionId} : en                         ║
 * ║    support       : om : language_not_changing               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ─────────────────────────────────────────────────────────────────────────────
// 1. FEATURE REGISTRY
//    Defines every AI feature: model tier, cacheable, save policy, guardrail
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = {
  // ── Bible AI ──────────────────────────────────────────────────────────────
  verse_explain:   { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'bible'   },
  verse_reflect:   { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'bible'   },
  crossref:        { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'bible'   },
  devotional:      { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'bible'   },
  topic_verses:    { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'bible'   },
  bible_context:   { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'bible'   },

  // ── Prayer AI ─────────────────────────────────────────────────────────────
  prayer:          { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'prayer'  },
  prayer_journal:  { tier: 'fast',   cache: false, savePolicy: 'private',  guardrail: 'prayer'  },

  // ── Guided Study AI ───────────────────────────────────────────────────────
  study_explain:   { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'bible'   },
  study_context:   { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'bible'   },
  study_reflect:   { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'bible'   },
  study_prayer:    { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'prayer'  },
  study_plan:      { tier: 'heavy',  cache: false, savePolicy: 'private',  guardrail: 'bible'   },

  // ── Sermon AI ─────────────────────────────────────────────────────────────
  sermon_explain:  { tier: 'heavy',  cache: 'session', savePolicy: 'session', guardrail: 'bible' },
  sermon_reflect:  { tier: 'fast',   cache: 'session', savePolicy: 'session', guardrail: 'bible' },
  sermon_prayer:   { tier: 'fast',   cache: 'session', savePolicy: 'session', guardrail: 'prayer'},
  sermon_ask:      { tier: 'heavy',  cache: false, savePolicy: 'analytics', guardrail: 'bible'  },

  // ── Support AI ────────────────────────────────────────────────────────────
  support:         { tier: 'fast',   cache: true,  savePolicy: 'public',   guardrail: 'support' },

  // ── Bible Tutor (chat Q&A) ────────────────────────────────────────────────
  bible_tutor:     { tier: 'fast',   cache: false, savePolicy: 'analytics', guardrail: 'bible'  },

  // ── General ───────────────────────────────────────────────────────────────
  ask_ai:          { tier: 'heavy',  cache: false, savePolicy: 'private',  guardrail: 'bible'   },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. MODEL ROUTER
//    fast  → default (gpt-4o-mini) — cheap, good for structured outputs
//    heavy → claude_sonnet_4_6    — complex synthesis, theological depth
//    none  → no AI, return from data only
// ─────────────────────────────────────────────────────────────────────────────
const MODELS = {
  fast:  undefined,          // default model (cheapest)
  heavy: 'claude_sonnet_4_6',
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. CACHE KEY BUILDER
//    Pattern: feature : language : [book:chapter:verse | topic | sessionId]
// ─────────────────────────────────────────────────────────────────────────────
function buildCacheKey(feature, params) {
  const lang = (params.language || 'en').toLowerCase();
  const slug = (s) => (s || '').toLowerCase().trim().replace(/[\s:,]+/g, '_');

  switch (feature) {
    // verse_explain:en:ISA:41:10
    case 'verse_explain':
    case 'verse_reflect':
    case 'crossref':
    case 'devotional':
    case 'study_explain':
    case 'study_context':
    case 'study_reflect':
    case 'study_prayer':
    case 'bible_context':
      return `${feature}:${lang}:${slug(params.reference)}`;

    // prayer:en:anxiety
    case 'prayer':
      return `${feature}:${lang}:${slug(params.topic)}`;

    // topic_verses:sw:hope
    case 'topic_verses':
      return `${feature}:${lang}:${slug(params.topic)}`;

    // support:om:language_not_changing
    case 'support':
      return `${feature}:${lang}:${slug(params.question || '').slice(0, 60)}`;

    // sermon_explain:session123:en   (session-scoped cache)
    case 'sermon_explain':
    case 'sermon_reflect':
    case 'sermon_prayer':
      return params.sessionId ? `${feature}:${slug(params.sessionId)}:${lang}` : null;

    // never cache these
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PROMPT TEMPLATES
//    Compact by design — only send what AI needs, nothing extra.
// ─────────────────────────────────────────────────────────────────────────────
function buildPrompt(feature, params) {
  const lang = params.language || 'en';
  const L = `Language: ${lang}.`;
  const ref = params.reference || '';
  const text = params.verseText || '';
  const outline = (params.outline || []).join(' | ') || 'not provided';

  switch (feature) {
    case 'verse_explain':
      return `${L} Explain "${ref}: ${text}" warmly in 3-4 sentences. Core meaning, daily relevance, encouragement.`;

    case 'verse_reflect':
    case 'study_reflect':
      return `${L} Write 3 personal reflection questions for "${ref}: ${text}". Practical, daily-life focused.`;

    case 'crossref':
      return `${L} List 4 cross-reference Bible verses for "${ref}". Each: reference + one sentence on the connection.`;

    case 'devotional':
    case 'study_explain':
      return `${L} Write a short devotional (3 paragraphs) for "${ref}". Meaning, application, closing prayer sentence.`;

    case 'bible_context':
    case 'study_context':
      return `${L} Explain the historical and cultural context for "${ref}" in 3-4 sentences. Who wrote it, when, and why.`;

    case 'topic_verses':
      return `${L} List 5 Bible verses about "${params.topic}". Each: reference + one-sentence explanation.`;

    case 'prayer':
      return `${L} Write a sincere personal Christian prayer (6-8 sentences) about: "${params.topic}". Address God. Close with Amen.`;

    case 'prayer_journal':
      return `${L} Write a personal prayer journal entry inspired by: "${params.prompt}". Reflective, honest, 4-6 sentences.`;

    case 'study_prayer':
      return `${L} Write a personal prayer (5-7 sentences) based on the verse "${ref}: ${text}". Address God. Close with Amen.`;

    case 'study_plan':
      return `${L} Generate a ${params.days || 7}-day Bible study plan on: "${params.topic}". For each day: reference, verseText, reflectionQuestion, insight, prayerPrompt. Return as JSON object with key "days" containing an array.`;

    case 'sermon_explain':
      return `${L} A pastor just preached: Title="${params.sermonTitle}", Verse=${params.mainVerse}, Outline=${outline}. Explain this sermon warmly in 3-4 paragraphs for a church member.`;

    case 'sermon_reflect':
      return `${L} Generate 4 reflection questions for: Title="${params.sermonTitle}", Verse=${params.mainVerse}, Outline=${outline}. Personal and practical.`;

    case 'sermon_prayer':
      return `${L} Write a personal prayer (6-8 sentences) for the sermon: Title="${params.sermonTitle}", Verse=${params.mainVerse}. Close with Amen.`;

    case 'sermon_ask':
      return `${L} Sermon: "${params.sermonTitle}", Verse: ${params.mainVerse}, Outline: ${outline}. Question: "${params.question}". Answer faithfully in 2-3 paragraphs.`;

    case 'support':
      return `${L} You are a helpful FaithLight support assistant. Answer clearly: "${params.question}". Be friendly and concise.`;

    case 'bible_tutor':
      return `${L} You are a warm, knowledgeable AI Bible Tutor. The student asks: "${params.question}". Answer clearly and faithfully, referencing Scripture where relevant. Keep it accessible and encouraging. 2-4 paragraphs.`;

    case 'ask_ai':
      return `${L} You are a FaithLight AI Bible companion. Answer faithfully using Scripture where relevant: "${params.question}". 2-3 paragraphs.`;

    default:
      return `${L} ${params.prompt || ''}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GUARDRAILS
//    Per-domain content safety rules injected as system prefix.
// ─────────────────────────────────────────────────────────────────────────────
const GUARDRAIL_PREFIX = {
  bible: `You are a faithful, theologically sound Bible AI. Only discuss Scripture, Christian faith, and spiritual growth. Never speculate beyond the Bible. Never contradict core Christian doctrine. If a question is outside your scope, say so kindly.\n\n`,
  prayer: `You are a respectful Christian prayer assistant. Compose sincere, scripturally-grounded prayers. Never include non-Christian religious content. Keep all prayer language reverent and appropriate.\n\n`,
  support: `You are a helpful FaithLight app support assistant. Answer questions about the app, Bible features, and spiritual content. Be warm and clear. Escalate technical issues politely.\n\n`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. FREE-TIER RATE LIMITS  (requests per user per day)
// ─────────────────────────────────────────────────────────────────────────────
const FREE_LIMITS = {
  verse_explain: 25, verse_reflect: 15, crossref: 20, devotional: 10,
  study_explain: 15, study_context: 15, study_reflect: 15, study_prayer: 10,
  study_plan: 1,   topic_verses: 20, bible_context: 20,
  prayer: 10, prayer_journal: 5,
  sermon_explain: 5, sermon_reflect: 5, sermon_prayer: 5, sermon_ask: 3,
  support: 10, ask_ai: 5,
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { feature, params = {}, isPremium = false, userId } = body;

    // ── Validate feature ───────────────────────────────────────────────────
    if (!feature || !FEATURES[feature]) {
      return Response.json({ success: false, error: 'UNKNOWN_FEATURE', message: `Unknown feature: ${feature}` }, { status: 400 });
    }

    const featureConfig = FEATURES[feature];

    // ── Rate limit (free tier) ─────────────────────────────────────────────
    if (!isPremium && userId) {
      const today = new Date().toISOString().split('T')[0];
      const rateKey = `ratelimit:${userId}:${today}:${feature}`;
      const limit = FREE_LIMITS[feature] ?? 5;

      const existing = await base44.asServiceRole.entities.AICache
        .filter({ cache_key: rateKey })
        .catch(() => []);

      const count = existing?.[0]?.hit_count || 0;

      if (count >= limit) {
        console.log(`[orchestrator] RATE_LIMIT user=${userId} feature=${feature} ${count}/${limit}`);
        return Response.json({
          success: false,
          error: 'RATE_LIMIT',
          message: `Daily limit of ${limit} reached for ${feature}. Upgrade to FaithLight Plus for unlimited access.`,
          used: count, limit,
        }, { status: 429 });
      }

      // Increment counter async (non-blocking)
      if (existing?.[0]?.id) {
        base44.asServiceRole.entities.AICache.update(existing[0].id, { hit_count: count + 1 }).catch(() => {});
      } else {
        base44.asServiceRole.entities.AICache.create({ cache_key: rateKey, feature, language: 'meta', content: '', hit_count: 1 }).catch(() => {});
      }
    }

    // ── Cache lookup ───────────────────────────────────────────────────────
    const cacheKey = featureConfig.cache ? buildCacheKey(feature, params) : null;

    if (cacheKey) {
      const cached = await base44.asServiceRole.entities.AICache
        .filter({ cache_key: cacheKey })
        .catch(() => []);

      if (cached?.[0]?.content) {
        console.log(`[orchestrator] CACHE_HIT ${cacheKey}`);
        base44.asServiceRole.entities.AICache.update(cached[0].id, { hit_count: (cached[0].hit_count || 0) + 1 }).catch(() => {});
        return Response.json({ success: true, result: cached[0].content, source: 'cache', feature });
      }
    }

    // ── Build prompt with guardrail prefix ────────────────────────────────
    const guardrailPrefix = GUARDRAIL_PREFIX[featureConfig.guardrail] || '';
    const prompt = guardrailPrefix + buildPrompt(feature, params);

    // ── Pick model ─────────────────────────────────────────────────────────
    const tier = featureConfig.tier;
    const model = MODELS[tier];
    console.log(`[orchestrator] GENERATE feature=${feature} tier=${tier} cache=${cacheKey || 'none'}`);

    // ── Generate ───────────────────────────────────────────────────────────
    let result;
    try {
      result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        ...(model ? { model } : {}),
      });
    } catch (aiErr) {
      // Fallback: if heavy model fails, retry with fast
      if (tier === 'heavy') {
        console.warn(`[orchestrator] HEAVY_MODEL_FAIL, retrying with fast: ${aiErr.message}`);
        result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt }).catch(() => null);
      }
      if (!result) {
        return Response.json({ success: false, error: 'AI_TIMEOUT', message: 'AI is temporarily unavailable. Please try again shortly.' }, { status: 503 });
      }
    }

    if (!result) {
      return Response.json({ success: false, error: 'AI_EMPTY', message: 'No response generated. Please try again.' }, { status: 500 });
    }

    // ── Save to cache (public/session) ─────────────────────────────────────
    if (cacheKey && (featureConfig.savePolicy === 'public' || featureConfig.savePolicy === 'session')) {
      base44.asServiceRole.entities.AICache.create({
        cache_key: cacheKey,
        feature,
        language: params.language || 'en',
        content: result,
        hit_count: 0,
      }).catch((e) => console.error('[orchestrator] cache_write_error:', e));
    }

    // ── Standard response ──────────────────────────────────────────────────
    return Response.json({ success: true, result, source: 'generated', model: tier, feature });

  } catch (err) {
    console.error('[orchestrator] FATAL:', err);
    return Response.json({ success: false, error: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
});