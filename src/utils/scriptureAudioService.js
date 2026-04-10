import { base44 } from '@/api/base44Client';

/**
 * Resolves audio source for scripture passage:
 * 1. Try Bible Brain audio API
 * 2. Fallback to browser TTS
 */
export async function getScriptureAudioUrl(book, chapter, verse, language = 'en') {
  try {
    // Try Bible Brain audio
    const audioUrl = await getBibleBrainAudio(book, chapter, verse, language);
    if (audioUrl) {
      return { url: audioUrl, type: 'bible-brain', useControls: true };
    }
  } catch (err) {
    console.warn('Bible Brain audio unavailable:', err.message);
  }

  // Fallback to TTS
  return { type: 'tts', useControls: false };
}

/**
 * Fetch Bible Brain audio via backend function
 */
async function getBibleBrainAudio(book, chapter, verse, language) {
  try {
    const response = await base44.functions.invoke('bibleBrainAudio', {
      book,
      chapter,
      verse,
      language
    });
    return response.data?.audioUrl || null;
  } catch {
    return null;
  }
}

/**
 * Generate TTS audio blob from text
 */
export async function generateTTSAudio(text, language = 'en') {
  if (!window.speechSynthesis) {
    throw new Error('Text-to-speech not supported');
  }

  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language codes to speech synthesis language
    const langMap = {
      'en': 'en-US',
      'om': 'en-US', // Fallback
      'am': 'am-ET',
      'fr': 'fr-FR',
      'sw': 'sw-KE',
      'ar': 'ar-SA',
      'ti': 'ti-ER'
    };
    
    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(`TTS error: ${e.error}`));
    
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Get formatted passage text for audio
 */
export function formatPassageText(book, chapter, verseStart, verseEnd, verseText) {
  const verseRange = verseStart === verseEnd ? verseStart : `${verseStart}-${verseEnd}`;
  return `${book} ${chapter}:${verseRange}. ${verseText}`;
}