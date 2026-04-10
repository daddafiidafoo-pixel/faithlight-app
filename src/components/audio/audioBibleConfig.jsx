/**
 * Audio Bible Configuration
 *
 * IMPORTANT: Do NOT invent audioId values.
 * Set audioId only after verifying the dataset exists on Bible Brain
 * and your API key is authorized for it.
 *
 * recordedAudioAvailable = true  → Bible Brain recorded audio (ideal)
 * ttsAvailable           = true  → Device TTS "Read Aloud" is allowed as fallback
 * audioId                = null  → No recorded audio; only TTS or unavailable
 */

export const BIBLE_AUDIO_CONFIG = {
  en: {
    label: 'English',
    textId: 'ENGESV',              // verified English text dataset
    audioId: null,                  // Set to Bible Brain audio dataset ID when verified
    recordedAudioAvailable: false,  // flip to true once Bible Brain audio ID is confirmed
    ttsAvailable: true,             // English TTS works on all devices
    ttsLang: 'en-US',
  },
  om: {
    label: 'Afaan Oromoo',
    textId: 'GAZGAZ',              // Oromo text dataset
    audioId: null,                  // No verified Oromo audio dataset yet
    recordedAudioAvailable: false,
    ttsAvailable: false,            // No reliable Oromo TTS voice on most devices
    ttsLang: 'om',
  },
  am: {
    label: 'Amharic',
    textId: null,                   // Set when verified
    audioId: null,                  // No verified Amharic audio dataset yet
    recordedAudioAvailable: false,
    ttsAvailable: false,
    ttsLang: 'am-ET',
  },
  sw: {
    label: 'Swahili',
    textId: null,
    audioId: null,
    recordedAudioAvailable: false,
    ttsAvailable: false,
    ttsLang: 'sw',
  },
  fr: {
    label: 'French',
    textId: null,
    audioId: null,
    recordedAudioAvailable: false,
    ttsAvailable: true,
    ttsLang: 'fr-FR',
  },
  ar: {
    label: 'Arabic',
    textId: null,
    audioId: null,
    recordedAudioAvailable: false,
    ttsAvailable: false,
    ttsLang: 'ar',
  },
};

/**
 * Returns the audio config for a language, falling back to English.
 */
export function getAudioConfig(langCode = 'en') {
  return BIBLE_AUDIO_CONFIG[langCode] || BIBLE_AUDIO_CONFIG.en;
}

/**
 * Check if device TTS supports a language by scanning available voices.
 * Returns true if at least one voice matches the lang prefix.
 */
export function deviceSupportsTTS(ttsLang) {
  if (!('speechSynthesis' in window)) return false;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    // Voices may not be loaded yet — only trust for 'en' by default
    return ttsLang?.startsWith('en');
  }
  const prefix = ttsLang?.split('-')[0]?.toLowerCase();
  return voices.some(v => v.lang.toLowerCase().startsWith(prefix));
}

/**
 * Resolve the best available audio mode for a given language.
 *
 * Returns:
 *  { mode: 'recorded', audioId }   — Bible Brain recorded audio
 *  { mode: 'tts', ttsLang }        — Device TTS read-aloud
 *  { mode: 'unavailable' }          — Nothing available
 */
export function resolveAudioMode(langCode = 'en') {
  const config = getAudioConfig(langCode);

  if (config.recordedAudioAvailable && config.audioId) {
    return { mode: 'recorded', audioId: config.audioId };
  }

  if (config.ttsAvailable && deviceSupportsTTS(config.ttsLang)) {
    return { mode: 'tts', ttsLang: config.ttsLang };
  }

  return { mode: 'unavailable' };
}