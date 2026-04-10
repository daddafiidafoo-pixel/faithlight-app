import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Volume2, VolumeX, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerseReflectionAudio({ book, chapter, verses = [], onClose }) {
  const [reflection, setReflection] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // Auto-generate on mount if verses available
  useEffect(() => {
    if (verses.length > 0 && !reflection) generateReflection();
    return () => synthRef.current?.cancel();
  }, []);

  const generateReflection = async () => {
    setGenerating(true);
    setSpeaking(false);
    synthRef.current?.cancel();

    const sampleText = verses.slice(0, 10).map(v => `${v.verse}. ${v.text}`).join(' ');
    const prompt = `You are a warm, pastoral devotional speaker. Based on ${book} chapter ${chapter}, write a concise 1-minute spoken reflection (around 130 words).

Chapter context: "${sampleText.slice(0, 600)}..."

Structure:
1. One sentence naming the theological core of this chapter
2. Two sentences unpacking its meaning for daily life
3. One clear, specific, actionable challenge for today

Tone: conversational, encouraging, scripture-rooted. No headers. No lists. Just flowing spoken prose. End with a short blessing sentence.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setReflection(result);
    } catch {
      setReflection(`${book} ${chapter} reminds us of God's faithfulness in every season of life. His Word is not merely historical record, but living truth that speaks directly into our present circumstances. Take a moment today to ask: where do I need to trust God's Word over my own understanding? Your challenge: choose one verse from this chapter and write it on a card to carry with you today. May God's truth shape every step you take. Amen.`);
    }
    setGenerating(false);
  };

  const handleSpeak = () => {
    if (!reflection || !synthRef.current) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(reflection);
    utt.rate = 0.88;
    utt.pitch = 1.05;
    utt.volume = 1;
    // Prefer a warm English voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel') || v.name.includes('Google')));
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    synthRef.current.speak(utt);
  };

  const handleStop = () => { synthRef.current?.cancel(); setSpeaking(false); };

  return (
    <div className="rounded-2xl overflow-hidden border border-indigo-100 shadow-sm" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4C1D95 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-white font-bold text-sm">1-Min Reflection</span>
          <span className="text-indigo-300 text-xs">· {book} {chapter}</span>
        </div>
        <div className="flex items-center gap-1">
          {reflection && !generating && (
            <button onClick={handleSpeak} disabled={speaking} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${speaking ? 'bg-red-500 text-white' : 'bg-amber-400 hover:bg-amber-500 text-gray-900'}`}
              onClick={speaking ? handleStop : handleSpeak}>
              {speaking ? <><VolumeX className="w-3.5 h-3.5" /> Stop</> : <><Volume2 className="w-3.5 h-3.5" /> Listen</>}
            </button>
          )}
          <button onClick={() => setExpanded(v => !v)} className="text-white/60 hover:text-white p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Speaking wave */}
      {speaking && (
        <div className="flex items-end gap-0.5 justify-center py-2">
          {[3, 5, 8, 5, 9, 4, 7, 6, 4, 8, 5, 3, 7, 5, 4].map((h, i) => (
            <div key={i} className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-4">
        {generating ? (
          <div className="flex items-center gap-2 py-3">
            <Loader2 className="w-4 h-4 text-indigo-300 animate-spin" />
            <span className="text-indigo-200 text-sm">Generating your reflection…</span>
          </div>
        ) : reflection ? (
          <>
            <p className={`text-white/90 text-sm leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>{reflection}</p>
            {!expanded && (
              <button onClick={() => setExpanded(true)} className="text-amber-300 text-xs mt-1 hover:text-amber-200">Read more…</button>
            )}
          </>
        ) : (
          <p className="text-indigo-300 text-sm py-2">No reflection yet.</p>
        )}

        {/* Challenge callout */}
        {reflection && expanded && (
          <div className="mt-3 bg-amber-400/20 border border-amber-400/30 rounded-xl p-3">
            <p className="text-amber-200 text-xs font-bold uppercase tracking-wide mb-1">⚡ Today's Challenge</p>
            <p className="text-amber-100 text-xs leading-relaxed">
              {reflection.split(/challenge|today|apply/i)[1]?.split('.')[0]?.trim() || 'Reflect on one verse from this chapter and write down how it applies to your life today.'}
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button onClick={generateReflection} disabled={generating}
            className="flex items-center gap-1 text-indigo-300 hover:text-white text-xs transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}