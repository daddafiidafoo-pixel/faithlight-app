import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Globe, Languages, Heart, RefreshCw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const TABS = [
  { id: 'cross', label: 'Cross-References', icon: BookOpen },
  { id: 'context', label: 'Historical Context', icon: Globe },
  { id: 'words', label: 'Greek/Hebrew', icon: Languages },
  { id: 'reflect', label: 'Reflection', icon: Heart },
];

export default function DeepVerseAnalysis({ book, chapter, verse, verseText, isDarkMode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('cross');

  const bg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';

  const analyze = async () => {
    if (data) { setOpen(true); return; }
    setOpen(true);
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical scholar with expertise in Hebrew, Greek, history, and theology.

Analyze this Bible verse deeply:
VERSE: ${book} ${chapter}:${verse}
TEXT: "${verseText}"

Provide a comprehensive JSON analysis with:
1. cross_references: 4 cross-references from other parts of the Bible that echo this verse's theme. Each has: reference (e.g. "Romans 8:28"), text (a short excerpt), connection (1 sentence explaining why it relates).
2. historical_context: 3-4 sentences about the historical, cultural, and geographical setting of this verse. Who wrote it, to whom, what was happening politically/socially.
3. word_studies: 3 key words from this verse. For each: word (English), original (Hebrew/Greek), transliteration (e.g. agape), meaning (the deeper meaning), usage (how the word is used elsewhere).
4. reflection_questions: 3 thought-provoking personal reflection questions to help the reader apply this verse to their life and spiritual journey.`,
        response_json_schema: {
          type: 'object',
          properties: {
            cross_references: {
              type: 'array', items: {
                type: 'object',
                properties: { reference: { type: 'string' }, text: { type: 'string' }, connection: { type: 'string' } }
              }
            },
            historical_context: { type: 'string' },
            word_studies: {
              type: 'array', items: {
                type: 'object',
                properties: { word: { type: 'string' }, original: { type: 'string' }, transliteration: { type: 'string' }, meaning: { type: 'string' }, usage: { type: 'string' } }
              }
            },
            reflection_questions: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button onClick={open ? () => setOpen(false) : analyze}
        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border transition-all font-medium ${
          isDarkMode ? 'border-indigo-500 text-indigo-300 hover:bg-indigo-900/30' : 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'
        }`}>
        <Sparkles className="w-3 h-3" />
        Deep Analysis
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className={`mt-2 rounded-2xl border shadow-lg overflow-hidden ${bg}`}>
          {/* Tab bar */}
          <div className={`flex overflow-x-auto border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : `border-transparent ${muted} hover:text-gray-700`
                  }`}>
                  <Icon className="w-3 h-3" /> {tab.label}
                </button>
              );
            })}
            {data && (
              <button onClick={() => { setData(null); analyze(); }}
                className={`ml-auto px-3 py-2 ${muted} hover:text-gray-600`} title="Regenerate">
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex items-center gap-2 justify-center py-10 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing {book} {chapter}:{verse}...
              </div>
            ) : data ? (
              <>
                {/* Cross-References */}
                {activeTab === 'cross' && (
                  <div className="space-y-3">
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${muted}`}>Cross-References</p>
                    {data.cross_references?.map((ref, i) => (
                      <div key={i} className={`rounded-xl p-3 ${cardBg}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-indigo-100 text-indigo-800 border-0 text-xs">{ref.reference}</Badge>
                        </div>
                        <p className={`text-sm italic mb-1.5 ${muted}`}>"{ref.text}"</p>
                        <p className={`text-xs ${text}`}>{ref.connection}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Historical Context */}
                {activeTab === 'context' && (
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${muted}`}>Historical & Cultural Context</p>
                    <div className={`rounded-xl p-4 ${cardBg}`}>
                      <p className={`text-sm leading-relaxed ${text}`}>{data.historical_context}</p>
                    </div>
                  </div>
                )}

                {/* Greek/Hebrew Word Studies */}
                {activeTab === 'words' && (
                  <div className="space-y-3">
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${muted}`}>Key Word Studies</p>
                    {data.word_studies?.map((w, i) => (
                      <div key={i} className={`rounded-xl p-3 ${cardBg}`}>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`font-bold text-sm ${text}`}>"{w.word}"</span>
                          <span className="text-lg font-bold text-indigo-600">{w.original}</span>
                          <Badge variant="outline" className="text-xs font-mono">{w.transliteration}</Badge>
                        </div>
                        <p className={`text-sm font-medium mb-1 ${text}`}>{w.meaning}</p>
                        <p className={`text-xs ${muted}`}>{w.usage}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reflection Questions */}
                {activeTab === 'reflect' && (
                  <div className="space-y-3">
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${muted}`}>Personal Reflection</p>
                    {data.reflection_questions?.map((q, i) => (
                      <div key={i} className={`flex gap-3 rounded-xl p-3 ${cardBg}`}>
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className={`text-sm leading-relaxed ${text}`}>{q}</p>
                      </div>
                    ))}
                    <div className="mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-700 italic">
                      Take a moment to sit quietly with one of these questions. Let God speak to you through His Word.
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className={`text-sm text-center py-6 ${muted}`}>No analysis available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}