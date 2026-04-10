import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

export default function SpiritualVerseReflection({ verse, focusAreas }) {
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);

  const cacheKey = `sv_reflection_${verse?.reference}_${focusAreas?.join('_')}`;

  const generate = async () => {
    if (!verse || !focusAreas?.length) return;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setReflection(cached); return; }

    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `The Bible verse is: "${verse.text_en || verse.verseText}" (${verse.reference}).
The user's spiritual focus areas are: ${focusAreas.join(', ')}.
Write a warm, personal 2-sentence reflection that connects this verse specifically to their focus areas.
Be encouraging, practical, and grounded in scripture. Do NOT use generic language.`,
      });
      const text = typeof res === 'string' ? res : res?.reflection || res?.text || '';
      sessionStorage.setItem(cacheKey, text);
      setReflection(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generate(); }, [verse?.reference, focusAreas?.join(',')]);

  if (!focusAreas?.length || !verse) return null;

  return (
    <div className="mt-3 pt-3 border-t border-indigo-100">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Tailored to your focus: {focusAreas.slice(0, 2).join(', ')}
          {focusAreas.length > 2 && ` +${focusAreas.length - 2}`}
        </span>
        <button
          onClick={() => { sessionStorage.removeItem(cacheKey); generate(); }}
          className="text-indigo-400 hover:text-indigo-600 transition-colors"
          title="Refresh reflection"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" /> Generating your reflection…
        </div>
      ) : reflection ? (
        <p className="text-sm text-gray-700 leading-relaxed italic">{reflection}</p>
      ) : null}
    </div>
  );
}