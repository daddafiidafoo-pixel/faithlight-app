import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const FEATURE_PROMPTS = {
  companion: {
    system: `You are FaithLight, a Christian Bible study assistant. Help users understand scripture in a clear, respectful, and encouraging way. Base answers on the Bible. Include at least one relevant Bible reference. Keep language simple and spiritually helpful. If asked about multiple interpretations, present the main views fairly.`,
    schema: {
      type: 'object',
      properties: {
        explanation: { type: 'string' },
        bible_verse_reference: { type: 'string' },
        bible_verse_text: { type: 'string' },
        reflection: { type: 'string' },
        prayer: { type: 'string' },
      },
      required: ['explanation', 'bible_verse_reference', 'reflection'],
    },
  },
  emotional: {
    system: `You are FaithLight, a compassionate Christian encouragement companion. Provide faith-based support, hope, and comfort. Always include a relevant Bible verse. Speak with warmth and spiritual care.`,
    schema: {
      type: 'object',
      properties: {
        encouragement: { type: 'string' },
        bible_verse_reference: { type: 'string' },
        bible_verse_text: { type: 'string' },
        reflection: { type: 'string' },
        prayer: { type: 'string' },
      },
      required: ['encouragement', 'bible_verse_reference', 'reflection'],
    },
  },
  verse_finder: {
    system: `You are FaithLight, a Bible verse finder. When given a topic or situation, find the most relevant Bible verses. Return 4-6 verses with references and brief explanations of why each is relevant.`,
    schema: {
      type: 'object',
      properties: {
        introduction: { type: 'string' },
        verses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              reference: { type: 'string' },
              text: { type: 'string' },
              relevance: { type: 'string' },
            },
            required: ['reference', 'text', 'relevance'],
          },
        },
      },
      required: ['introduction', 'verses'],
    },
  },
  sermon: {
    system: `You are FaithLight, a sermon preparation assistant for pastors and church leaders. Create structured, scripture-grounded sermon outlines with key points, supporting verses, and application points.`,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        theme: { type: 'string' },
        main_verse: { type: 'string' },
        introduction: { type: 'string' },
        points: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              heading: { type: 'string' },
              scripture: { type: 'string' },
              content: { type: 'string' },
              application: { type: 'string' },
            },
            required: ['heading', 'scripture', 'content'],
          },
        },
        conclusion: { type: 'string' },
        call_to_action: { type: 'string' },
      },
      required: ['title', 'main_verse', 'introduction', 'points', 'conclusion'],
    },
  },
};

// ── Oromo Master Prompt (church-approved, synced with oromoGlossary.js) ─────
const OROMO_MASTER_PROMPT = `
You are writing Christian devotional content in clear, natural Oromo for Ethiopian believers.

Follow these rules strictly:
- Use simple, respectful, natural Oromo.
- Do not translate word-for-word from English.
- Do not mix English words into Oromo sentences.
- Do not write things like "grace (ayyaana)" — use the Oromo term only.
- Do not invent poetic or unusual words. Use widely natural, church-friendly Oromo.
- Use ONLY these exact terms for these concepts:

  God = Waaqayyoo
  Jesus Christ = Yesus Kiristoos
  Holy Spirit = Hafuura Qulqulluu
  Bible = Macaafa Qulqulluu
  Bible verse = Caqasa Macaafa Qulqulluu
  Grace = Ayyaana
  Faith = Amantii
  Salvation = Fayyina
  Sin = Cubbuu
  Prayer = Kadhannaa
  Love = Jaalala
  Peace = Nagaa
  Hope = Abdiin
  Mercy = Araara
  Forgiveness = Dhiifama
  Obedience = Ajajamu
  Wisdom = Ogummaa
  Promise = Abdii
  Blessing = Eebba
  Explanation = Ibsa
  Reflection = Yaada keessaa
  Encouragement = Jajjabeessa

- Keep sentences short and clear.
- Sound like a Christian devotional, not a machine translation.
- Avoid unnatural, overly literal, or confusing phrases.

WORKFLOW:
1. Compose your answer in simple, clear English internally.
2. Rewrite it naturally in Oromo using only the terms above.
3. Output ONLY the Oromo version — no English in the final response fields.

Always structure your answer with these exact Oromo section headings in every field:
  explanation field  → starts with content for "Ibsa"
  bible_verse fields → content for "Caqasa Macaafa Qulqulluu"
  reflection field   → content for "Yaada keessaa"
  prayer field       → content for "Kadhannaa"
`;

