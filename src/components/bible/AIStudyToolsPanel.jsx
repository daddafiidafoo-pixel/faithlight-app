import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sparkles, Loader2, BookOpen, HelpCircle, Heart,
  RefreshCw, Copy, Check, Map, Brain, Layers,
  BookMarked, GraduationCap, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * AIStudyToolsPanel — Enhanced
 * Tabs:
 *  1. Summary       – Chapter / passage overview
 *  2. Verse AI      – Summarize / Context / Thematic analysis for a selected verse
 *  3. Reflect       – Personal reflection questions
 *  4. Pray          – Personalized prayer prompt
 *  5. Quiz          – Inline personalized quiz
 */
export default function AIStudyToolsPanel({
  book, chapter, verses = [],
  selectedVerse = null,     // { verse, text, book, chapter }
  userNotes = '',
  userTopic = '',
  readingHistory = [],      // array of {book, chapter} recently read
  userGoals = [],           // array of reading goal objects
}) {
  const [activeTab, setActiveTab] = useState('summary');

  // — Summary state
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // — Verse AI state
  const [verseResult, setVerseResult] = useState(null);
  const [verseMode, setVerseMode] = useState('summarize'); // summarize | context | thematic
  const [verseLoading, setVerseLoading] = useState(false);
  const [pickedVerse, setPickedVerse] = useState(null); // manually picked verse from list

  // — Reflection state
  const [reflections, setReflections] = useState([]);
  const [reflLoading, setReflLoading] = useState(false);

  // — Prayer state
  const [prayer, setPrayer] = useState('');
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [prayerContext, setPrayerContext] = useState('');
  const [showPrayerInput, setShowPrayerInput] = useState(false);

  // — Quiz state
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  const [copiedField, setCopiedField] = useState(null);

  const passageLabel = book && chapter ? `${book} ${chapter}` : 'this passage';
  const verseText = verses.map(v => `${v.verse}. ${v.text}`).join('\n');
  const activeVerse = pickedVerse || selectedVerse;

  const copyText = async (text, field) => {
    try { await navigator.clipboard.writeText(text); setCopiedField(field); setTimeout(() => setCopiedField(null), 2000); }
    catch { toast.error('Failed to copy'); }
  };

  // ── 1. SUMMARY ───────────────────────────────────────────────────────────
  const generateSummary = async () => {
    if (!verseText) { toast.error('No verse content available'); return; }
    setSummaryLoading(true); setSummary('');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a biblical scholar. Summarize ${passageLabel} for a Bible student.

Structure:
**Main Theme**: (1 sentence)
**Key Events / Teachings**: (2-4 bullet points)
**Spiritual Lesson**: (1-2 sentences)
**Connection to God's Story**: (1 sentence)

Keep it under 220 words. Be encouraging and clear.

PASSAGE:
${verseText}`,
    }).catch(() => { toast.error('Failed to generate summary'); return null; });
    if (result) setSummary(result);
    setSummaryLoading(false);
  };

  // ── 2. VERSE AI ──────────────────────────────────────────────────────────
  const VERSE_MODES = {
    summarize: {
      label: 'Summarize',
      icon: BookOpen,
      prompt: (ref, text) => `Summarize this Bible verse in 2-3 simple, clear sentences that capture the core meaning. 
Reference: ${ref}
Verse: "${text}"
Include: what it means, why it matters, and one key takeaway.`,
    },
    context: {
      label: 'Context',
      icon: Map,
      prompt: (ref, text) => `Explain the historical, cultural, and literary context of this Bible verse.
Reference: ${ref}
Verse: "${text}"

Cover:
1. Historical background (who wrote it, when, why)
2. Cultural context (what customs/settings are referenced)
3. How it fits within the surrounding passage
4. Original audience vs. modern reader

Keep it under 200 words.`,
    },
    thematic: {
      label: 'Themes',
      icon: Layers,
      prompt: (ref, text) => `Identify and explain the key theological themes in this Bible verse.
Reference: ${ref}
Verse: "${text}"

For each theme:
- Name the theme
- Briefly explain how it appears in this verse
- Connect it to a broader biblical motif (Old or New Testament)

List 3-4 themes. Keep total response under 220 words.`,
    },
  };

  const runVerseAI = async () => {
    if (!activeVerse) { toast.error('Select a verse first by clicking it in the reader'); return; }
    setVerseLoading(true); setVerseResult(null);
    const ref = `${activeVerse.book || book} ${activeVerse.chapter || chapter}:${activeVerse.verse}`;
    const text = activeVerse.text;
    const mode = VERSE_MODES[verseMode];
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: mode.prompt(ref, text),
    }).catch(() => { toast.error('Failed to analyse verse'); return null; });
    if (result) setVerseResult({ ref, text, mode: verseMode, output: result });
    setVerseLoading(false);
  };

  // ── 3. REFLECTION ────────────────────────────────────────────────────────
  const generateReflections = async () => {
    if (!verseText) { toast.error('No verse content available'); return; }
    setReflLoading(true); setReflections([]);
    const topicHint = userTopic ? `The user is studying: "${userTopic}".` : '';
    const notesHint = userNotes ? `User's notes: "${userNotes.slice(0, 300)}"` : '';
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5 deep personal reflection questions for ${passageLabel}.
${topicHint} ${notesHint}
- Mix personal challenge, emotional/spiritual reflection, and action-oriented questions
- Written for someone genuinely seeking to grow in faith
Return a JSON array of 5 question strings.

PASSAGE: ${verseText}`,
      response_json_schema: { type: 'object', properties: { questions: { type: 'array', items: { type: 'string' } } } }
    }).catch(() => { toast.error('Failed to generate questions'); return null; });
    if (result?.questions) setReflections(result.questions);
    setReflLoading(false);
  };

  // ── 4. PRAYER ────────────────────────────────────────────────────────────
  const generatePrayer = async () => {
    setPrayerLoading(true); setPrayer('');
    const context = userNotes || prayerContext;
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a personalized prayer prompt based on ${passageLabel}.
${context ? `User's context: "${context.slice(0, 400)}"` : ''}
${userTopic ? `Study topic: "${userTopic}".` : ''}

Requirements:
- Open with acknowledgment of God relevant to this passage
- Include 2-3 specific things to pray about from the passage's themes
- End with surrender/trust
- ~120 words, warm and personal, second person style

PASSAGE: ${verseText}`,
    }).catch(() => { toast.error('Failed to generate prayer'); return null; });
    if (result) setPrayer(result);
    setPrayerLoading(false);
  };

  // ── 5. QUIZ ──────────────────────────────────────────────────────────────
  const generateQuiz = async () => {
    if (!verseText) { toast.error('No verse content available'); return; }
    setQuizLoading(true); setQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null);

    // Build personalized context from history & goals
    const historyHint = readingHistory.length > 0
      ? `The user has recently read: ${readingHistory.slice(0, 5).map(h => `${h.book} ${h.chapter}`).join(', ')}.`
      : '';
    const goalHint = userGoals.length > 0
      ? `Their reading goal is: ${userGoals[0].goal_type?.replace('_', ' ')}.`
      : '';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a 5-question multiple-choice Bible comprehension quiz for ${passageLabel}.
${historyHint} ${goalHint}
- Questions should test understanding of THIS passage
- Mix of factual, interpretive, and application questions
- 4 options each, one correct answer (correctIndex 0-3)

Return JSON:
{ "questions": [{ "id": 1, "question": "...", "options": ["A)…","B)…","C)…","D)…"], "correctIndex": 0, "explanation": "brief why" }] }

PASSAGE: ${verseText}`,
      response_json_schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                question: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                correctIndex: { type: 'number' },
                explanation: { type: 'string' }
              }
            }
          }
        }
      }
    }).catch(() => { toast.error('Failed to generate quiz'); return null; });
    if (result?.questions?.length) setQuiz(result);
    setQuizLoading(false);
  };

  const submitQuiz = () => {
    if (!quiz) return;
    const correct = quiz.questions.filter((q, i) => quizAnswers[i] === q.correctIndex).length;
    setQuizScore(correct);
    setQuizSubmitted(true);
    if (correct === quiz.questions.length) toast.success('🎉 Perfect score!');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Card className="border-indigo-200 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI Study Tools
          {passageLabel !== 'this passage' && (
            <Badge variant="outline" className="ml-auto text-indigo-600 border-indigo-300 text-xs font-normal">{passageLabel}</Badge>
          )}
        </CardTitle>
        <p className="text-xs text-amber-700 mt-1">
          AI-generated insights — not scripture. Bible text comes only from licensed translations.
        </p>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full mb-4 text-xs">
            <TabsTrigger value="summary" title="Chapter Summary"><BookOpen className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Summary</span></TabsTrigger>
            <TabsTrigger value="verse" title="Verse Analysis"><Brain className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Verse AI</span></TabsTrigger>
            <TabsTrigger value="reflection" title="Reflection Questions"><HelpCircle className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Reflect</span></TabsTrigger>
            <TabsTrigger value="prayer" title="Prayer Prompt"><Heart className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Pray</span></TabsTrigger>
            <TabsTrigger value="quiz" title="Personalized Quiz"><GraduationCap className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Quiz</span></TabsTrigger>
          </TabsList>

          {/* ── SUMMARY ── */}
          <TabsContent value="summary">
            <p className="text-sm text-gray-500 mb-3">AI overview of this chapter's themes, events, and lessons.</p>
            {summary ? (
              <div className="bg-indigo-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                {summary}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => copyText(summary, 'summary')} className="gap-1">
                    {copiedField === 'summary' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'summary' ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={generateSummary} disabled={summaryLoading} className="gap-1">
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={generateSummary} disabled={summaryLoading || !verseText} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                {summaryLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Summary</>}
              </Button>
            )}
          </TabsContent>

          {/* ── VERSE AI ── */}
          <TabsContent value="verse">
            <div className="space-y-3">
              {/* Mode selector */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(VERSE_MODES).map(([key, { label, icon: Icon }]) => (
                  <button
                    key={key}
                    onClick={() => { setVerseMode(key); setVerseResult(null); }}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${verseMode === key ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Active verse display */}
              {activeVerse ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
                  <p className="font-semibold text-amber-800 mb-1">
                    {activeVerse.book || book} {activeVerse.chapter || chapter}:{activeVerse.verse}
                  </p>
                  <p className="text-amber-700 italic line-clamp-3">"{activeVerse.text}"</p>
                  <button onClick={() => setPickedVerse(null)} className="mt-1 text-amber-500 hover:text-amber-700 flex items-center gap-0.5">
                    <X className="w-3 h-3" /> clear
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-center text-xs text-gray-500">
                  Click any verse in the reader to select it, then use the AI tools here.
                  <br />
                  <span className="text-gray-400">Or pick from this chapter:</span>
                  <div className="flex flex-wrap gap-1 mt-2 justify-center max-h-20 overflow-y-auto">
                    {verses.slice(0, 15).map(v => (
                      <button key={v.verse} onClick={() => setPickedVerse(v)} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 text-xs transition-colors">
                        v{v.verse}
                      </button>
                    ))}
                    {verses.length > 15 && <span className="text-gray-400 text-xs self-center">+{verses.length - 15} more</span>}
                  </div>
                </div>
              )}

              <Button
                onClick={runVerseAI}
                disabled={verseLoading || !activeVerse}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {verseLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><Brain className="w-4 h-4" /> {VERSE_MODES[verseMode].label} Verse</>}
              </Button>

              {verseResult && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs text-purple-700 border-purple-300">{verseResult.ref}</Badge>
                    <Badge variant="outline" className="text-xs capitalize text-purple-600 border-purple-200">{verseResult.mode}</Badge>
                  </div>
                  {verseResult.output}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => copyText(verseResult.output, 'verse')} className="gap-1">
                      {copiedField === 'verse' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={runVerseAI} disabled={verseLoading} className="gap-1">
                      <RefreshCw className="w-3 h-3" /> Redo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── REFLECTION ── */}
          <TabsContent value="reflection">
            <p className="text-sm text-gray-500 mb-3">Personal reflection questions drawn from this passage.</p>
            {reflections.length > 0 ? (
              <div className="space-y-2">
                {reflections.map((q, i) => (
                  <div key={i} className="bg-indigo-50 rounded-lg p-3 flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                    <p className="text-sm text-gray-800">{q}</p>
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant="outline" onClick={() => copyText(reflections.join('\n\n'), 'refl')} className="gap-1">
                    {copiedField === 'refl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={generateReflections} disabled={reflLoading} className="gap-1">
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={generateReflections} disabled={reflLoading || !verseText} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                {reflLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><HelpCircle className="w-4 h-4" /> Generate Questions</>}
              </Button>
            )}
          </TabsContent>

          {/* ── PRAYER ── */}
          <TabsContent value="prayer">
            <p className="text-sm text-gray-500 mb-3">A personalized prayer prompt based on this passage and your context.</p>
            <div className="mb-3">
              <button onClick={() => setShowPrayerInput(v => !v)} className="text-xs text-indigo-600 flex items-center gap-1">
                {showPrayerInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Add personal context (optional)
              </button>
              {showPrayerInput && (
                <Textarea
                  value={prayerContext}
                  onChange={(e) => setPrayerContext(e.target.value)}
                  placeholder="Share what's on your heart or a specific situation…"
                  className="mt-2 text-sm"
                  rows={2}
                />
              )}
            </div>
            {prayer ? (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed italic">
                {prayer}
                <div className="flex gap-2 mt-3 not-italic">
                  <Button size="sm" variant="outline" onClick={() => copyText(prayer, 'prayer')} className="gap-1">
                    {copiedField === 'prayer' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={generatePrayer} disabled={prayerLoading} className="gap-1">
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={generatePrayer} disabled={prayerLoading || !verseText} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                {prayerLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Heart className="w-4 h-4" /> Generate Prayer Prompt</>}
              </Button>
            )}
          </TabsContent>

          {/* ── QUIZ ── */}
          <TabsContent value="quiz">
            {!quiz ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Personalized quiz based on <span className="font-medium text-indigo-700">{passageLabel}</span>
                  {readingHistory.length > 0 && <span className="text-gray-400"> · tailored to your reading history</span>}
                </p>
                <Button onClick={generateQuiz} disabled={quizLoading || !verseText} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                  {quizLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Quiz…</> : <><GraduationCap className="w-4 h-4" /> Generate Personalized Quiz</>}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Score banner */}
                {quizSubmitted && (
                  <div className={`p-3 rounded-lg text-center font-semibold text-sm ${quizScore === quiz.questions.length ? 'bg-green-50 border border-green-200 text-green-800' : quizScore >= quiz.questions.length / 2 ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    {quizScore === quiz.questions.length ? '🎉 Perfect!' : quizScore >= quiz.questions.length / 2 ? '👍 Good effort!' : '📖 Keep studying!'}{' '}
                    {quizScore}/{quiz.questions.length} correct
                  </div>
                )}

                {/* Questions */}
                {quiz.questions.map((q, qi) => (
                  <div key={qi} className="border border-gray-200 rounded-xl p-3">
                    <p className="text-sm font-medium text-gray-800 mb-2">{qi + 1}. {q.question}</p>
                    <div className="space-y-1">
                      {q.options.map((opt, oi) => {
                        const selected = quizAnswers[qi] === oi;
                        const correct = oi === q.correctIndex;
                        let cls = 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50';
                        if (quizSubmitted) {
                          if (correct) cls = 'bg-green-50 border-green-400 text-green-800 font-medium';
                          else if (selected && !correct) cls = 'bg-red-50 border-red-400 text-red-700 line-through';
                        } else if (selected) {
                          cls = 'bg-indigo-50 border-indigo-400 text-indigo-800';
                        }
                        return (
                          <button
                            key={oi}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers(a => ({ ...a, [qi]: oi }))}
                            className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all ${cls}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && q.explanation && (
                      <p className="mt-2 text-xs text-indigo-700 bg-indigo-50 rounded p-2">💡 {q.explanation}</p>
                    )}
                  </div>
                ))}

                {/* Actions */}
                <div className="flex gap-2">
                  {!quizSubmitted ? (
                    <Button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length < quiz.questions.length}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Submit Answers
                    </Button>
                  ) : (
                    <Button onClick={() => { setQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null); }} variant="outline" className="flex-1 gap-1">
                      <RefreshCw className="w-3.5 h-3.5" /> New Quiz
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { setQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null); generateQuiz(); }} className="gap-1" title="Regenerate">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}