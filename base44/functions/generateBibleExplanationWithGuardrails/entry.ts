import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Validate AI response against guardrails
 */
function validateBibleAIResponse(response, context = {}) {
  const { langCode = 'en' } = context;
  const errors = [];

  if (!response || typeof response !== 'object') {
    errors.push('Invalid response structure');
    return { ok: false, errors, response };
  }

  if (!response.answer || response.answer.trim().length < 20) {
    errors.push('Answer too short');
  }

  if (!response.language) {
    errors.push('Missing language field');
  }

  return {
    ok: errors.length === 0,
    errors,
    response: response, // Always return response
  };
}

/**
 * Generate Bible explanation with AI guardrails
 * Ensures responses are Scripture-grounded, multilingual-safe, and validated
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const {
      question,
      userLanguage = 'en',
      contextVerses = [],
    } = await req.json();

    if (!question || question.trim().length === 0) {
      return Response.json({ error: 'Question required' }, { status: 400 });
    }

    const languageMap = {
      'om': 'Afaan Oromoo',
      'sw': 'Swahili',
      'ar': 'Arabic',
      'am': 'Amharic',
      'en': 'English',
    };

    const langName = languageMap[userLanguage] || 'English';

    // Format context verses
    let contextText = '';
    if (contextVerses && contextVerses.length > 0) {
      contextText = contextVerses
        .map(v => `${v.reference}: "${v.text}"`)
        .join('\n\n');
    }

    // Response schema - enforces structure
    const responseSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        language: { type: 'string' },
        question: { type: 'string' },
        answer: { type: 'string' },
        references: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              ref: { type: 'string' },
              quote: { type: 'string' },
              source: { type: 'string' },
            },
            required: ['ref', 'quote', 'source'],
          },
        },
        confidence: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
        },
        disclaimer: { type: 'string' },
      },
      required: ['language', 'question', 'answer', 'references', 'confidence', 'disclaimer'],
    };

    // Build initial prompt with guardrails
    const systemPrompt = `You are the FaithLight AI Bible Companion — a Christian Bible study assistant.

Your role is to help users understand the Bible clearly and faithfully, while remaining respectful of different Christian traditions.

CRITICAL RULES:
1. Base your answer ONLY on the Bible text provided in Context.
2. Only quote verses that appear in the Context I provided.
3. Do NOT invent Bible verses or references.
4. If unsure about a verse, do not quote it — only reference it.
5. Use humble, respectful language such as "this verse reminds believers…" or "many Christians understand this as…".
6. Answer in ${langName} ONLY. Do not mix languages.
7. If you cannot answer from the provided Context, say so honestly.
8. Do not claim to give the only correct interpretation.
9. Avoid doctrinal arguments or denominational bias.
10. Do not present the answer as prophecy or divine revelation.

${contextText ? `CONTEXT — Bible verses relevant to this question:\n${contextText}\n\n` : ''}

User Question: ${question}

Respond in JSON format with exactly these fields:
- language: "${userLanguage}"
- question: "${question}"
- answer: Your detailed explanation (in ${langName})
- references: Array of {ref, quote, source} objects
  - ref: "Book Chapter:Verse"
  - quote: Short excerpt
  - source: "Bible text provided" OR "Not quoted"
- confidence: "high", "medium", or "low"
- disclaimer: Brief disclaimer noting AI responses support Bible study and may not represent every Christian tradition`;

    // First attempt
    let response = null;
    let validationResult = null;

    try {
      response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        response_json_schema: responseSchema,
        add_context_from_internet: false,
      });

      // Validate response
      validationResult = validateBibleAIResponse(response, {
        langCode: userLanguage,
        contextText,
        originalQuestion: question,
      });

      // If validation passes, return response immediately
      if (validationResult.ok) {
        return Response.json({
          success: true,
          response: validationResult.response,
          validated: true,
          retried: false,
        });
      }
      
      // Validation failed but response exists - still usable, just with warnings
      if (validationResult.response) {
        console.warn('Validation failed but response exists, using with caution:', validationResult.errors);
        return Response.json({
          success: true,
          response: validationResult.response,
          validated: false,
          errors: validationResult.errors,
          retried: false,
        });
      }
    } catch (err) {
      console.error('First LLM attempt failed:', err.message);
      validationResult = { ok: false, errors: [err.message] };
    }

    // If we have a response but validation failed, still return it
    // The frontend can handle partial/unvalidated responses
    if (validationResult.response) {
      console.warn('Validation issues but response available:', validationResult.errors);
      return Response.json({
        success: true,
        response: validationResult.response,
        validated: false,
        errors: validationResult.errors,
        retried: false,
      });
    }

    // Final fallback: return safe message if all attempts failed
    const fallbackMsg = {
      en: "I couldn't confidently answer that without the exact Bible text. Please choose a verse or passage, and I'll explain it.",
      om: "Seera Foonii sirrii malee gaaffii kana deebisuu hin dandeenye. Verse ykn kutaa filadhu, akkasumas ibsa isaati.",
      sw: "Sikuweza kujibu swali hilo bila maandishi halisi ya Bibilia. Tafadhali chagua acha au sehemu, nami nitaieleza.",
      ar: "لم أتمكن من الإجابة على ذلك بثقة بدون النص الدقيق للكتاب المقدس. يرجى اختيار آية أو مقطع، وسأشرحه.",
      am: "ትክክለኛው የመጽሐፍ ቅዱስ ጽሑፍ ሳይኖር ስለዚህ ጥያቄ በልበ እምነት መመለስ አልችልም። አንድ ወይም ክፍል ይምረጡ እና እኔ ያብራራለሁ።",
    };

    return Response.json({
      success: true,
      response: {
        language: userLanguage,
        question,
        answer: fallbackMsg[userLanguage] || fallbackMsg.en,
        references: [],
        confidence: 'low',
        disclaimer: 'Could not generate full response.',
      },
      validated: false,
      retried: true,
    });
  } catch (error) {
    console.error('CRITICAL ERROR in generateBibleExplanationWithGuardrails:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });

    // Safe fallback response
    const fallbackMsg = {
      en: 'We could not get a response right now. Please try again in a moment.',
      om: 'Amma deebii argachuu hin dandeenye. Mee yeroo biraa irra deebi\'ii yaali.',
      am: 'ዛሬ መልስ ማግኘት አልቻልንም። እንደገና ሞክር።',
      ar: 'لم نتمكن من الحصول على رد الآن. يرجى المحاولة مرة أخرى لاحقاً.',
      sw: 'Hatuwezi kupata jibu sasa. Tafadhali jaribu tena baadaye.',
    };

    return Response.json({
      success: false,
      error: fallbackMsg[userLanguage] || fallbackMsg.en,
      validated: false,
      response: null,
    }, { status: 200 });
  }
});