import { base44 } from '@/api/base44Client';

const LANGUAGE_NAMES = {
  en: 'English',
  om: 'Afaan Oromo',
  am: 'Amharic',
  ar: 'Arabic',
  es: 'Spanish',
  fr: 'French',
};

const TONE_RULES = {
  om: 'Use language suitable for church teaching; avoid slang.',
  am: 'Use respectful, pastoral language appropriate for church settings.',
  ar: 'استخدم لغة احترام وتعليمية مناسبة للكنيسة.',
};

/**
 * Process voice translation request
 */
export async function processVoiceTranslation(voiceRequestId) {
  try {
    const request = await base44.entities.VoiceRequest.filter({ id: voiceRequestId });
    if (!request.length) throw new Error('Request not found');
    
    const voiceRequest = request[0];

    // Update status to processing
    await base44.entities.VoiceRequest.update(voiceRequestId, {
      status: 'PROCESSING',
    });

    // Generate translation based on mode
    const result = await translateScripture(
      voiceRequest.source_text,
      voiceRequest.source_language,
      voiceRequest.target_language,
      voiceRequest.mode
    );

    // Generate TTS if desired
    let ttsUrl = null;
    if (result.translation) {
      ttsUrl = await generateTTS(result.translation, voiceRequest.target_language);
    }

    // Update request with results
    await base44.entities.VoiceRequest.update(voiceRequestId, {
      status: 'DONE',
      result_translation: result.translation,
      result_explanation: result.explanation || null,
      result_tts_url: ttsUrl,
    });

    return {
      success: true,
      translation: result.translation,
      explanation: result.explanation,
      ttsUrl,
    };
  } catch (error) {
    console.error('Voice translation error:', error);
    
    // Update request with error
    await base44.entities.VoiceRequest.update(voiceRequestId, {
      status: 'FAILED',
      error_message: error.message,
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Translate Scripture using AI
 */
async function translateScripture(sourceText, sourceLanguage, targetLanguage, mode) {
  const targetLangName = LANGUAGE_NAMES[targetLanguage];
  const toneRule = TONE_RULES[targetLanguage] ? `\n${TONE_RULES[targetLanguage]}` : '';

  let prompt;
  if (mode === 'TRANSLATE_ONLY') {
    prompt = `You are a Bible translation assistant.

Task: Translate the text into ${targetLangName} clearly and naturally.
Rules:
- Keep all Bible references unchanged (e.g., Psalm 119:105, John 3:16).
- Do NOT add new theology or new meaning.
- Do NOT paraphrase beyond what translation requires.
- Use respectful, church-appropriate language.${toneRule}
- Output ONLY the translation.

Text:
${sourceText}`;
  } else {
    // TRANSLATE_EXPLAIN mode
    prompt = `You are a Bible translation and teaching assistant.

1) Translate the text into ${targetLangName} clearly and naturally.
2) Provide a short explanation in ${targetLangName} in 2–4 sentences.

Rules:
- Keep all Bible references unchanged (e.g., Psalm 119:105, John 3:16).
- Stay faithful to the meaning of the text.
- Avoid controversial or denominational arguments.
- Keep the explanation simple and pastoral.${toneRule}

Format your response as:
TRANSLATION: [translated text]
EXPLANATION: [2-4 sentence explanation]

Text:
${sourceText}`;
  }

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: 'object',
        properties: {
          translation: { type: 'string' },
          explanation: { type: 'string' },
        },
      },
    });

    // Parse response based on mode
    if (mode === 'TRANSLATE_ONLY') {
      return {
        translation: response.translation || sourceText,
        explanation: null,
      };
    } else {
      return {
        translation: response.translation || sourceText,
        explanation: response.explanation || null,
      };
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * Generate text-to-speech for translation
 */
async function generateTTS(text, language) {
  try {
    // For now, return a placeholder URL
    // In production, integrate with a TTS service like AWS Polly, Google Cloud TTS, or Azure Speech
    // This would typically be done server-side for security
    console.log(`TTS generation for ${language}: ${text.substring(0, 50)}...`);
    
    // Placeholder - would be actual TTS service
    return null;
  } catch (error) {
    console.error('TTS generation error:', error);
    return null;
  }
}

/**
 * Create a voice request
 */
export async function createVoiceRequest(userId, sourceType, sourceText, targetLanguage, mode, audioFileUrl = null) {
  try {
    const request = await base44.entities.VoiceRequest.create({
      user_id: userId,
      source_type: sourceType,
      source_text: sourceText,
      target_language: targetLanguage,
      mode: mode,
      audio_file_url: audioFileUrl,
      status: 'PENDING',
    });

    // Trigger translation processing
    await processVoiceTranslation(request.id);

    return request;
  } catch (error) {
    console.error('Error creating voice request:', error);
    throw error;
  }
}

/**
 * Get user's translation history
 */
export async function getUserTranslationHistory(userId, limit = 20) {
  try {
    const requests = await base44.entities.VoiceRequest.filter(
      { user_id: userId },
      '-created_date',
      limit
    );
    return requests;
  } catch (error) {
    console.error('Error fetching translation history:', error);
    return [];
  }
}

/**
 * Submit a translation review
 */
export async function submitTranslationReview(voiceRequestId, reviewerUserId, reviewerName, rating, notes, status) {
  try {
    const review = await base44.entities.TranslationReview.create({
      voice_request_id: voiceRequestId,
      reviewer_user_id: reviewerUserId,
      reviewer_name: reviewerName,
      rating,
      notes,
      status,
    });

    return review;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}

/**
 * Get reviews for a translation
 */
export async function getTranslationReviews(voiceRequestId) {
  try {
    const reviews = await base44.entities.TranslationReview.filter({
      voice_request_id: voiceRequestId,
    });
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}