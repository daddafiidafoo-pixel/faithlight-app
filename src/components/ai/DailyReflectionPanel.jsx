import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw, BookOpen, Heart, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DailyReflectionPanel({ journalEntries = [], highlights = [], onGenerate }) {
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState(null);

  const canGenerate = journalEntries.length > 0 || highlights.length > 0;

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const journalSummary = journalEntries.slice(0, 10).map(e =>
        `[${e.category || 'other'}] ${e.title}: ${e.content?.substring(0, 200) || ''}${e.isAnswered ? ' (Answered ✓)' : ''}`
      ).join('\n');

      const highlightSummary = highlights.slice(0, 10).map(h =>
        `"${h.textSnippet}" — ${h.verseReference}`
      ).join('\n');

      const prompt = `You are a compassionate Christian spiritual director. Based on the following data from a believer's personal spiritual life, generate a warm, personalized "Daily Reflection" — a devotional insight that speaks to their spiritual journey.

${journalEntries.length > 0 ? `PRAYER JOURNAL ENTRIES (recent):\n${journalSummary}\n` : ''}
${highlights.length > 0 ? `HIGHLIGHTED BIBLE VERSES (saved):\n${highlightSummary}\n` : ''}

Generate a JSON response with:
1. "greeting": A short, warm personal opener (1 sentence, e.g. "Your heart has been seeking...")
2. "theme": The key spiritual theme you see emerging (2-4 words, e.g. "Trust & Surrender")
3. "insight": A 2-3 paragraph devotional insight connecting their prayers and highlighted verses to a meaningful spiritual truth. Be encouraging, personal, biblically grounded. Use markdown formatting.
4. "scriptureHighlight": One specific Bible verse reference from their highlights (or suggest one) that speaks directly to their journey.
5. "prayerPrompt": A 1-2 sentence prayer prompt based on their journal themes.
6. "growthSteps": Array of 2-3 short practical spiritual growth action items.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            greeting: { type: 'string' },
            theme: { type: 'string' },
            insight: { type: 'string' },
            scriptureHighlight: { type: 'string' },
            prayerPrompt: { type: 'string' },
            growthSteps: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      setReflection(res);
      setExpanded(true);
      if (onGenerate) onGenerate(res);
    } catch (e) {
      setError('Could not generate reflection. Please try again.');
    }
    setLoading(false);
  };

  if (!canGenerate) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5 text-center">
        <Sparkles className="w-8 h-8 text-violet-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-violet-700 mb-1">AI Daily Reflection</p>
        <p className="text-xs text-gray-500">Add some prayer journal entries or highlight Bible verses to unlock your personalized reflection.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-900">AI Daily Reflection</p>
            {reflection?.theme && (
              <p className="text-xs text-violet-500 font-medium">Theme: {reflection.theme}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {reflection && (
            <button onClick={() => setExpanded(v => !v)} className="p-1.5 rounded-lg hover:bg-violet-100 text-violet-400">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {reflection ? 'Refresh' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="px-4 pb-4 text-center">
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            <p className="text-sm text-violet-600 font-medium">Crafting your reflection…</p>
          </div>
          <p className="text-xs text-gray-400">Analyzing your prayers & highlights</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-4 pb-4">
          <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        </div>
      )}

      {/* Reflection content */}
      {reflection && !loading && expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Greeting */}
          {reflection.greeting && (
            <p className="text-sm text-violet-700 italic font-medium leading-relaxed">
              ✦ {reflection.greeting}
            </p>
          )}

          {/* Insight */}
          {reflection.insight && (
            <div className="bg-white/70 rounded-xl p-4 border border-violet-100">
              <ReactMarkdown className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-strong:text-violet-800">
                {reflection.insight}
              </ReactMarkdown>
            </div>
          )}

          {/* Scripture highlight */}
          {reflection.scriptureHighlight && (
            <div className="flex items-center gap-3 bg-white/60 rounded-xl px-4 py-3 border border-indigo-100">
              <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">Key Scripture</p>
                <p className="text-sm font-semibold text-indigo-800">{reflection.scriptureHighlight}</p>
              </div>
            </div>
          )}

          {/* Prayer prompt */}
          {reflection.prayerPrompt && (
            <div className="flex items-start gap-3 bg-rose-50/60 rounded-xl px-4 py-3 border border-rose-100">
              <Heart className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-rose-400 font-semibold uppercase tracking-wide mb-0.5">Prayer Prompt</p>
                <p className="text-sm text-rose-700 italic leading-relaxed">{reflection.prayerPrompt}</p>
              </div>
            </div>
          )}

          {/* Growth steps */}
          {reflection.growthSteps?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Growth Steps</p>
              {reflection.growthSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center pt-1">
            Based on {journalEntries.length} prayer{journalEntries.length !== 1 ? 's' : ''} · {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Collapsed hint */}
      {reflection && !loading && !expanded && (
        <div className="px-4 pb-3">
          <p className="text-xs text-violet-500 italic truncate">"{reflection.greeting}"</p>
        </div>
      )}
    </div>
  );
}