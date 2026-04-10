import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, Sparkles, BookOpen } from 'lucide-react';

/**
 * Slide-up panel that shows an AI explanation for a selected Bible verse.
 * Props:
 *   verse  – { verse_text, reference_text }
 *   lang   – UI language code
 *   onClose – callback to dismiss
 */
export default function VerseExplainPanel({ verse, lang, onClose }) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!verse) return;
    setLoading(true);
    setError('');
    setExplanation('');

    const langNames = { en: 'English', om: 'Afaan Oromoo', am: 'Amharic', sw: 'Swahili', ti: 'Tigrinya', ar: 'Arabic', fr: 'French' };
    const langName = langNames[lang] || 'English';

    base44.integrations.Core.InvokeLLM({
      prompt: `You are a helpful Bible teacher. Explain the following Bible verse in simple, clear language that anyone can understand. Keep the explanation to 3-5 sentences. Focus on the meaning, context, and practical application. Write your response in ${langName}.

Verse: ${verse.reference_text}
"${verse.verse_text}"

Provide a warm, accessible explanation:`,
    })
      .then(result => {
        setExplanation(typeof result === 'string' ? result : result?.text || result?.explanation || String(result));
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load explanation. Please try again.');
        setLoading(false);
      });
  }, [verse, lang]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white max-w-2xl mx-auto"
        style={{ borderRadius: '24px 24px 0 0', maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ backgroundColor: '#E5E7EB' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#F3F4F6' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EDE9FE' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>AI Explanation</p>
              <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>{verse.reference_text}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <X className="w-4 h-4" style={{ color: '#6B7280' }} />
          </button>
        </div>

        {/* Verse text */}
        <div className="px-5 py-3" style={{ backgroundColor: '#F8F6F1', borderBottom: '1px solid #E5E7EB' }}>
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#A78BFA' }} />
            <p className="text-sm leading-relaxed italic" style={{ color: '#374151' }}>
              "{verse.verse_text}"
            </p>
          </div>
        </div>

        {/* Explanation body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5CF6' }} />
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Generating explanation…</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-6">
              <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
              <button
                onClick={() => { setLoading(true); setError(''); }}
                className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && explanation && (
            <p className="text-base leading-8" style={{ color: '#1F2937' }}>
              {explanation}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-8 pt-2">
          <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
            AI-generated · Always read in full Biblical context
          </p>
        </div>
      </div>
    </div>
  );
}