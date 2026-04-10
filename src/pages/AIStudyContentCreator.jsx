import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, FileQuestion, Heart, Loader2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalization } from '@/components/useLocalization';

// ── Sermon / Lesson Outline Generator ─────────────────────────────────────────
function SermonOutlineGenerator() {
  const { t, content_lang } = useLocalization();
  const [input, setInput] = useState('');
  const [type, setType] = useState('sermon');
  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutline(null);
    try {
      const langInstruction = content_lang === 'om' 
        ? 'Respond in Afan Oromoo (Latin script). Use simple, clear Oromo. Use neutral standard Oromo.'
        : 'Respond in English.';
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert biblical teacher. Generate a detailed ${type} outline based on: "${input}"

${langInstruction}

Provide a structured outline with:
- A compelling title
- Main Scripture reference(s)
- Central theme / big idea (1 sentence)
- 3-4 main points, each with:
  * A clear heading
  * 2-3 sub-points
  * A supporting Scripture reference
  * A practical application
- A closing call-to-action or prayer prompt

IMPORTANT: Include a disclaimer at the end: "${content_lang === 'om' ? 'Mirkaneessi Kitaaba Qulqulluu irratti' : 'Always verify with Scripture'}"

Format as JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            scripture: { type: 'string' },
            theme: { type: 'string' },
            points: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  heading: { type: 'string' },
                  subpoints: { type: 'array', items: { type: 'string' } },
                  scripture: { type: 'string' },
                  application: { type: 'string' }
                }
              }
            },
            closing: { type: 'string' }
          }
        }
      });
      setOutline(result);
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    if (!outline) return;
    const text = [
      outline.title,
      `Scripture: ${outline.scripture}`,
      `Theme: ${outline.theme}`,
      '',
      ...outline.points.flatMap((p, i) => [
        `${i + 1}. ${p.heading} (${p.scripture})`,
        ...p.subpoints.map(s => `   • ${s}`),
        `   → Application: ${p.application}`,
        ''
      ]),
      `Closing: ${outline.closing}`
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['sermon', 'lesson', 'devotional talk'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
            {t}
          </button>
        ))}
      </div>
      <textarea
        className="w-full border rounded-xl p-3 text-sm resize-none h-20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder={`Enter a Bible passage (e.g. "John 15:1-17"), theme (e.g. "abiding in Christ"), or topic...`}
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <Button onClick={generate} disabled={loading || !input.trim()} className="gap-2 w-full bg-indigo-600 hover:bg-indigo-700">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Generate {type.charAt(0).toUpperCase() + type.slice(1)} Outline
      </Button>

      {outline && (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg leading-tight">{outline.title}</h3>
                <p className="text-indigo-200 text-sm mt-0.5">{outline.scripture}</p>
              </div>
              <button onClick={copyText} className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors flex-shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-sm text-indigo-100 mt-2 italic">"{outline.theme}"</p>
          </div>
          <div className="p-4 space-y-4">
            {outline.points?.map((p, i) => (
              <div key={i} className="border-l-4 border-indigo-300 pl-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <h4 className="font-bold text-gray-900">{p.heading}</h4>
                  <Badge className="bg-indigo-50 text-indigo-700 border-0 text-xs ml-auto">{p.scripture}</Badge>
                </div>
                <ul className="space-y-1 mb-2">
                  {p.subpoints?.map((s, j) => (
                    <li key={j} className="text-sm text-gray-700 flex gap-2"><span className="text-indigo-400 flex-shrink-0">•</span>{s}</li>
                  ))}
                </ul>
                <p className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-800">
                  ✋ <strong>Application:</strong> {p.application}
                </p>
              </div>
            ))}
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
              🙏 <strong>Closing:</strong> {outline.closing}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quiz & Flashcard Generator ─────────────────────────────────────────────────
function QuizFlashcardGenerator() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('quiz');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flipStates, setFlipStates] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setFlipStates({});
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      if (mode === 'quiz') {
        const r = await base44.integrations.Core.InvokeLLM({
          prompt: `Create 6 multiple-choice quiz questions about: "${input}"
Base questions on Bible content, theology, or application of the topic.
Each question: 4 options, one correct answer, brief explanation.`,
          response_json_schema: {
            type: 'object',
            properties: {
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                    correctIndex: { type: 'number' },
                    explanation: { type: 'string' }
                  }
                }
              }
            }
          }
        });
        setResult({ type: 'quiz', ...r });
      } else {
        const r = await base44.integrations.Core.InvokeLLM({
          prompt: `Create 8 study flashcards for: "${input}"
Each flashcard has a front (a question or term) and back (the answer or definition).
Focus on key concepts, people, places, or theological terms from the topic.`,
          response_json_schema: {
            type: 'object',
            properties: {
              cards: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { front: { type: 'string' }, back: { type: 'string' } }
                }
              }
            }
          }
        });
        setResult({ type: 'flashcard', ...r });
      }
    } finally {
      setLoading(false);
    }
  };

  const score = quizSubmitted && result?.questions ? (() => {
    const correct = result.questions.filter((q, i) => quizAnswers[i] === q.correctIndex).length;
    return { correct, total: result.questions.length, pct: Math.round(correct / result.questions.length * 100) };
  })() : null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[{ v: 'quiz', label: '📝 Quiz' }, { v: 'flashcard', label: '🃏 Flashcards' }].map(m => (
          <button key={m.v} onClick={() => setMode(m.v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${mode === m.v ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}>
            {m.label}
          </button>
        ))}
      </div>
      <textarea
        className="w-full border rounded-xl p-3 text-sm resize-none h-20 focus:ring-2 focus:ring-green-500"
        placeholder='Enter a topic, passage, or module title (e.g. "The Sermon on the Mount", "Faith chapter - Hebrews 11")'
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <Button onClick={generate} disabled={loading || !input.trim()} className="gap-2 w-full bg-green-600 hover:bg-green-700">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileQuestion className="w-4 h-4" />}
        Generate {mode === 'quiz' ? 'Quiz' : 'Flashcards'}
      </Button>

      {result?.type === 'flashcard' && result.cards && (
        <div>
          <p className="text-xs text-gray-500 mb-3">Tap each card to flip it</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.cards.map((card, i) => (
              <div key={i} onClick={() => setFlipStates(s => ({ ...s, [i]: !s[i] }))}
                className={`cursor-pointer rounded-2xl p-4 min-h-[100px] flex items-center justify-center text-center border-2 transition-all ${
                  flipStates[i] ? 'bg-green-50 border-green-400' : 'bg-indigo-50 border-indigo-300'
                }`}>
                <div>
                  <p className={`text-xs font-bold mb-1 ${flipStates[i] ? 'text-green-600' : 'text-indigo-500'}`}>
                    {flipStates[i] ? '✓ Answer' : '? Question'}
                  </p>
                  <p className="text-sm font-medium text-gray-800 leading-snug">
                    {flipStates[i] ? card.back : card.front}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.type === 'quiz' && result.questions && (
        <div className="space-y-3">
          {score && (
            <div className={`text-center p-4 rounded-xl ${score.pct >= 70 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`text-3xl font-bold ${score.pct >= 70 ? 'text-green-700' : 'text-amber-700'}`}>{score.pct}%</p>
              <p className="text-sm text-gray-600">{score.correct}/{score.total} correct</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}>Try Again</Button>
            </div>
          )}
          {result.questions.map((q, i) => (
            <div key={i} className="bg-white border rounded-xl p-4">
              <p className="font-medium text-gray-900 text-sm mb-3">{i + 1}. {q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, j) => {
                  const selected = quizAnswers[i] === j;
                  const correct = j === q.correctIndex;
                  let cls = 'text-left text-sm p-2.5 rounded-lg border-2 transition-all ';
                  if (quizSubmitted) {
                    if (correct) cls += 'bg-green-50 border-green-400 text-green-800 font-medium';
                    else if (selected) cls += 'bg-red-50 border-red-400 text-red-700';
                    else cls += 'border-gray-200 text-gray-500';
                  } else {
                    cls += selected ? 'bg-green-100 border-green-500 font-medium' : 'bg-white border-gray-200 hover:border-green-400 cursor-pointer';
                  }
                  return (
                    <button key={j} className={cls} disabled={quizSubmitted}
                      onClick={() => setQuizAnswers(a => ({ ...a, [i]: j }))}>
                      {quizSubmitted && correct && '✓ '}{quizSubmitted && selected && !correct && '✗ '}{opt}
                    </button>
                  );
                })}
              </div>
              {quizSubmitted && q.explanation && (
                <p className="text-xs text-indigo-700 bg-indigo-50 rounded-lg p-2 mt-2">{q.explanation}</p>
              )}
            </div>
          ))}
          {!quizSubmitted && (
            <Button className="w-full bg-green-600 hover:bg-green-700"
              disabled={Object.keys(quizAnswers).length < result.questions.length}
              onClick={() => setQuizSubmitted(true)}>
              Submit Answers
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Devotional Reflection Writer ──────────────────────────────────────────────
function DevotionalWriter() {
  const [input, setInput] = useState('');
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setDevotional(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a warm, personal devotional reflection on: "${input}"

Structure:
- opening_verse: a fitting Bible verse
- opening: 1-2 sentences to draw the reader in
- body: 3-4 paragraphs of reflection — personal, theological depth, practical
- prayer: a 3-5 sentence personal prayer
- closing_thought: a one-line memorable takeaway

Write as if speaking heart-to-heart with a fellow believer. Warm, encouraging, scripturally grounded.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            opening_verse: { type: 'string' },
            verse_reference: { type: 'string' },
            opening: { type: 'string' },
            body: { type: 'array', items: { type: 'string' } },
            prayer: { type: 'string' },
            closing_thought: { type: 'string' }
          }
        }
      });
      setDevotional(result);
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    if (!devotional) return;
    const text = [
      devotional.title,
      `"${devotional.opening_verse}" — ${devotional.verse_reference}`,
      '',
      devotional.opening,
      '',
      ...(devotional.body || []),
      '',
      `Prayer: ${devotional.prayer}`,
      '',
      `✨ ${devotional.closing_thought}`
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full border rounded-xl p-3 text-sm resize-none h-20 focus:ring-2 focus:ring-rose-500"
        placeholder='Enter a verse, topic, or theme (e.g. "Psalm 23", "trusting God in hard times", "the prodigal son")'
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <Button onClick={generate} disabled={loading || !input.trim()} className="gap-2 w-full bg-rose-600 hover:bg-rose-700">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
        Draft Devotional
      </Button>

      {devotional && (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl leading-tight">{devotional.title}</h3>
                <p className="text-rose-100 text-sm mt-2 italic">"{devotional.opening_verse}"</p>
                <p className="text-rose-200 text-xs mt-0.5">— {devotional.verse_reference}</p>
              </div>
              <button onClick={copyText} className="bg-white/20 hover:bg-white/30 rounded-lg p-2 ml-3 flex-shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-base font-medium text-gray-800 leading-relaxed italic">{devotional.opening}</p>
            {devotional.body?.map((para, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">{para}</p>
            ))}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-xs font-bold text-rose-700 mb-1.5">🙏 Prayer</p>
              <p className="text-sm text-gray-700 italic leading-relaxed">{devotional.prayer}</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <p className="text-sm font-semibold text-amber-800">✨ {devotional.closing_thought}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AIStudyContentCreator() {
  const { t, loading: locLoading } = useLocalization();
  const [activeTool, setActiveTool] = useState('outline');
  
  // Dynamically build TOOLS with localized labels
  const TOOLS = [
    { id: 'outline', labelKey: 'aiStudy.tabs.sermon', descKey: 'aiStudy.cards.sermon.desc', icon: BookOpen, color: 'from-indigo-500 to-purple-600', component: SermonOutlineGenerator },
    { id: 'quiz', labelKey: 'aiStudy.tabs.lesson', descKey: 'aiStudy.cards.quiz.desc', icon: FileQuestion, color: 'from-green-500 to-teal-600', component: QuizFlashcardGenerator },
    { id: 'devotional', labelKey: 'aiStudy.tabs.devTalk', descKey: 'aiStudy.cards.devotional.desc', icon: Heart, color: 'from-rose-500 to-pink-600', component: DevotionalWriter },
  ];

  const ActiveComponent = TOOLS.find(t => t.id === activeTool)?.component;

  if (locLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-3 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('aiStudy.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('aiStudy.subtitle')}</p>
        </div>

        {/* Tool Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;
            return (
              <button key={tool.id} onClick={() => setActiveTool(tool.id)}
                className={`rounded-2xl p-4 text-left border-2 transition-all ${active ? 'border-indigo-500 bg-white shadow-md' : 'border-gray-200 bg-white/60 hover:border-indigo-300 hover:bg-white'}`}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className={`text-sm font-bold ${active ? 'text-indigo-800' : 'text-gray-800'}`}>{t(tool.labelKey)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t(tool.descKey)}</p>
              </button>
            );
          })}
        </div>

        {/* Active Tool */}
        <Card className="shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {(() => {
                const tool = TOOLS.find(t => t.id === activeTool);
                const Icon = tool?.icon;
                return <><div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${tool?.color} flex items-center justify-center`}><Icon className="w-4 h-4 text-white" /></div>{t(tool?.labelKey)}</>
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ActiveComponent && <ActiveComponent />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}