const LANG_INSTRUCTIONS = {
  om: OROMO_MASTER_PROMPT,
  am: 'Respond in Amharic (አማርኛ). Use natural church language appropriate for Ethiopian Christian readers. DO NOT use any English words in your response.',
  ti: 'Respond in Tigrinya (ትግርኛ). Use natural church language appropriate for Eritrean and Ethiopian Christian readers. DO NOT use any English words in your response.',
  sw: 'Respond in Kiswahili. Use natural church language appropriate for East African Christian readers. DO NOT use any English words in your response.',
  fr: 'Respond in French (Français). Use clear, natural language. DO NOT use any English words in your response.',
  ar: 'Respond in Arabic (العربية). Use clear, natural language appropriate for Christian Arabic readers. DO NOT use any English words in your response.',
};

// ── FIX 1: Universal strict language prompt builder ──────────────────────────
function buildStrictLanguagePrompt(basePrompt, lang) {
  const instruction = LANG_INSTRUCTIONS[lang] || '';
  return `${basePrompt}

CRITICAL LANGUAGE RULE:
- You MUST respond ONLY in ${lang}.
- DO NOT use English unless explicitly requested.
- DO NOT mix languages.
- If you cannot answer in ${lang}, return empty fields.

${instruction}

FINAL RULE:
Your entire response MUST be in ${lang}.`;
}

// ── Language detector (consistent with utils/languageValidation.js) ────────────
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'unknown';
  if (/[ኀ-፿\u1200-\u137F]/.test(text)) return 'am';
  if (/[ء-ي\u0600-\u06FF]/.test(text)) return 'ar';
  const lower = text.toLowerCase();
  if (/\b(waaqayyoo|yesus|kiristoos|kadhannaa|ayyaana|amantii|fayyina|cubbuu|macaafa|hafuura)\b/.test(lower)) return 'om';
  if (/\b(mungu|yesu|maombi|imani|neema|wokovu|bwana|roho)\b/.test(lower)) return 'sw';
  if (/\b(dieu|jésus|prière|grâce|foi|salut|seigneur|esprit)\b/.test(lower)) return 'fr';
  if (/[a-zA-Z]/.test(text)) return 'en';
  return 'unknown';
}

// ── Structured language validation (returns same shape as utils/languageValidation.js) ──
function validateLanguageOutput(response, expectedLang) {
  if (expectedLang === 'en') return { valid: true, detected: ['en'], issues: [] };

  const fields = ['explanation', 'encouragement', 'reflection', 'prayer', 'introduction', 'conclusion'];
  const issues = new Set();
  const detected = new Set();

  for (const field of fields) {
    const value = response[field];
    if (!value) continue;
    const lang = detectLanguage(value);
    detected.add(lang);
    if (lang === 'en') {
      console.warn(`[faithAIEngine] English leak in field "${field}" for expected lang "${expectedLang}"`);
      issues.add('english_leak');
    }
    if (lang !== 'unknown' && lang !== expectedLang) issues.add('wrong_language');
    // Mixed language check
    if (expectedLang !== 'en') {
      const lower = value.toLowerCase();
      if (/\b(the|and|this|that|grace|faith|prayer|reflection|salvation|verse|god|jesus|holy|spirit)\b/.test(lower)) {
        issues.add('mixed_language');
      }
    }
  }

  return {
    valid: issues.size === 0,
    detected: Array.from(detected),
    issues: Array.from(issues),
  };
}

