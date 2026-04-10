/**
 * EmotionalVerseSearch
 * "I feel anxious" → AI maps emotion → themes → verses + suggested prayer
 */
import React, { useState, useRef } from 'react';
import { Heart, Search, Sparkles, BookOpen, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { detectEmotion, EMOTION_MAP, searchBible, detectTheme, THEME_KEYWORDS } from './bibleSearchEngine';
import { useDownloadedTranslations } from '@/components/offline/useBibleOffline';
import { base44 } from '@/api/base44Client';
import { debounce } from 'lodash';

// Quick-pick emotions shown on the home screen
const QUICK_EMOTIONS = [
  { key: 'anxiety',      label: 'Anxious',       emoji: '😟' },
  { key: 'fear',         label: 'Afraid',        emoji: '😨' },
  { key: 'sad',          label: 'Sad',           emoji: '😢' },
  { key: 'lonely',       label: 'Lonely',        emoji: '😔' },
  { key: 'discouraged',  label: 'Discouraged',   emoji: '😞' },
  { key: 'angry',        label: 'Angry',         emoji: '😠' },
  { key: 'doubt',        label: 'Doubting',      emoji: '🤔' },
  { key: 'stressed',     label: 'Stressed',      emoji: '😫' },
  { key: 'grateful',     label: 'Grateful',      emoji: '🙏' },
  { key: 'healing',      label: 'Need Healing',  emoji: '🤒' },
];

export default function EmotionalVerseSearch() {
  const { translations } = useDownloadedTranslations();
  const language = translations[0]?.languageCode || 'en';

  const [input, setInput] = useState('');
  const [detected, setDetected] = useState(null); // { emotion, meta }
  const [verses, setVerses] = useState([]);
  const [aiReflection, setAiReflection] = useState('');
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showPrayer, setShowPrayer] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  async function runEmotionalSearch(query, emotionResult) {
    setLoadingVerses(true);
    setVerses([]);
    setAiReflection('');
    setShowPrayer(false);

    const { meta } = emotionResult;
    const allVerses = [];

    // Search by each mapped theme
    for (const theme of meta.themes) {
      const themeWords = THEME_KEYWORDS[theme] || [theme];
      for (const word of themeWords.slice(0, 2)) {
        const res = await searchBible(language, word, { limit: 15 });
        allVerses.push(...res.results);
      }
    }

    // Deduplicate + limit
    const seen = new Set();
    const unique = allVerses.filter(v => {
      if (seen.has(v.id)) return false;
      seen.add(v.id); return true;
    }).slice(0, 12);

    setVerses(unique);
    setLoadingVerses(false);

    // RAG: pass retrieved verses as context — AI must only explain these verses
    if (unique.length > 0) {
      setLoadingAI(true);
      try {
        const verseContext = unique.slice(0, 5)
          .map(v => `- ${v.reference || `${v.bookCode} ${v.chapter}:${v.verse}`}: "${v.text}"`)
          .join('\n');

        const ragPrompt =
`You are a Christian Bible companion. Your role is to explain Scripture — nothing else.

RULES:
- Only use the Bible verses provided below as your source.
- Do NOT invent theology, add verses not listed, or give medical/political/financial advice.
- If the question is unrelated to faith or Scripture, respond: "I'm here to help with Scripture and faith questions."
- If you are uncertain, say so honestly rather than guessing.

Scripture context (retrieved for: "${emotionResult.meta.label}"):
${verseContext}

A person shared: "${query}"

Respond with exactly this structure:
1. Scripture Explanation (2–3 sentences grounded only in the verses above)
2. Key Lesson (one sentence)
3. Short Prayer (one sentence addressed to God)`;

        const reflection = await base44.integrations.Core.InvokeLLM({ prompt: ragPrompt });
        setAiReflection(reflection);
      } catch {
        setAiReflection('');
      } finally {
        setLoadingAI(false);
      }
    }
  }

  const handleInput = (val) => {
    setInput(val);
    if (!val.trim()) { setDetected(null); setVerses([]); setAiReflection(''); return; }

    const emotionResult = detectEmotion(val);
    if (emotionResult) {
      setDetected(emotionResult);
      runEmotionalSearch(val, emotionResult);
    } else {
      setDetected(null);
    }
  };

  const handleQuickEmotion = (key) => {
    const meta = EMOTION_MAP[key];
    if (!meta) return;
    const label = `I feel ${meta.label.toLowerCase()}`;
    setInput(label);
    const result = { emotion: key, meta };
    setDetected(result);
    runEmotionalSearch(label, result);
  };

  const copyPrayer = () => {
    navigator.clipboard.writeText(detected?.meta?.prayer || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasDownloaded = translations.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-28">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-purple-500" />
          <h1 className="text-lg font-bold text-gray-800">How are you feeling?</h1>
        </div>
        <p className="text-sm text-gray-500">Share what's on your heart and find comfort in Scripture</p>
      </div>

      {/* Input */}
      <div className="px-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            value={input}
            onChange={e => handleInput(e.target.value)}
            placeholder="I feel anxious… I'm afraid… I need hope…"
            className="w-full pl-9 pr-4 py-3 rounded-2xl border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
          />
        </div>
      </div>

      {/* Quick emotion chips */}
      {!detected && (
        <div className="px-4 mb-6">
          <p className="text-xs text-gray-400 font-medium mb-3">Or tap how you feel right now</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_EMOTIONS.map(e => (
              <button key={e.key} onClick={() => handleQuickEmotion(e.key)}
                className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-purple-300 hover:bg-purple-50 transition text-left">
                <span className="text-lg">{e.emoji}</span>
                <span className="text-sm text-gray-700">{e.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No offline data warning */}
      {!hasDownloaded && detected && (
        <div className="mx-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 mb-4">
          Download a Bible in <strong>My Bible</strong> to enable offline verse search.
        </div>
      )}

      {/* Emotion detected badge */}
      {detected && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 bg-purple-100 rounded-xl px-4 py-2.5">
            <span className="text-xl">{detected.meta.emoji}</span>
            <div>
              <p className="text-xs text-purple-500 font-medium">Feeling detected</p>
              <p className="text-sm font-semibold text-purple-800">{detected.meta.label}</p>
            </div>
            <div className="ml-auto flex gap-1">
              {detected.meta.themes.map(t => (
                <span key={t} className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Reflection */}
      {(loadingAI || aiReflection) && (
        <div className="mx-4 mb-4 bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-purple-600">AI Reflection</span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Scripture-grounded</span>
          </div>
          {loadingAI ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
              Preparing reflection…
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">{aiReflection}</p>
          )}
        </div>
      )}

      {/* Loading verses */}
      {loadingVerses && (
        <div className="flex items-center gap-2 px-4 text-sm text-purple-500">
          <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          Finding scriptures…
        </div>
      )}

      {/* Verses */}
      {!loadingVerses && verses.length > 0 && (
        <div className="px-4 space-y-2">
          <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Verses for {detected?.meta?.label}
          </p>
          {verses.map((v, i) => (
            <VerseCard key={v.id || i} verse={v} />
          ))}
        </div>
      )}

      {/* Suggested Prayer */}
      {detected && verses.length > 0 && !loadingVerses && (
        <div className="mx-4 mt-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-4 text-white shadow-md">
          <button className="w-full flex items-center justify-between"
            onClick={() => setShowPrayer(p => !p)}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🙏</span>
              <span className="text-sm font-semibold">Suggested Prayer</span>
            </div>
            {showPrayer ? <ChevronUp className="w-4 h-4 opacity-70" /> : <ChevronDown className="w-4 h-4 opacity-70" />}
          </button>
          {showPrayer && (
            <div className="mt-3">
              <p className="text-sm leading-relaxed opacity-90 italic">"{detected.meta.prayer}"</p>
              <button onClick={copyPrayer}
                className="mt-3 flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy prayer'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VerseCard({ verse }) {
  const [expanded, setExpanded] = useState(false);
  const text = verse.text || '';
  const ref = verse.reference || `${verse.bookCode} ${verse.chapter}:${verse.verse}`;
  const preview = text.length > 130 ? text.slice(0, 130) + '…' : text;

  return (
    <button onClick={() => setExpanded(e => !e)}
      className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-purple-200 transition">
      <p className="text-xs font-semibold text-purple-600 mb-1">{ref}</p>
      <p className="text-sm text-gray-700 leading-relaxed">{expanded ? text : preview}</p>
      {text.length > 130 && (
        <span className="text-xs text-purple-400 mt-1 block">{expanded ? 'Show less' : 'Read more'}</span>
      )}
    </button>
  );
}