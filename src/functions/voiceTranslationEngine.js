const recognitionLanguageMap = {
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-SA",
  sw: "sw-KE",
  ti: "ti-ER",
  am: "am-ET",
  om: "om-ET",
};

const ttsLanguageMap = {
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-SA",
  sw: "sw-KE",
  ti: "ti-ER",
  am: "am-ET",
  om: "om-ET",
};

export function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported() {
  return !!getSpeechRecognition();
}

export function isTextToSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function mapLanguageCode(code) {
  return recognitionLanguageMap[code] || code || "en-US";
}

export function mapTTSLanguageCode(code) {
  return ttsLanguageMap[code] || code || "en-US";
}

export function createSpeechRecognizer({ language = "en", continuous = false, interimResults = true, onStart, onResult, onError, onEnd }) {
  const SpeechRecognition = getSpeechRecognition();
  if (!SpeechRecognition) {
    throw new Error("Speech recognition is not supported in this browser.");
  }

  const recognition = new SpeechRecognition();
  recognition.lang = mapLanguageCode(language);
  recognition.continuous = continuous;
  recognition.interimResults = interimResults;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => onStart?.();
  recognition.onerror = (event) => onError?.(event);
  recognition.onend = () => onEnd?.();
  recognition.onresult = (event) => {
    let interimTranscript = "";
    let finalTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0]?.transcript || "";
      if (event.results[i].isFinal) finalTranscript += transcript;
      else interimTranscript += transcript;
    }
    onResult?.({ interimTranscript: interimTranscript.trim(), finalTranscript: finalTranscript.trim() });
  };

  return recognition;
}

export async function translateText({ text, sourceLanguage = "auto", targetLanguage = "en" }) {
  if (!text?.trim()) {
    return { translatedText: "", detectedSourceLanguage: sourceLanguage, provider: "none" };
  }

  const endpoint = import.meta.env.VITE_TRANSLATION_API_URL;
  const apiKey = import.meta.env.VITE_TRANSLATION_API_KEY;

  if (!endpoint) {
    return { translatedText: text, detectedSourceLanguage: sourceLanguage, provider: "fallback-no-api" };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({ text, sourceLanguage, targetLanguage }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Translation failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return {
    translatedText: data.translatedText || data.translation || text,
    detectedSourceLanguage: data.detectedSourceLanguage || sourceLanguage,
    provider: data.provider || "custom-api",
  };
}

export function speakText({ text, language = "en", rate = 1, pitch = 1, volume = 1, voiceName, onStart, onEnd, onError }) {
  if (!isTextToSpeechSupported()) {
    throw new Error("Text-to-speech is not supported in this browser.");
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = mapTTSLanguageCode(language);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  const voices = window.speechSynthesis.getVoices?.() || [];
  if (voiceName) {
    const selectedVoice = voices.find((voice) => voice.name === voiceName);
    if (selectedVoice) utterance.voice = selectedVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (event) => onError?.(event);

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export async function translateVoiceText({ recognizedText, sourceLanguage = "auto", targetLanguage = "en", shouldSpeak = true, ttsRate = 1, ttsPitch = 1, ttsVolume = 1, voiceName }) {
  const translation = await translateText({ text: recognizedText, sourceLanguage, targetLanguage });

  if (shouldSpeak && translation.translatedText) {
    speakText({ text: translation.translatedText, language: targetLanguage, rate: ttsRate, pitch: ttsPitch, volume: ttsVolume, voiceName });
  }

  return {
    originalText: recognizedText,
    translatedText: translation.translatedText,
    detectedSourceLanguage: translation.detectedSourceLanguage,
    provider: translation.provider,
  };
}

export async function createVoiceRequest(audioBlob, targetLang) {
  console.log("Voice request placeholder — connect a backend endpoint to enable server-side transcription.");
  return { success: true, text: "", language: targetLang };
}

export async function transcribeAudioBlob() {
  throw new Error("Audio blob transcription is not wired yet. Use live browser speech recognition or connect your own server endpoint.");
}