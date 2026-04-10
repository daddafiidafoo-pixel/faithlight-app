import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Zap, CheckCircle, XCircle, RefreshCw, Star, Crown, ChevronRight, Loader2, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// ── XP helpers (localStorage) ────────────────────────────────────────────────
const XP_KEY = 'fl_quiz_xp';
const LB_KEY = 'fl_quiz_leaderboard';

function getMyXP(email) {
  try { return JSON.parse(localStorage.getItem(XP_KEY) || '{}')[email] || 0; } catch { return 0; }
}
function addXP(email, amount) {
  try {
    const all = JSON.parse(localStorage.getItem(XP_KEY) || '{}');
    all[email] = (all[email] || 0) + amount;
    localStorage.setItem(XP_KEY, JSON.stringify(all));
    // Update weekly leaderboard
    const lb = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
    const entry = lb.find(e => e.email === email);
    if (entry) { entry.xp += amount; entry.updatedAt = Date.now(); }
    else lb.push({ email, name: email.split('@')[0], xp: amount, updatedAt: Date.now() });
    lb.sort((a, b) => b.xp - a.xp);
    localStorage.setItem(LB_KEY, JSON.stringify(lb.slice(0, 50)));
    return all[email];
  } catch { return 0; }
}
function getLeaderboard() {
  try {
    const raw = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
    // Filter to this week
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    return raw.filter(e => e.updatedAt > weekAgo).slice(0, 10);
  } catch { return []; }
}

const TOPICS = [
  { id: 'creation', label: 'Creation & Genesis', emoji: '🌍' },
  { id: 'psalms', label: 'Psalms & Worship', emoji: '🎶' },
  { id: 'gospels', label: 'Life of Jesus', emoji: '✝️' },
  { id: 'proverbs', label: 'Wisdom & Proverbs', emoji: '📜' },
  { id: 'prophecy', label: 'Prophecy & Revelation', emoji: '🔮' },
  { id: 'acts', label: 'Early Church & Acts', emoji: '🕊️' },
];

const XP_PER_CORRECT = 20;
const XP_STREAK_BONUS = 10;

// ── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ question, onAnswer, answered, selectedIdx, timeLeft }) {
  const pct = (timeLeft / 20) * 100;
  return (
    <div className="space-y-4">
      {/* Timer bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{timeLeft}s left</span>
        <span className="flex items-center gap-1"><Zap size={11} className="text-yellow-500" />{XP_PER_CORRECT} XP</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="font-semibold text-gray-900 text-base leading-relaxed">{question.question}</p>
        {question.reference && (
          <p className="text-xs text-indigo-400 mt-1.5 italic">📖 {question.reference}</p>
        )}
      </div>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let style = 'bg-white border-gray-200 text-gray-800';
          if (answered !== undefined) {
            if (i === question.correctIndex) style = 'bg-green-50 border-green-400 text-green-800';
            else if (i === answered && answered !== question.correctIndex) style = 'bg-red-50 border-red-400 text-red-700';
            else style = 'bg-gray-50 border-gray-100 text-gray-400';
          }
          return (
            <button
              key={i}
              onClick={() => !answered && onAnswer(i)}
              disabled={answered !== undefined}
              className={`w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium text-sm transition-all ${style} ${answered === undefined ? 'hover:border-indigo-400 hover:bg-indigo-50' : ''}`}
            >
              <span className="inline-flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {answered !== undefined && i === question.correctIndex && <CheckCircle size={15} className="text-green-500 ml-auto" />}
                {answered !== undefined && i === answered && answered !== question.correctIndex && <XCircle size={15} className="text-red-400 ml-auto" />}
              </span>
            </button>
          );
        })}
      </div>

      {answered !== undefined && question.explanation && (
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
          <strong>💡 </strong>{question.explanation}
        </div>
      )}
    </div>
  );
}

// ── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({ score, total, xpEarned, streak, onRetry, onBack, myTotalXP, email }) {
  const pct = Math.round((score / total) * 100);
  const medal = pct >= 80 ? '🥇' : pct >= 60 ? '🥈' : pct >= 40 ? '🥉' : '📖';
  return (
    <div className="text-center space-y-5 py-4">
      <div className="text-6xl">{medal}</div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Job!' : 'Keep Practicing!'}</h2>
        <p className="text-gray-500 mt-1">{score} / {total} correct</p>
      </div>
      <div className="flex justify-center gap-4">
        <div className="bg-indigo-50 rounded-2xl px-6 py-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">+{xpEarned}</p>
          <p className="text-xs text-indigo-400">XP Earned</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl px-6 py-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{myTotalXP}</p>
          <p className="text-xs text-yellow-500">Total XP</p>
        </div>
        {streak > 1 && (
          <div className="bg-orange-50 rounded-2xl px-6 py-4 text-center">
            <p className="text-2xl font-bold text-orange-500">🔥{streak}</p>
            <p className="text-xs text-orange-400">Streak</p>
          </div>
        )}
      </div>
      <div className="space-y-2 pt-2">
        <button onClick={onRetry} className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2">
          <RefreshCw size={16} /> Try Another Topic
        </button>
        <button onClick={onBack} className="w-full py-3 border border-gray-200 text-gray-600 rounded-2xl font-medium text-sm hover:bg-gray-50">
          View Leaderboard
        </button>
      </div>
    </div>
  );
}

// ── Leaderboard Panel ────────────────────────────────────────────────────────
function LeaderboardPanel({ currentEmail }) {
  const entries = getLeaderboard();
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Users size={16} className="text-yellow-500" />
        <h3 className="font-bold text-gray-900">Weekly Top Contributors</h3>
      </div>
      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          <Trophy size={28} className="mx-auto mb-2 text-gray-200" />
          No scores yet — be the first!
        </div>
      ) : (
        entries.map((e, i) => (
          <div key={e.email} className={`flex items-center gap-3 p-3.5 rounded-xl ${e.email === currentEmail ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border border-gray-100'}`}>
            <span className="text-lg w-6 text-center">{medals[i] || `#${i + 1}`}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm truncate ${e.email === currentEmail ? 'text-indigo-700' : 'text-gray-800'}`}>
                {e.name}{e.email === currentEmail && ' (You)'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={13} className="text-yellow-500" />
              <span className="font-bold text-gray-700 text-sm">{e.xp}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuizChallenge() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home | playing | results | leaderboard
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [answered, setAnswered] = useState(undefined);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);
  const [myTotalXP, setMyTotalXP] = useState(0);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setMyTotalXP(getMyXP(u.email));
    }).catch(() => setUser({ email: 'guest@faithlight.app', full_name: 'Guest' }));
  }, []);

  // Timer
  useEffect(() => {
    if (!timerActive || answered !== undefined) return;
    if (timeLeft <= 0) {
      handleAnswer(-1); // timeout = wrong
      return;
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeLeft, answered]);

  const fetchQuestions = async (topic) => {
    setLoadingQ(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 multiple-choice Bible quiz questions about "${topic.label}". 
Each question should test genuine Bible knowledge.
Return ONLY a JSON array (no markdown) like:
[{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "Brief explanation of the correct answer",
  "reference": "Book Chapter:Verse (optional)"
}]`,
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
                  explanation: { type: 'string' },
                  reference: { type: 'string' },
                }
              }
            }
          }
        }
      });
      // The LLM might return questions directly as array or nested
      let qs = res?.questions || res;
      if (!Array.isArray(qs)) qs = Object.values(res || {})[0] || [];
      if (!qs.length) throw new Error('No questions returned');
      return qs.slice(0, 5);
    } catch (e) {
      // Fallback questions
      return [
        { question: 'How many books are in the Bible?', options: ['60', '64', '66', '72'], correctIndex: 2, explanation: '66 books — 39 in the Old Testament and 27 in the New Testament.', reference: '' },
        { question: 'Who wrote most of the Psalms?', options: ['Solomon', 'Moses', 'David', 'Asaph'], correctIndex: 2, explanation: 'David is credited with writing 73 of the 150 Psalms.', reference: 'Psalms' },
        { question: 'What was the first miracle Jesus performed?', options: ['Healing a blind man', 'Feeding 5000', 'Turning water into wine', 'Raising Lazarus'], correctIndex: 2, explanation: 'Jesus turned water into wine at the wedding in Cana (John 2:1-11).', reference: 'John 2:1-11' },
        { question: 'Which disciple denied Jesus three times?', options: ['John', 'Peter', 'Thomas', 'Judas'], correctIndex: 1, explanation: 'Peter denied Jesus three times before the rooster crowed (Luke 22:61).', reference: 'Luke 22:61' },
        { question: 'Where was Jesus born?', options: ['Nazareth', 'Jerusalem', 'Jericho', 'Bethlehem'], correctIndex: 3, explanation: 'Jesus was born in Bethlehem, as prophesied in Micah 5:2.', reference: 'Matthew 2:1' },
      ];
    } finally {
      setLoadingQ(false);
    }
  };

  const startQuiz = async (topic) => {
    setSelectedTopic(topic);
    setView('playing');
    setCurrentQ(0);
    setAnswers([]);
    setXpEarned(0);
    setStreak(0);
    setAnswered(undefined);
    const qs = await fetchQuestions(topic);
    setQuestions(qs);
    setTimeLeft(20);
    setTimerActive(true);
  };

  const handleAnswer = useCallback((idx) => {
    if (!questions[currentQ]) return;
    setTimerActive(false);
    setAnswered(idx);
    const correct = idx === questions[currentQ].correctIndex;
    const newAnswers = [...answers, { idx, correct }];
    setAnswers(newAnswers);

    let xp = 0;
    let newStreak = streak;
    if (correct) {
      newStreak = streak + 1;
      xp = XP_PER_CORRECT + (newStreak > 1 ? XP_STREAK_BONUS : 0);
      setStreak(newStreak);
      setXpEarned(prev => prev + xp);
      if (user) addXP(user.email, xp);
      toast.success(`+${xp} XP${newStreak > 1 ? ` 🔥 ${newStreak} streak!` : ''}`, { duration: 1500 });
    } else {
      setStreak(0);
    }

    // Advance after delay
    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        // Done
        const finalXP = user ? getMyXP(user.email) : 0;
        setMyTotalXP(finalXP);
        setView('results');
        setTimerActive(false);
      } else {
        setCurrentQ(q => q + 1);
        setAnswered(undefined);
        setTimeLeft(20);
        setTimerActive(true);
      }
    }, 1800);
  }, [questions, currentQ, answers, streak, user]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="animate-spin mr-2" />Loading...</div>;
  }

  const score = answers.filter(a => a.correct).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy size={24} /> Quiz Challenge
            </h1>
            <button onClick={() => setView(view === 'leaderboard' ? 'home' : 'leaderboard')}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-sm font-medium">
              <Crown size={14} /> Board
            </button>
          </div>
          <p className="text-indigo-200 text-sm">Earn XP for correct answers · Weekly rankings</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="bg-white/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-sm">
              <Zap size={14} className="text-yellow-300" />
              <span className="font-bold">{myTotalXP} XP</span>
            </div>
            <div className="text-indigo-200 text-xs">Your total score</div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Loading */}
        {loadingQ && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Generating AI questions…</p>
            <p className="text-xs text-gray-300 mt-1">Powered by FaithLight AI</p>
          </div>
        )}

        {/* Leaderboard */}
        {!loadingQ && view === 'leaderboard' && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <LeaderboardPanel currentEmail={user.email} />
            <button onClick={() => setView('home')} className="w-full mt-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">
              ← Back to Topics
            </button>
          </div>
        )}

        {/* Home — topic selection */}
        {!loadingQ && view === 'home' && (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-gray-500 font-medium px-1">Choose a topic to begin:</p>
            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => startQuiz(topic)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:border-indigo-300 hover:shadow-md transition-all text-left"
              >
                <span className="text-3xl">{topic.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{topic.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">5 AI-generated questions · Up to {5 * XP_PER_CORRECT + 4 * XP_STREAK_BONUS} XP</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            ))}
          </div>
        )}

        {/* Playing */}
        {!loadingQ && view === 'playing' && questions.length > 0 && (
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-gray-500 font-medium">Question {currentQ + 1} of {questions.length}</p>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < currentQ ? 'bg-green-400' : i === currentQ ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
            <QuestionCard
              question={questions[currentQ]}
              onAnswer={handleAnswer}
              answered={answered}
              selectedIdx={answered}
              timeLeft={timeLeft}
            />
          </div>
        )}

        {/* Results */}
        {!loadingQ && view === 'results' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-2">
            <ResultsScreen
              score={score}
              total={questions.length}
              xpEarned={xpEarned}
              streak={streak}
              onRetry={() => setView('home')}
              onBack={() => setView('leaderboard')}
              myTotalXP={myTotalXP}
              email={user.email}
            />
          </div>
        )}
      </div>
    </div>
  );
}