// ── Oromo-specific quality filter (kept for deeper Oromo checks) ──────────────
function isValidOromoContent(text) {
  if (!text || typeof text !== 'string') return false;
  if (/\b(grace|reflection|prayer|salvation|worship|blessing|forgiveness|mercy|faith|scripture|holy spirit|REFLECTION|PRAYER|GRACE|SALVATION|WORSHIP|BLESSING)\b/i.test(text)) return false;
  if (/[A-Za-z]{3,}\s*\(/.test(text)) return false;
  if (/\([A-Za-z]{3,}/.test(text)) return false;
  if (/([A-Za-z]+ ){5,}/.test(text)) return false;
  return true;
}

// ── FIX 5: Strip English Bible verse text for non-English responses ───────────
function cleanBibleVerseLanguage(response, lang) {
  if (!response.bible_verse_text || lang === 'en') return response;
  const detected = detectLanguage(response.bible_verse_text);
  if (detected === 'en') {
    delete response.bible_verse_text;
    if (response.bible_verse_reference) {
      response.bible_verse_reference += ' (text unavailable in this language)';
    }
  }
  return response;
}

// ── FIX 6: Log language issues to review queue ────────────────────────────────
async function logTranslationIssue(base44, { language, response, sessionId }) {
  try {
    await base44.asServiceRole.entities.AITranslationReviewQueue.create({
      user_id: 'system',
      session_id: sessionId,
      page_context: 'ai_hub',
      lang_expected: language,
      lang_detected: 'en',
      content_sample: JSON.stringify(response).slice(0, 500),
      issues: ['english_leak', 'wrong_language'],
      created_at: new Date().toISOString(),
      status: 'pending',
    });
  } catch (e) {
    console.warn('[faithAIEngine] Failed to log review queue item:', e?.message);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const rawInput = body.input || body.question || '';
    const input = (rawInput || '').trim();
    const language = body.language || 'en';
    const feature = body.feature || 'companion';
    const sessionId = crypto.randomUUID();

    console.log(`[faithAIEngine] feature="${feature}" lang=${language} input_len=${input.length}`);

    if (!input) {
      return Response.json({ success: false, error: 'Input cannot be empty' }, { status: 400 });
    }
    if (input.length > 2000) {
      return Response.json({ success: false, error: 'Input too long (max 2000 characters)' }, { status: 400 });
    }
    if (!['companion', 'emotional', 'verse_finder', 'sermon'].includes(feature)) {
      return Response.json({ success: false, error: 'Invalid feature' }, { status: 400 });
    }

    const featureConfig = FEATURE_PROMPTS[feature] || FEATURE_PROMPTS.companion;
    let response;
    let oromoFallback = false;
    let langValidationFailed = false;

    if (language === 'om') {
      // ── Two-step Oromo pipeline ───────────────────────────────────────────────
      const englishDraft = await base44.integrations.Core.InvokeLLM({
        prompt: `${featureConfig.system}\n\nUser question: ${input}`,
        response_json_schema: featureConfig.schema,
      });

      const oromoPrompt = `${OROMO_MASTER_PROMPT}

Use this English draft as meaning reference only — do NOT translate word-for-word:
${JSON.stringify(englishDraft, null, 2)}

Now write the response in natural Oromo following all the rules above.`;

      const oromoResponse = await base44.integrations.Core.InvokeLLM({
        prompt: oromoPrompt,
        response_json_schema: featureConfig.schema,
      });

      const fieldsToCheck = ['explanation', 'encouragement', 'reflection', 'prayer'];
      const failed = fieldsToCheck.some(f => oromoResponse[f] && !isValidOromoContent(oromoResponse[f]));

      if (failed) {
        console.warn('[faithAIEngine] Oromo quality check failed — falling back to English draft');
        response = {
          ...englishDraft,
          fallbackNotice: 'Afaan Oromoo keessatti sirriitti hin milkoofne. English fayyadamaa jira.',
        };
        oromoFallback = true;
        langValidationFailed = true;
        await logTranslationIssue(base44, { language, response: oromoResponse, sessionId });
      } else {
        response = oromoResponse;
      }

    } else if (language !== 'en') {
      // ── Strict enforced pipeline for all non-English, non-Oromo languages ──
      const strictPrompt = buildStrictLanguagePrompt(featureConfig.system, language);

      response = await base44.integrations.Core.InvokeLLM({
        prompt: `${strictPrompt}\n\nUser question: ${input}`,
        response_json_schema: featureConfig.schema,
      });

      // Validate — retry once if English leaked
      const validation1 = validateLanguageOutput(response, language);
      if (!validation1.valid) {
        langValidationFailed = true;
        console.warn(`[faithAIEngine] Language validation failed for ${language} — retrying`);

        response = await base44.integrations.Core.InvokeLLM({
          prompt: `${strictPrompt}\n\nIMPORTANT: Rewrite ENTIRE response strictly in ${language}. No English allowed.\n\nUser question: ${input}`,
          response_json_schema: featureConfig.schema,
        });

        // Log to review queue regardless of retry outcome
        await logTranslationIssue(base44, { language, response, sessionId });
      }

    } else {
      // ── English — standard pipeline ───────────────────────────────────────────
      response = await base44.integrations.Core.InvokeLLM({
        prompt: `${featureConfig.system}\n\nUser question: ${input}`,
        response_json_schema: featureConfig.schema,
      });
    }

    if (!response || typeof response !== 'object') {
      console.error('[faithAIEngine] Invalid response shape:', response);
      return Response.json({ success: false, error: 'Response generation failed' }, { status: 500 });
    }

    // FIX 5: Clean up any English Bible verse text in non-English responses
    if (language !== 'en') {
      response = cleanBibleVerseLanguage(response, language);
    }

    // Build final structured language validation for the frontend
    const finalValidation = validateLanguageOutput(response, language);
    console.log(`[faithAIEngine] success feature=${feature} lang=${language} oromoFallback=${oromoFallback} langValid=${finalValidation.valid}`);

    return Response.json({
      success: true,
      feature,
      response,
      oromoFallback,
      langValidationFailed,
      languageValidation: finalValidation,
    });
  } catch (error) {
    const errorMsg = error?.message || 'Unknown error';
    console.error('[faithAIEngine] error:', errorMsg);
    return Response.json({ success: false, error: 'AI response failed' }, { status: 500 });
  }
});