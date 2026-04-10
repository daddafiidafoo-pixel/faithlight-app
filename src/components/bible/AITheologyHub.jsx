import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sparkles, Loader2, Brain, BookOpen, HelpCircle,
  CheckCircle2, XCircle, RefreshCw, Copy, Check, Target
} from 'lucide-react';
import { toast } from 'sonner';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','Ezra','Nehemiah','Esther','Job',
  'Psalm','Proverbs','Ecclesiastes','Song of Songs','Isaiah','Jeremiah','Lamentations',
  'Ezekiel','Daniel','Hosea','Joel','Amos','Jonah','Micah','Nahum','Habakkuk',
  'Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John',
  'Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians',
  'Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy',
  '2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter',
  '1 John','2 John','3 John','Jude','Revelation'
];

const THEOLOGICAL_TOPICS = [
  'Salvation & Grace','The Trinity','Prayer & Intercession','Faith & Works',
  'Prophecy & Eschatology','The Holy Spirit','Biblical Covenants','Sin & Redemption',
  'Kingdom of God','Discipleship','Worship','Christian Ethics','Creation & Providence',
  'Angels & Spiritual Warfare','Heaven & Hell','Church & Sacraments'
];

const QUIZ_THEMES = [
  'Characters','Miracles','Geography','Prophecies','Parables','Psalms & Poetry',
  'Paul\'s Letters','Proverbs & Wisdom','Genealogy','Numbers & Timeline'
];

