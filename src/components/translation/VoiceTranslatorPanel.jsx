import React, { useMemo, useState } from "react";
import { useVoiceTranslation } from "../../hooks/useVoiceTranslation";

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "sw", label: "Kiswahili" },
  { code: "ti", label: "ትግርኛ" },
  { code: "am", label: "አማርኛ" },
  { code: "om", label: "Afaan Oromoo" },
];

export default function VoiceTranslatorPanel() {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [autoSpeak, setAutoSpeak] = useState(true);

  const {
    supported,
    isListening,
    isTranslating,
    interimText,
    originalText,
    translatedText,
    error,
    startListening,
    stopListening,
    reset,
    stopSpeaking,
  } = useVoiceTranslation({ sourceLanguage, targetLanguage, autoSpeak });

  const canStart = useMemo(() => supported && !isListening && !isTranslating, [supported, isListening, isTranslating]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Voice Translation</h2>
        <p className="text-sm text-gray-600">Speak in one language and hear the translation in another.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">From</span>
          <select className="rounded-xl border px-3 py-2" value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
            {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">To</span>
          <select className="rounded-xl border px-3 py-2" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
            {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
          </select>
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
        Auto-play translated voice
      </label>

      {!supported && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          This browser does not support live speech recognition. Try Chrome or Edge.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50" onClick={startListening} disabled={!canStart}>
          {isListening ? "Listening..." : isTranslating ? "Translating..." : "Start Voice"}
        </button>
        <button type="button" className="rounded-xl border px-4 py-2" onClick={stopListening} disabled={!isListening}>Stop</button>
        <button type="button" className="rounded-xl border px-4 py-2" onClick={stopSpeaking}>Stop Audio</button>
        <button type="button" className="rounded-xl border px-4 py-2" onClick={reset}>Reset</button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 text-sm font-semibold">Original Speech</div>
          <p className="min-h-[80px] text-sm text-gray-800">{originalText || interimText || "Your speech will appear here."}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-4">
          <div className="mb-2 text-sm font-semibold">Translated Output</div>
          <p className="min-h-[80px] text-sm text-gray-800">{translatedText || "Translation will appear here."}</p>
        </div>
      </div>
    </div>
  );
}