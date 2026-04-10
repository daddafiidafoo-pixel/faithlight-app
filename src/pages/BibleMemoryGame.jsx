import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, Trophy, Zap, Shuffle, PenLine, X, Check, RotateCcw, Star, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Helpers ───────────────────────────────────────────────────────
function maskWords(text, maskPct = 0.4) {
  const words = text.split(' ');
  const count = Math.max(1, Math.floor(words.length * maskPct));
  const indices = new Set();
  while (indices.size < count) indices.add(Math.floor(Math.random() * words.length));
  return words.map((w, i) => indices.has(i) ? { word: w, blank: true } : { word: w, blank: false });
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Fill-in-the-Blanks Game ───────────────────────────────────────
function FillBlanksGame({ verse, onScore, onNext }) {
  const masked = useCallback(() => maskWords(verse.verse_text), [verse.id]);
  const [parts] = useState(() => masked());
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [startTime] = useState(Date.now());

  const blanks = parts.filter(p => p.blank);
  const correct = blanks.filter((p, i) => (answers[i] || '').trim().toLowerCase() === p.word.toLowerCase());

  const handleCheck = () => {
    setChecked(true);
    const elapsed = (Date.now() - startTime) / 1000;
    const speedBonus = Math.max(0, 30 - Math.floor(elapsed));
    const score = correct.length * 10 + speedBonus;
    onScore(score, correct.length, blanks.length);
  };

  let blankIdx = 0;
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl max-w-lg w-full mx-auto">
      <p className="text-indigo-600 font-bold text-lg mb-1 text-center">{verse.verse_ref}</p>
      <p className="text-xs text-gray-400 text-center mb-5">Fill in the missing words</p>

      <div className="flex flex-wrap gap-1.5 mb-6 leading-loose text-base text-gray-800">
        {parts.map((p, i) => {
          if (!p.blank) return <span key={i}>{p.word}</span>;
          const idx = blankIdx++;
          const isCorrect = checked && answers[idx]?.trim().toLowerCase() === p.word.toLowerCase();
          const isWrong = checked && !isCorrect;
          return (
            <span key={i} className="inline-flex items-center gap-0.5">
              <input
                disabled={checked}
                value={answers[idx] || ''}
                onChange={e => setAnswers(a => ({ ...a, [idx]: e.target.value }))}
                className={`border-b-2 w-20 text-center text-sm outline-none transition-colors ${isCorrect ? 'border-green-400 text-green-700 bg-green-50' : isWrong ? 'border-red-400 text-red-600 bg-red-50' : 'border-indigo-300 text-indigo-700'}`}
                placeholder="___"
              />
              {checked && isWrong && <span className="text-xs text-green-600 font-bold">({p.word})</span>}
            </span>
          );
        })}
      </div>

      {!checked ? (
        <Button onClick={handleCheck} className="w-full bg-indigo-700 hover:bg-indigo-800 gap-2">
          <Check className="w-4 h-4" /> Check Answers
        </Button>
      ) : (
        <div className="space-y-3">
          <div className={`text-center rounded-xl p-3 ${correct.length === blanks.length ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            <p className="font-bold">{correct.length}/{blanks.length} correct</p>
          </div>
          <Button onClick={onNext} className="w-full bg-indigo-700 gap-2">Next Verse <ChevronRight className="w-4 h-4" /></Button>
        </div>
      )}
    </div>
  );
}

// ── Scrambled Word Game ───────────────────────────────────────────
function ScrambledGame({ verse, onScore, onNext }) {
  const words = verse.verse_text.split(' ');
  const [scrambled] = useState(() => shuffleArr(words.map((w, i) => ({ word: w, id: i }))));
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [startTime] = useState(Date.now());

  const remaining = scrambled.filter(w => !selected.find(s => s.id === w.id));

  const handleSelect = (w) => {
    if (checked) return;
    setSelected(s => [...s, w]);
  };
  const handleRemove = (id) => {
    if (checked) return;
    setSelected(s => s.filter(w => w.id !== id));
  };

  const handleCheck = () => {
    setChecked(true);
    const userSentence = selected.map(w => w.word).join(' ');
    const correct = userSentence.trim().toLowerCase() === verse.verse_text.trim().toLowerCase();
    const elapsed = (Date.now() - startTime) / 1000;
    const speedBonus = correct ? Math.max(0, 60 - Math.floor(elapsed)) : 0;
    onScore(correct ? 50 + speedBonus : 0, correct ? 1 : 0, 1);
  };

  const isCorrect = checked && selected.map(w => w.word).join(' ').toLowerCase() === verse.verse_text.toLowerCase();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl max-w-lg w-full mx-auto">
      <p className="text-indigo-600 font-bold text-lg mb-1 text-center">{verse.verse_ref}</p>
      <p className="text-xs text-gray-400 text-center mb-5">Tap words to rebuild the verse in order</p>

      {/* Answer area */}
      <div className="min-h-20 bg-indigo-50 rounded-2xl p-3 mb-4 flex flex-wrap gap-1.5 border-2 border-dashed border-indigo-200">
        {selected.length === 0 && <p className="text-indigo-300 text-sm m-auto">Tap words below…</p>}
        {selected.map(w => (
          <button key={w.id} onClick={() => handleRemove(w.id)}
            className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-all ${checked ? (isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            {w.word}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-1.5 mb-5 min-h-12">
        {remaining.map(w => (
          <button key={w.id} onClick={() => handleSelect(w)}
            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all">
            {w.word}
          </button>
        ))}
      </div>

      {!checked ? (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelected([])} className="gap-1.5 flex-shrink-0">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button onClick={handleCheck} disabled={selected.length === 0} className="flex-1 bg-indigo-700 gap-2">
            <Check className="w-4 h-4" /> Submit
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`rounded-xl p-3 text-center ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="font-bold">{isCorrect ? '🎉 Perfect order!' : '❌ Not quite right'}</p>
            {!isCorrect && <p className="text-xs mt-1">{verse.verse_text}</p>}
          </div>
          <Button onClick={onNext} className="w-full bg-indigo-700 gap-2">Next <ChevronRight className="w-4 h-4" /></Button>
        </div>
      )}
    </div>
  );
}

// ── Verse Ordering Game ───────────────────────────────────────────
// User drags/taps a shuffled list of verse segments back into the correct order.
const PASSAGE_SETS = [
  {
    ref: 'Psalm 23:1-4',
    verses: [
      { id: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { id: 2, text: 'He makes me lie down in green pastures.' },
      { id: 3, text: 'He leads me beside still waters.' },
      { id: 4, text: 'He restores my soul.' },
    ],
  },
  {
    ref: 'John 3:16-17',
    verses: [
      { id: 1, text: 'For God so loved the world that he gave his one and only Son,' },
      { id: 2, text: 'that whoever believes in him shall not perish but have eternal life.' },
      { id: 3, text: 'For God did not send his Son into the world to condemn the world,' },
      { id: 4, text: 'but to save the world through him.' },
    ],
  },
  {
    ref: 'Romans 8:38-39',
    verses: [
      { id: 1, text: 'For I am convinced that neither death nor life, neither angels nor demons,' },
      { id: 2, text: 'neither the present nor the future, nor any powers,' },
      { id: 3, text: 'neither height nor depth, nor anything else in all creation,' },
      { id: 4, text: 'will be able to separate us from the love of God.' },
    ],
  },
];

function VerseOrderGame({ onScore, onNext }) {
  const [passageIdx] = useState(() => Math.floor(Math.random() * PASSAGE_SETS.length));
  const passage = PASSAGE_SETS[passageIdx];
  const [order, setOrder] = useState(() => shuffleArr(passage.verses.map(v => ({ ...v }))));
  const [checked, setChecked] = useState(false);
  const [startTime] = useState(Date.now());
  const [dragging, setDragging] = useState(null);

  const moveUp = (idx) => {
    if (idx === 0 || checked) return;
    const next = [...order];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setOrder(next);
  };
  const moveDown = (idx) => {
    if (idx === order.length - 1 || checked) return;
    const next = [...order];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    setOrder(next);
  };

  const handleCheck = () => {
    setChecked(true);
    const correct = order.every((v, i) => v.id === passage.verses[i].id);
    const elapsed = (Date.now() - startTime) / 1000;
    const speedBonus = correct ? Math.max(0, 60 - Math.floor(elapsed)) : 0;
    onScore(correct ? 60 + speedBonus : order.filter((v, i) => v.id === passage.verses[i].id).length * 10, correct ? 1 : 0, 1);
  };

  const isFullyCorrect = checked && order.every((v, i) => v.id === passage.verses[i].id);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl max-w-lg w-full mx-auto">
      <p className="text-indigo-600 font-bold text-lg mb-1 text-center">{passage.ref}</p>
      <p className="text-xs text-gray-400 text-center mb-5">Arrange the verses in the correct order</p>

      <div className="space-y-2 mb-6">
        {order.map((v, i) => {
          const isCorrectPos = checked && v.id === passage.verses[i].id;
          const isWrongPos = checked && v.id !== passage.verses[i].id;
          return (
            <div key={v.id} className={`flex items-center gap-2 rounded-xl border-2 p-3 transition-all ${
              isCorrectPos ? 'border-green-400 bg-green-50' : isWrongPos ? 'border-red-300 bg-red-50' : 'border-indigo-100 bg-indigo-50/50'
            }`}>
              <span className={`text-xs font-bold w-5 text-center flex-shrink-0 ${isCorrectPos ? 'text-green-600' : isWrongPos ? 'text-red-500' : 'text-indigo-400'}`}>{i + 1}</span>
              <p className="flex-1 text-sm text-gray-800 leading-snug">{v.text}</p>
              {!checked && (
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="p-0.5 text-indigo-300 hover:text-indigo-600 disabled:opacity-20 transition-colors">▲</button>
                  <button onClick={() => moveDown(i)} disabled={i === order.length - 1} className="p-0.5 text-indigo-300 hover:text-indigo-600 disabled:opacity-20 transition-colors">▼</button>
                </div>
              )}
              {checked && (isCorrectPos ? <span className="text-green-500">✓</span> : <span className="text-red-400">✗</span>)}
            </div>
          );
        })}
      </div>

      {!checked ? (
        <Button onClick={handleCheck} className="w-full bg-indigo-700 hover:bg-indigo-800 gap-2">
          <Check className="w-4 h-4" /> Check Order
        </Button>
      ) : (
        <div className="space-y-3">
          <div className={`text-center rounded-xl p-3 font-bold ${isFullyCorrect ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {isFullyCorrect ? '🎉 Perfect order!' : '📖 Correct order shown above'}
          </div>
          {!isFullyCorrect && (
            <div className="space-y-1">
              {passage.verses.map((v, i) => (
                <p key={v.id} className="text-xs text-gray-500"><span className="font-bold text-gray-700">{i + 1}.</span> {v.text}</p>
              ))}
            </div>
          )}
          <Button onClick={onNext} className="w-full bg-indigo-700 gap-2">Next <ChevronRight className="w-4 h-4" /></Button>
        </div>
      )}
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────
function Leaderboard({ scores, user }) {
  const sorted = [...scores].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4">
        <h3 className="text-white font-extrabold flex items-center gap-2"><Trophy className="w-5 h-5" /> Top Memorizers</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {sorted.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No scores yet — be the first!</p>}
        {sorted.map((s, i) => (
          <div key={s.id} className={`flex items-center gap-3 px-5 py-3 ${s.user_id === user?.id ? 'bg-indigo-50' : ''}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-extrabold ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{s.created_by?.split('@')[0] || 'Anonymous'}</p>
              <p className="text-xs text-gray-400">{s.game_mode} · {new Date(s.created_date).toLocaleDateString()}</p>
            </div>
            <span className="font-extrabold text-indigo-600">{s.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function BibleMemoryGame() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [mode, setMode] = useState(null); // null | 'fill' | 'scramble' | 'order'
  const [gameVerses, setGameVerses] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {}).finally(() => setAuthChecked(true));
  }, []);

  // Load user's memory verses
  const { data: verses = [], isLoading } = useQuery({
    queryKey: ['memory-verses', user?.id],
    enabled: !!user,
    queryFn: () => base44.entities.MemoryVerse.filter({ user_id: user.id }, '-created_date'),
  });

  // Load highlighted verses as fallback
  const { data: highlights = [] } = useQuery({
    queryKey: ['highlights-for-game', user?.id],
    enabled: !!user && verses.length === 0,
    queryFn: () => base44.entities.VerseHighlight.filter({ user_id: user.id }, '-created_date', 20),
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['game-leaderboard'],
    queryFn: () => base44.entities.UserAchievement.filter({ achievement_type: 'memory_game' }, '-score', 20).catch(() => []),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.UserAchievement.create(data).catch(() => null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['game-leaderboard'] }),
  });

  const startGame = (gameMode) => {
    if (gameMode === 'order') {
      setGameVerses([{ verse_ref: 'ordering', verse_text: 'ordering' }]); // dummy — VerseOrderGame picks its own passage
      setCurrentIdx(0); setSessionScore(0); setSessionCorrect(0); setSessionTotal(0); setDone(false);
      setMode('order'); return;
    }
    const pool = verses.length > 0
      ? verses.map(v => ({ verse_ref: v.verse_ref, verse_text: v.verse_text }))
      : highlights.map(h => ({ verse_ref: h.reference, verse_text: h.verse_text })).filter(v => v.verse_text?.length > 20);

    if (pool.length === 0) return;
    setGameVerses(shuffleArr(pool).slice(0, 5));
    setCurrentIdx(0);
    setSessionScore(0);
    setSessionCorrect(0);
    setSessionTotal(0);
    setDone(false);
    setMode(gameMode);
  };

  const handleScore = (pts, correct, total) => {
    setSessionScore(s => s + pts);
    setSessionCorrect(s => s + correct);
    setSessionTotal(s => s + total);
  };

  const handleNext = () => {
    if (currentIdx + 1 >= gameVerses.length) {
      // Save score
      if (user) {
        saveMutation.mutate({
          user_id: user.id,
          achievement_type: 'memory_game',
          game_mode: mode === 'fill' ? 'Fill Blanks' : mode === 'order' ? 'Verse Ordering' : 'Scramble',
          score: sessionScore,
          correct: sessionCorrect,
          total: sessionTotal,
        });
      }
      setDone(true);
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  if (!authChecked) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-extrabold mb-2">Bible Memory Game</h2>
          <p className="text-indigo-200 mb-6">Sign in to play and compete on the leaderboard</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-white text-indigo-700 hover:bg-gray-100 font-bold">Sign In</Button>
        </div>
      </div>
    );
  }

  // Done screen
  if (done) {
    const pct = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-5xl mb-3">{pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'}</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Session Complete!</h2>
          <p className="text-gray-500 mb-5">{gameVerses.length} verses · {mode === 'fill' ? 'Fill Blanks' : mode === 'order' ? 'Verse Ordering' : 'Scramble'}</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-indigo-50 rounded-xl p-3"><p className="text-2xl font-black text-indigo-600">{sessionScore}</p><p className="text-xs text-indigo-500">Score</p></div>
            <div className="bg-green-50 rounded-xl p-3"><p className="text-2xl font-black text-green-600">{sessionCorrect}</p><p className="text-xs text-green-500">Correct</p></div>
            <div className="bg-amber-50 rounded-xl p-3"><p className="text-2xl font-black text-amber-600">{pct}%</p><p className="text-xs text-amber-500">Accuracy</p></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => startGame(mode)} className="flex-1 gap-1.5"><RotateCcw className="w-4 h-4" /> Play Again</Button>
            <Button onClick={() => setMode(null)} className="flex-1 bg-indigo-700 gap-1.5">Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  // Active game
  if (mode && gameVerses.length > 0) {
    const verse = gameVerses[currentIdx];
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg mb-4">
          <div className="flex items-center justify-between text-white/70 text-sm mb-2">
            <button onClick={() => setMode(null)} className="hover:text-white"><X className="w-5 h-5" /></button>
            <span>{currentIdx + 1} / {gameVerses.length}</span>
            <span className="font-bold text-amber-300">⭐ {sessionScore}</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(currentIdx / gameVerses.length) * 100}%` }} />
          </div>
        </div>
        {mode === 'fill'
          ? <FillBlanksGame verse={verse} onScore={handleScore} onNext={handleNext} />
          : mode === 'order'
          ? <VerseOrderGame onScore={handleScore} onNext={handleNext} />
          : <ScrambledGame verse={verse} onScore={handleScore} onNext={handleNext} />}
      </div>
    );
  }

  const allVerses = verses.length > 0 ? verses : highlights.map(h => ({ verse_ref: h.reference, verse_text: h.verse_text })).filter(v => v.verse_text);
  const hasVerses = allVerses.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <div className="text-5xl mb-2">🧠</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Bible Memory Game</h1>
          <p className="text-gray-500 text-sm mt-1">Test your Scripture knowledge</p>
          {allVerses.length > 0 && <p className="text-xs text-indigo-600 mt-1">{allVerses.length} verse{allVerses.length !== 1 ? 's' : ''} in your library</p>}
        </div>

        {/* Game Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => hasVerses && startGame('fill')} disabled={!hasVerses}
            className={`rounded-2xl p-6 text-left transition-all shadow-sm border ${hasVerses ? 'bg-white hover:shadow-md hover:border-indigo-200 cursor-pointer' : 'bg-gray-50 opacity-50 cursor-not-allowed border-gray-100'}`}>
            <div className="text-3xl mb-3">✏️</div>
            <h3 className="font-extrabold text-gray-900 mb-1">Fill in the Blanks</h3>
            <p className="text-sm text-gray-500">Key words are hidden — type them from memory</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-bold">
              <Zap className="w-3.5 h-3.5" /> Speed bonus points!
            </div>
          </button>

          <button onClick={() => hasVerses && startGame('scramble')} disabled={!hasVerses}
            className={`rounded-2xl p-6 text-left transition-all shadow-sm border ${hasVerses ? 'bg-white hover:shadow-md hover:border-purple-200 cursor-pointer' : 'bg-gray-50 opacity-50 cursor-not-allowed border-gray-100'}`}>
            <div className="text-3xl mb-3">🔀</div>
            <h3 className="font-extrabold text-gray-900 mb-1">Scrambled Words</h3>
            <p className="text-sm text-gray-500">Tap words in the correct order to rebuild the verse</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-purple-600 font-bold">
              <Shuffle className="w-3.5 h-3.5" /> 50 pts for perfect order
            </div>
          </button>

          <button onClick={() => startGame('order')}
            className="rounded-2xl p-6 text-left transition-all shadow-sm border bg-white hover:shadow-md hover:border-green-200 cursor-pointer col-span-1 sm:col-span-2">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-extrabold text-gray-900 mb-1">Verse Ordering</h3>
            <p className="text-sm text-gray-500">Reorder shuffled passage verses into the correct biblical sequence</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-green-600 font-bold">
              <Star className="w-3.5 h-3.5" /> 60 pts + speed bonus
            </div>
          </button>
        </div>

        {!hasVerses && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 text-center">
            Add verses to your <a href="/MemoryVerses" className="font-bold underline">Memory Verses</a> library or highlight verses in the Bible reader to play!
          </div>
        )}

        {/* Leaderboard */}
        <Leaderboard scores={leaderboard} user={user} />
      </div>
    </div>
  );
}