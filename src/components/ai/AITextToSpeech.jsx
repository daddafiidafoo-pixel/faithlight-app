import React, { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX, Loader2, Square } from "lucide-react";

// Map app language codes to BCP-47 codes for SpeechSynthesis
const LANG_VOICE_MAP = {
  en: "en-US",
  om: "om",      // Oromo — may fall back to device default
  am: "am-ET",   // Amharic
  ar: "ar-SA",
  sw: "sw-KE",
  fr: "fr-FR",
  ti: "ti-ET",
};

export default function AITextToSpeech({ text, language = "en", label = "Listen" }) {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const utteranceRef = useRef(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setLoading(false);
  }, []);

  const speak = useCallback(() => {
    if (!text || !window.speechSynthesis) return;
    stop();

    setLoading(true);

    const langCode = LANG_VOICE_MAP[language] || "en-US";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(langCode.split("-")[0]));
    if (match) utterance.voice = match;

    utterance.onstart = () => { setLoading(false); setSpeaking(true); };
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => { setSpeaking(false); setLoading(false); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    // Fallback if onstart never fires
    setTimeout(() => setLoading(false), 600);
  }, [text, language, stop]);

  if (!text || !window.speechSynthesis) return null;

  if (speaking) {
    return (
      <button
        onClick={stop}
        className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-indigo-50 border border-indigo-200 text-sm font-semibold text-indigo-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
        title="Stop listening"
      >
        <Square size={14} />
        Stop
      </button>
    );
  }

  return (
    <button
      onClick={speak}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-all disabled:opacity-40"
      title="Listen to this text"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Volume2 size={14} />
      )}
      {label}
    </button>
  );
}