// ── Personalized Study Plan Generator ─────────────────────────────────────
function StudyPlanTab({ currentUser }) {
  const [topic, setTopic] = useState('');
  const [interests, setInterests] = useState([]);
  const [duration, setDuration] = useState('14');
  const [level, setLevel] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [saved, setSaved] = useState(false);

  const toggleInterest = (t) => {
    setInterests(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const generate = async () => {
    if (!topic && interests.length === 0) {
      toast.error('Enter a topic or select interests'); return;
    }
    setLoading(true); setPlan(null); setSaved(false);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert biblical educator. Create a personalized ${duration}-day Bible study plan.
Topic/Focus: ${topic || interests.join(', ')}
Theological Interests: ${interests.join(', ')}
Level: ${level}

Create a structured, engaging study plan with daily readings and reflection questions.
Do NOT reproduce copyrighted Bible text. Use verse references only.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            overview: { type: 'string' },
            daily_plan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  theme: { type: 'string' },
                  scripture_refs: { type: 'array', items: { type: 'string' } },
                  reflection_question: { type: 'string' },
                  prayer_focus: { type: 'string' }
                }
              }
            },
            key_themes: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setPlan(result);
    } catch (e) {
      toast.error('Failed to generate plan');
    }
    setLoading(false);
  };

  const savePlan = async () => {
    if (!currentUser || !plan) return;
    await base44.entities.StudyPlan.create({
      user_id: currentUser.id,
      title: plan.title,
      description: plan.description,
      duration_days: parseInt(duration),
      topics: [topic, ...interests].filter(Boolean),
      daily_plan: plan.daily_plan,
      status: 'active',
      progress_percentage: 0,
      generated_content: plan.overview
    });
    setSaved(true);
    toast.success('Study plan saved to My Plans!');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Study Topic</label>
        <Input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. The Sermon on the Mount, Prayer in Psalms..."
          className="text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Theological Interests</label>
        <div className="flex flex-wrap gap-1.5">
          {THEOLOGICAL_TOPICS.map(t => (
            <button
              key={t}
              onClick={() => toggleInterest(t)}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                interests.includes(t)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration</label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['7','14','21','30','60','90'].map(d => (
                <SelectItem key={d} value={d}>{d} Days</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Level</label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={generate} disabled={loading} className="w-full gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Generating Plan...' : 'Generate Personalized Plan'}
      </Button>

      {plan && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-indigo-900">{plan.title}</h4>
              <p className="text-xs text-indigo-600 mt-0.5">{plan.description}</p>
            </div>
            <Badge className="bg-indigo-600 text-white shrink-0">{duration} days</Badge>
          </div>
          {plan.key_themes?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {plan.key_themes.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-white text-indigo-700 border border-indigo-200">{t}</span>
              ))}
            </div>
          )}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {plan.daily_plan?.slice(0, 7).map(d => (
              <div key={d.day} className="bg-white rounded-lg p-3 border border-indigo-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded px-1.5 py-0.5">Day {d.day}</span>
                  <span className="text-xs font-semibold text-gray-700">{d.theme}</span>
                </div>
                {d.scripture_refs?.length > 0 && (
                  <p className="text-xs text-blue-600 mb-1">📖 {d.scripture_refs.join(' • ')}</p>
                )}
                {d.reflection_question && (
                  <p className="text-xs text-gray-500 italic">💭 {d.reflection_question}</p>
                )}
              </div>
            ))}
            {plan.daily_plan?.length > 7 && (
              <p className="text-xs text-center text-gray-400">+ {plan.daily_plan.length - 7} more days after saving...</p>
            )}
          </div>
          <Button
            onClick={savePlan}
            disabled={saved || !currentUser}
            variant={saved ? 'outline' : 'default'}
            className="w-full gap-2"
          >
            {saved ? <><CheckCircle2 className="w-4 h-4 text-green-600" /> Saved to My Plans</> : <><Target className="w-4 h-4" /> Save Plan</>}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Bible Quiz Generator ───────────────────────────────────────────────────
function QuizTab() {
  const [quizBook, setQuizBook] = useState('');
  const [quizTheme, setQuizTheme] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState('5');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const generate = async () => {
    if (!quizBook && !quizTheme) { toast.error('Select a book or theme'); return; }
    setLoading(true); setQuiz(null); setAnswers({}); setSubmitted(false);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a ${questionCount}-question Bible quiz.
${quizBook ? `Bible Book: ${quizBook}` : ''}
${quizTheme ? `Theme: ${quizTheme}` : ''}
Difficulty: ${difficulty}
Rules: All questions must be factually accurate. Don't reproduce copyrighted text.
Mix question types: knowledge, understanding, application.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  correct_index: { type: 'number' },
                  explanation: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setQuiz(result);
    } catch {
      toast.error('Failed to generate quiz');
    }
    setLoading(false);
  };

  const submitQuiz = () => {
    if (!quiz) return;
    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correct_index) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const pct = quiz ? Math.round((score / quiz.questions.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Bible Book</label>
          <Select value={quizBook} onValueChange={v => { setQuizBook(v); setQuizTheme(''); }}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select book..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {BIBLE_BOOKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Or Theme</label>
          <Select value={quizTheme} onValueChange={v => { setQuizTheme(v); setQuizBook(''); }}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select theme..." />
            </SelectTrigger>
            <SelectContent>
              {QUIZ_THEMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Difficulty</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Questions</label>
          <Select value={questionCount} onValueChange={setQuestionCount}>
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['5','10','15','20'].map(n => <SelectItem key={n} value={n}>{n} questions</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={generate} disabled={loading} className="w-full gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
        {loading ? 'Generating Quiz...' : 'Generate Quiz'}
      </Button>

      {quiz && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-sm">{quiz.title}</h4>
            {submitted && (
              <Badge className={pct >= 70 ? 'bg-green-600' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}>
                {score}/{quiz.questions.length} ({pct}%)
              </Badge>
            )}
          </div>

          {submitted && (
            <div className={`rounded-xl p-3 text-center ${pct >= 70 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className="text-2xl font-bold">{pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚'}</p>
              <p className="text-sm font-semibold mt-1">
                {pct >= 70 ? 'Excellent work!' : pct >= 50 ? 'Good effort! Keep studying.' : 'Keep at it — review these passages!'}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {quiz.questions.map((q, qi) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct_index;
              return (
                <div key={q.id} className="border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    <span className="text-indigo-600 font-bold mr-1">{qi + 1}.</span> {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      let btnClass = 'w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ';
                      if (!submitted) {
                        btnClass += userAnswer === oi
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-medium'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300';
                      } else {
                        if (oi === q.correct_index) btnClass += 'bg-green-50 border-green-400 text-green-700 font-medium';
                        else if (oi === userAnswer) btnClass += 'bg-red-50 border-red-400 text-red-600';
                        else btnClass += 'bg-white border-gray-100 text-gray-400';
                      }
                      return (
                        <button
                          key={oi}
                          onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: oi }))}
                          disabled={submitted}
                          className={btnClass}
                        >
                          {submitted && oi === q.correct_index && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-green-600" />}
                          {submitted && oi === userAnswer && oi !== q.correct_index && <XCircle className="w-3.5 h-3.5 inline mr-1.5 text-red-500" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && q.explanation && (
                    <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-100 pt-2">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {!submitted ? (
            <Button onClick={submitQuiz} className="w-full" disabled={Object.keys(answers).length < quiz.questions.length}>
              Submit Answers ({Object.keys(answers).length}/{quiz.questions.length} answered)
            </Button>
          ) : (
            <Button variant="outline" onClick={() => { setQuiz(null); setAnswers({}); setSubmitted(false); }} className="w-full gap-2">
              <RefreshCw className="w-4 h-4" /> Try Another Quiz
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Theological Concept Explainer ─────────────────────────────────────────
function TheologyTab() {
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const explain = async () => {
    if (!concept.trim()) { toast.error('Enter a concept'); return; }
    setLoading(true); setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical theologian. Explain the theological concept: "${concept}"
Provide a comprehensive, accessible, biblically grounded explanation.
Include key Bible references (refs only, not full text), different Christian perspectives, and practical application.`,
        response_json_schema: {
          type: 'object',
          properties: {
            concept: { type: 'string' },
            definition: { type: 'string' },
            biblical_foundation: { type: 'string' },
            key_verses: { type: 'array', items: { type: 'string' } },
            theological_perspectives: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tradition: { type: 'string' },
                  view: { type: 'string' }
                }
              }
            },
            practical_application: { type: 'string' },
            common_misunderstandings: { type: 'string' },
            related_concepts: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setResult(res);
    } catch {
      toast.error('Failed to generate explanation');
    }
    setLoading(false);
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(
      `${result.concept}\n\n${result.definition}\n\nBiblical Foundation:\n${result.biblical_foundation}\n\nKey Verses: ${result.key_verses?.join(', ')}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Theological Concept</label>
        <div className="flex gap-2">
          <Input
            value={concept}
            onChange={e => setConcept(e.target.value)}
            placeholder="e.g. Justification, Sanctification, Atonement..."
            className="text-sm"
            onKeyDown={e => e.key === 'Enter' && explain()}
          />
          <Button onClick={explain} disabled={loading} className="gap-2 shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Explain'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {['Justification','Sanctification','Atonement','Grace','Covenant','Predestination','Incarnation','Resurrection'].map(c => (
          <button
            key={c}
            onClick={() => setConcept(c)}
            className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition-colors"
          >
            {c}
          </button>
        ))}
      </div>

      {result && (
        <div className="space-y-3">
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border border-indigo-100">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-bold text-indigo-900 text-base">{result.concept}</h4>
              <button onClick={copy} className="p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{result.definition}</p>
          </div>

          {result.key_verses?.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Key Scripture References</p>
              <div className="flex flex-wrap gap-1.5">
                {result.key_verses.map(v => (
                  <span key={v} className="px-2 py-0.5 rounded-full text-xs bg-white text-blue-700 border border-blue-200 font-medium">{v}</span>
                ))}
              </div>
            </div>
          )}

          {result.biblical_foundation && (
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Biblical Foundation</p>
              <p className="text-sm text-gray-700 leading-relaxed">{result.biblical_foundation}</p>
            </div>
          )}

          {result.theological_perspectives?.length > 0 && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Theological Perspectives</p>
              <div className="space-y-2">
                {result.theological_perspectives.map((p, i) => (
                  <div key={i} className="bg-white rounded-lg px-3 py-2 border border-amber-100">
                    <p className="text-xs font-bold text-amber-800">{p.tradition}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{p.view}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.practical_application && (
            <div className="rounded-xl border border-green-100 bg-green-50 p-3">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Practical Application</p>
              <p className="text-sm text-gray-700">{result.practical_application}</p>
            </div>
          )}

          {result.related_concepts?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Related concepts:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.related_concepts.map(c => (
                  <button
                    key={c}
                    onClick={() => { setConcept(c); setResult(null); }}
                    className="px-2.5 py-1 rounded-full text-xs bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    {c} →
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AITheologyHub({ currentUser, book, chapter, defaultTab = 'plan' }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-indigo-900 text-sm">AI Study Hub</h3>
          <p className="text-xs text-indigo-500">Personalized plans · Quizzes · Theology explainer</p>
        </div>
      </div>
      <div className="p-4">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="plan" className="flex-1 text-xs gap-1"><Target className="w-3 h-3" />Study Plan</TabsTrigger>
            <TabsTrigger value="quiz" className="flex-1 text-xs gap-1"><HelpCircle className="w-3 h-3" />Quiz</TabsTrigger>
            <TabsTrigger value="theology" className="flex-1 text-xs gap-1"><Brain className="w-3 h-3" />Theology</TabsTrigger>
          </TabsList>
          <TabsContent value="plan"><StudyPlanTab currentUser={currentUser} /></TabsContent>
          <TabsContent value="quiz"><QuizTab /></TabsContent>
          <TabsContent value="theology"><TheologyTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}