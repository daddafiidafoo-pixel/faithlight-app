import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Trophy, Star, RotateCw, CheckCircle, XCircle, Loader2, ChevronRight, Flame, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const XP_PER_CORRECT = 15;
const XP_PER_QUIZ = 25;
const XP_SPEED_BONUS = 10;
const QUESTION_TIME = 20; // seconds per question

// ── XP helpers ───────────────────────────────────────────────────
function xpToLevel(xp) {
  const levels = [0, 100, 250, 500, 900, 1400, 2000, 3000, 5000, 8000];
  let lv = 1;
  for (let i = 0; i < levels.length; i++) { if (xp >= levels[i]) lv = i + 1; }
  return Math.min(lv, 10);
}
function xpForNextLevel(xp) {
  const levels = [100, 250, 500, 900, 1400, 2000, 3000, 5000, 8000, Infinity];
  const lv = xpToLevel(xp) - 1;
  return levels[Math.min(lv, levels.length - 1)];
}
const LEVEL_NAMES = ['', 'Seeker', 'Student', 'Disciple', 'Scribe', 'Teacher', 'Prophet', 'Elder', 'Apostle', 'Patriarch', 'Sage'];

// ── Timer bar ─────────────────────────────────────────────────────
function TimerBar({ duration, onExpire }) {
  const [left, setLeft] = useState(duration);
  useEffect(() => {
    const t = setInterval(() => setLeft(s => { if (s <= 1) { clearInterval(t); onExpire(); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, []);
  const pct = (left / duration) * 100;
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className={`text-sm font-bold w-6 ${left <= 5 ? 'text-red-500' : 'text-gray-600'}`}>{left}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: left > 10 ? '#6366F1' : left > 5 ? '#F59E0B' : '#EF4444' }} />
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────
function QuizLeaderboard({ user }) {
  const { data: scores = [] } = useQuery({
    queryKey: ['quiz-leaderboard-daily'],
    queryFn: () => base44.entities.UserPoints.filter({}, '-total_xp', 20).catch(() => []),
    refetchInterval: 30000,
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4">
        <h3 className="text-white font-extrabold flex items-center gap-2"><Trophy className="w-5 h-5" /> Global Leaderboard</h3>
        <p className="text-amber-100 text-xs mt-0.5">Top quiz champions</p>
      </div>
      <div className="divide-y divide-gray-50">
        {scores.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No scores yet — be the first!</p>}
        {scores.map((s, i) => (
          <div key={s.id} className={`flex items-center gap-3 px-5 py-3 ${s.user_id === user?.id ? 'bg-indigo-50' : ''}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{s.created_by?.split('@')[0] || 'Anonymous'}</p>
              <p className="text-xs text-gray-400">Level {xpToLevel(s.total_xp || 0)} · {LEVEL_NAMES[xpToLevel(s.total_xp || 0)]}</p>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-indigo-600 text-sm">{s.total_xp || 0} XP</p>
              <p className="text-xs text-amber-500">🔥 {s.current_streak || 0}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function DailyBibleQuiz() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [phase, setPhase] = useState('home'); // home | playing | results
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [answerTime, setAnswerTime] = useState({});
  const [startedAt, setStartedAt] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {}).finally(() => setAuthChecked(true));
  }, []);

  // Load user XP
  const { data: userPoints } = useQuery({
    queryKey: ['user-xp', user?.id],
    enabled: !!user,
    queryFn: () => base44.entities.UserPoints.filter({ user_id: user.id }, '-created_date', 1)
      .then(r => r[0] || null).catch(() => null),
  });

  // Load reading history to personalize quiz
  const { data: readingHistory = [] } = useQuery({
    queryKey: ['reading-hist-quiz', user?.id],
    enabled: !!user,
    queryFn: () => base44.entities.ReadingSession.filter({ user_id: user.id }, '-created_date', 20).catch(() => []),
  });

  const xpMutation = useMutation({
    mutationFn: async ({ xp, correct, total, streak }) => {
      if (!user) return;
      const existing = userPoints;
      const prevXp = existing?.total_xp || 0;
      const prevStreak = existing?.current_streak || 0;
      const newStreak = correct === total ? prevStreak + 1 : 0;
      const data = {
        user_id: user.id,
        total_xp: prevXp + xp,
        current_streak: newStreak,
        quizzes_completed: (existing?.quizzes_completed || 0) + 1,
        total_correct: (existing?.total_correct || 0) + correct,
        total_answered: (existing?.total_answered || 0) + total,
      };
      if (existing) await base44.entities.UserPoints.update(existing.id, data);
      else await base44.entities.UserPoints.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-xp'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-leaderboard-daily'] });
    },
  });

  // Load today's daily verse
  const { data: todayVerse } = useQuery({
    queryKey: ['daily-verse-quiz'],
    queryFn: async () => {
      const today = new Date();
      const dateKey = String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
      const results = await base44.entities.DailyVerse.filter({ dateKey, language: 'en' }).catch(() => []);
      return results[0] || null;
    },
  });

  const generateQuiz = async () => {
    setGenerating(true);

    // Prefer daily verse context, fall back to reading history
    let prompt;
    if (todayVerse) {
      prompt = `Generate 5 quiz questions about this Bible verse: "${todayVerse.verseText}" (${todayVerse.reference}).
Include questions about: the meaning, the context, the book it's from, related themes, and application.
Mix easy and medium difficulty.
Return ONLY valid JSON: {"questions":[{"q":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A","ref":"${todayVerse.reference}"},...]}`;
    } else {
      const recentBooks = readingHistory.map(r => r.book_id).filter(Boolean);
      const pool = recentBooks.length > 0 ? recentBooks : ['John', 'Psalms', 'Genesis', 'Romans'];
      const randomBook = pool[Math.floor(Math.random() * pool.length)];
      prompt = `Generate 5 Bible trivia questions about the book of ${randomBook}. Mix difficulty levels.
Return ONLY valid JSON: {"questions":[{"q":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A","ref":"John 3:16"},...]}`;
    }

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  q: { type: 'string' },
                  options: { type: 'object', properties: { A: { type: 'string' }, B: { type: 'string' }, C: { type: 'string' }, D: { type: 'string' } } },
                  answer: { type: 'string' },
                  ref: { type: 'string' },
                }
              }
            }
          }
        }
      });

      const qs = result?.questions || [];
      if (qs.length === 0) throw new Error('No questions returned');
      setQuestions(qs.slice(0, 5));
      setAnswers({});
      setAnswerTime({});
      setCurrentIdx(0);
      setStartedAt(Date.now());
      setTimerKey(k => k + 1);
      setPhase('playing');
    } catch {
      setGenerating(false);
      return;
    }
    setGenerating(false);
  };

  const handleAnswer = (opt) => {
    if (answers[currentIdx] !== undefined) return;
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    setAnswerTime(t => ({ ...t, [currentIdx]: elapsed }));
    setAnswers(a => ({ ...a, [currentIdx]: opt }));
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      // Calculate XP
      const correct = questions.filter((q, i) => answers[i] === q.answer).length;
      const totalTime = Object.values(answerTime).reduce((a, b) => a + b, 0);
      const speedBonus = totalTime < 60 ? XP_SPEED_BONUS : 0;
      const earned = correct * XP_PER_CORRECT + XP_PER_QUIZ + speedBonus;
      setXpGained(earned);
      xpMutation.mutate({ xp: earned, correct, total: questions.length, streak: correct === questions.length });
      setPhase('results');
    } else {
      setCurrentIdx(i => i + 1);
      setTimerKey(k => k + 1);
      setStartedAt(Date.now());
    }
  };

  if (!authChecked) return null;

  // ── Results Screen ────────────────────────────────────────────
  if (phase === 'results') {
    const correct = questions.filter((q, i) => answers[i] === q.answer).length;
    const pct = Math.round((correct / questions.length) * 100);
    const newXp = (userPoints?.total_xp || 0) + xpGained;
    const lv = xpToLevel(newXp);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
          <div className="text-5xl mb-3">{pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '📖'}</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Quiz Complete!</h2>
          <p className="text-gray-500 mb-5">{correct}/{questions.length} correct</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-indigo-50 rounded-xl p-3"><p className="text-2xl font-black text-indigo-600">{pct}%</p><p className="text-xs text-indigo-500">Accuracy</p></div>
            <div className="bg-amber-50 rounded-xl p-3"><p className="text-2xl font-black text-amber-600">+{xpGained}</p><p className="text-xs text-amber-500">XP Earned</p></div>
            <div className="bg-green-50 rounded-xl p-3"><p className="text-2xl font-black text-green-600">{lv}</p><p className="text-xs text-green-500">Level</p></div>
          </div>

          {/* XP Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Level {lv} · {LEVEL_NAMES[lv]}</span>
              <span>{newXp} / {xpForNextLevel(newXp)} XP</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${Math.min(100, (newXp / xpForNextLevel(newXp)) * 100)}%` }} />
            </div>
          </div>

          {/* Answer review */}
          <div className="text-left space-y-2 mb-5 max-h-48 overflow-y-auto">
            {questions.map((q, i) => (
              <div key={i} className={`rounded-xl p-2.5 text-xs ${answers[i] === q.answer ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                <div className="flex items-center gap-1 mb-0.5">
                  {answers[i] === q.answer ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                  <span className="font-medium text-gray-700 line-clamp-1">{q.q}</span>
                </div>
                <p className="text-gray-500 pl-4.5">{q.ref} · Answer: {q.answer}. {q.options?.[q.answer]}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={generateQuiz} disabled={generating} className="flex-1 bg-indigo-700 gap-1.5">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />} Play Again
            </Button>
            <Button onClick={() => setPhase('home')} variant="outline" className="flex-1">Leaderboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing Screen ────────────────────────────────────────────
  if (phase === 'playing' && questions.length > 0) {
    const q = questions[currentIdx];
    const selected = answers[currentIdx];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="flex items-center justify-between text-white/70 text-sm mb-3">
            <span>{currentIdx + 1} / {questions.length}</span>
            <span className="font-bold text-amber-300">⭐ {currentIdx * XP_PER_CORRECT}</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(currentIdx / questions.length) * 100}%` }} />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <TimerBar key={timerKey} duration={QUESTION_TIME} onExpire={() => { if (selected === undefined) { setAnswers(a => ({ ...a, [currentIdx]: '__expired__' })); setAnswerTime(t => ({ ...t, [currentIdx]: QUESTION_TIME })); } }} />

            <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-2">Question {currentIdx + 1}</p>
            <h3 className="text-base font-bold text-gray-900 leading-snug mb-5">{q.q}</h3>

            <div className="space-y-2.5">
              {Object.entries(q.options || {}).map(([key, val]) => {
                const isSelected = selected === key;
                const isCorrect = selected !== undefined && key === q.answer;
                const isWrong = selected !== undefined && selected === key && key !== q.answer;
                return (
                  <button key={key} onClick={() => handleAnswer(key)} disabled={selected !== undefined}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm font-medium flex items-center gap-3 ${isCorrect ? 'border-green-400 bg-green-50 text-green-800' : isWrong ? 'border-red-400 bg-red-50 text-red-700' : isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}>
                    <span className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-500 text-white' : isWrong ? 'bg-red-500 text-white' : isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{key}</span>
                    {val}
                    {isCorrect && <CheckCircle className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />}
                    {isWrong && <XCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {q.ref && selected !== undefined && (
              <div className="mt-3 bg-amber-50 rounded-xl p-3 text-xs text-amber-800 border border-amber-100">
                📖 {q.ref}
              </div>
            )}

            {selected !== undefined && (
              <Button onClick={handleNext} className="w-full mt-4 bg-indigo-700 hover:bg-indigo-800 gap-2">
                {currentIdx + 1 >= questions.length ? '🏆 See Results' : <>Next <ChevronRight className="w-4 h-4" /></>}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Home Screen ───────────────────────────────────────────────
  const xp = userPoints?.total_xp || 0;
  const lv = xpToLevel(xp);
  const streak = userPoints?.current_streak || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-lg mx-auto px-4 py-8 pb-24 space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-2">📖</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Daily Bible Quiz</h1>
          {todayVerse ? (
            <div className="mt-2 bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
              <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">Today's Verse Challenge</p>
              <p className="text-sm text-gray-700 italic">"{todayVerse.verseText}"</p>
              <p className="text-xs text-indigo-600 font-semibold mt-1">— {todayVerse.reference}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mt-1">5 questions · personalized from your reading history</p>
          )}
        </div>

        {/* User stats */}
        {user && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-lg">{lv}</div>
              <div>
                <p className="font-extrabold text-gray-900">{user.full_name?.split(' ')[0] || 'Scholar'}</p>
                <p className="text-xs text-indigo-600 font-bold">Level {lv} · {LEVEL_NAMES[lv]}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-black text-indigo-600">{xp}</p>
                <p className="text-xs text-gray-400">Total XP</p>
              </div>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, (xp / xpForNextLevel(xp)) * 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{xp} XP</span><span>{xpForNextLevel(xp)} XP for Level {lv + 1}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center"><p className="text-lg font-black text-amber-500">🔥 {streak}</p><p className="text-xs text-gray-400">Streak</p></div>
              <div className="text-center"><p className="text-lg font-black text-green-600">{userPoints?.quizzes_completed || 0}</p><p className="text-xs text-gray-400">Quizzes</p></div>
              <div className="text-center"><p className="text-lg font-black text-indigo-600">{userPoints?.total_correct || 0}</p><p className="text-xs text-gray-400">Correct</p></div>
            </div>
          </div>
        )}

        {/* Start button */}
        <Button onClick={user ? generateQuiz : () => base44.auth.redirectToLogin()} disabled={generating}
          className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg font-extrabold gap-2 rounded-2xl shadow-lg">
          {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating quiz…</> : user ? <><Zap className="w-5 h-5" /> Start Today's Quiz</> : 'Sign In to Play'}
        </Button>

        {readingHistory.length > 0 && (
          <p className="text-xs text-center text-indigo-600">Quiz personalized from your reading history ({readingHistory.length} chapters read)</p>
        )}

        {/* Leaderboard */}
        <QuizLeaderboard user={user} />
      </div>
    </div>
  );
}