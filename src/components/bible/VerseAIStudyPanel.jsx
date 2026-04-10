import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Globe, Heart, Loader2, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MODES = [
  { id: 'explain', label: 'Simple Explanation', icon: BookOpen, prompt: 'Explain this verse in simple, clear language that anyone can understand. Keep it encouraging and personal.' },
  { id: 'historical', label: 'Historical Context', icon: Globe, prompt: 'Explain the historical and cultural context of this verse. When was it written, to whom, and what was happening at the time?' },
  { id: 'devotional', label: 'Personal Devotion', icon: Heart, prompt: 'Give a short personal devotional reflection on this verse. Make it heartfelt, spiritually uplifting, and practical for daily life.' },
];

export default function VerseAIStudyPanel({ verse, lang, onClose }) {
  const [mode, setMode] = useState(MODES[0]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);
  const [customQ, setCustomQ] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const ask = async (promptOverride) => {
    setLoading(true);
    setResult('');
    setAsked(true);
    const prompt = promptOverride || mode.prompt;
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Bible verse: "${verse.reference_text}"\n"${verse.verse_text}"\n\n${prompt}\n\nRespond in a warm, reverent tone suitable for a Bible app. Keep it under 200 words.`,
      });
      setResult(typeof res === 'string' ? res : JSON.stringify(res));
    } catch {
      setResult('Unable to load response. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const handleCustomAsk = () => {
    if (!customQ.trim()) return;
    ask(customQ.trim());
    setShowCustom(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
      <div className="w-full bg-white pb-safe flex flex-col" style={{ borderRadius: '24px 24px 0 0', maxHeight: '88vh' }}>
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">AI Study Assistant</p>
              <p className="text-xs text-violet-600 font-medium">{verse.reference_text}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Verse preview */}
          <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100">
            <p className="text-sm leading-7 text-gray-800 italic">"{verse.verse_text}"</p>
          </div>

          {/* Mode selector */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Choose a study lens</p>
            <div className="flex flex-col gap-2">
              {MODES.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => { setMode(m); setAsked(false); setResult(''); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all"
                    style={{
                      backgroundColor: mode.id === m.id ? '#EDE9FE' : '#F9FAFB',
                      borderColor: mode.id === m.id ? '#A78BFA' : '#E5E7EB',
                    }}>
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: mode.id === m.id ? '#7C3AED' : '#9CA3AF' }} />
                    <span className="text-sm font-semibold" style={{ color: mode.id === m.id ? '#5B21B6' : '#374151' }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom question */}
          <div>
            <button onClick={() => setShowCustom(v => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-violet-600">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
              Ask your own question
            </button>
            {showCustom && (
              <div className="mt-2 flex gap-2">
                <input
                  value={customQ}
                  onChange={e => setCustomQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCustomAsk()}
                  placeholder="e.g. What does this mean for my marriage?"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-400"
                />
                <button onClick={handleCustomAsk}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold">
                  Ask
                </button>
              </div>
            )}
          </div>

          {/* Ask button */}
          {!loading && !asked && (
            <button onClick={() => ask()}
              className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: '#7C3AED' }}>
              <Sparkles className="w-4 h-4" />
              {mode.label}
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
              <p className="text-sm text-gray-500">Studying the scripture...</p>
            </div>
          )}

          {result && !loading && (
            <div className="p-4 rounded-2xl bg-white border border-violet-100 shadow-sm">
              <p className="text-sm leading-7 text-gray-800">{result}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => ask()}
                  className="text-xs px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 font-semibold">
                  Ask Again
                </button>
                <button onClick={() => { setMode(MODES[(MODES.findIndex(m => m.id === mode.id) + 1) % MODES.length]); setAsked(false); setResult(''); }}
                  className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 font-semibold">
                  Try Another Lens
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}