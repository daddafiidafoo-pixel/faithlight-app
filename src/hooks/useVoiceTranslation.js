import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  stopSpeaking,
  translateVoiceText,
} from "../functions/voiceTranslationEngine";

export function useVoiceTranslation({ sourceLanguage = "en", targetLanguage = "fr", autoSpeak = true }) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [error, setError] = useState("");
  const [detectedSourceLanguage, setDetectedSourceLanguage] = useState(sourceLanguage);
  const supported = isSpeechRecognitionSupported();

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!supported) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    setError("");
    setInterimText("");

    const recognition = createSpeechRecognizer({
      language: sourceLanguage,
      continuous: false,
      interimResults: true,
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onError: (event) => {
        setError(event?.error || "Unknown speech recognition error");
        setIsListening(false);
      },
      onResult: async ({ interimTranscript, finalTranscript }) => {
        setInterimText(interimTranscript || "");
        if (!finalTranscript) return;

        setOriginalText(finalTranscript);
        setIsTranslating(true);
        setError("");

        try {
          const result = await translateVoiceText({
            recognizedText: finalTranscript,
            sourceLanguage,
            targetLanguage,
            shouldSpeak: autoSpeak,
          });
          setTranslatedText(result.translatedText || "");
          setDetectedSourceLanguage(result.detectedSourceLanguage || sourceLanguage);
        } catch (err) {
          setError(err?.message || "Translation failed.");
        } finally {
          setIsTranslating(false);
        }
      },
    });

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported, sourceLanguage, targetLanguage, autoSpeak]);

  const reset = useCallback(() => {
    setInterimText("");
    setOriginalText("");
    setTranslatedText("");
    setError("");
    setDetectedSourceLanguage(sourceLanguage);
    stopSpeaking();
  }, [sourceLanguage]);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
      stopSpeaking();
    };
  }, []);

  return {
    supported,
    isListening,
    isTranslating,
    interimText,
    originalText,
    translatedText,
    detectedSourceLanguage,
    error,
    startListening,
    stopListening,
    reset,
    stopSpeaking,
  };
}