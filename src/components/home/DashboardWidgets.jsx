import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Star, RotateCcw, Check, X, ChevronRight, Zap } from 'lucide-react';

// ── 1. Verse of the Day Card ──────────────────────────────────────
const DAILY_VERSES = [
  { ref: 'Psalm 119:105', text: 'Your word is a lamp to my feet and a light to my path.' },
  { ref: 'John 3:16', text: 'For God so loved the world that He gave His one and only Son.' },
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
  { ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love Him.' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding.' },
  { ref: 'Isaiah 40:31', text: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles.' },
  { ref: 'Joshua 1:9', text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
];

export function DailyVerseWidget() {
  const dayIdx = new Date().getDay();
  const verse = DAILY_VERSES[dayIdx % DAILY_VERSES.length];
  const [saved, setSaved] = useState(false);

  const gradients = [
    'from-indigo-600 to-purple-700',
    'from-amber-500 to-orange-600',
    'from-teal-500 to-cyan-600',
    'from-rose-500 to-pink-600',
    'from-emerald-500 to-green-600',
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
  ];
  const gradient = gradients[dayIdx % gradients.length];

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg text-white mb-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Verse of the Day</span>
        </div>
        <button onClick={() => setSaved(v => !v)}
          className={`p-1.5 rounded-lg transition-all ${saved ? 'bg-amber-400 text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'}`}>
          {saved ? <Check className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
        </button>
      </div>
      <blockquote className="text-base font-medium leading-relaxed mb-3 text-white">
        "{verse.text}"
      </blockquote>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/70 font-bold">— {verse.ref}</span>
        <a href="/BibleReader" className="flex items-center gap-1 text-xs text-white/80 hover:text-white font-medium transition-colors">
          Read chapter <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

// ── 2. Reading Progress Circular Widget ──────────────────────────
function CircularProgress({ pct, size = 80, stroke = 8, color = '#6366F1' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
}

export function ReadingProgressWidget({ user }) {
  const { data: progress } = useQuery({
    queryKey: ['reading-progress-widget', user?.id],
    enabled: !!user,
    queryFn: () => base44.entities.ReadingProgress.filter({ user_id: user.id }, '-created_date', 1).then(r => r[0] || null).catch(() => null),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['reading-sessions-widget', user?.id],
    enabled: !!user,
    queryFn: () => base44.entities.ReadingSession.filter({ user_id: user.id }, '-created_date', 100).catch(() => []),
  });

  // Calculate overall Bible reading progress (1189 total chapters)
  const uniqueChapters = new Set(sessions.map(s => `${s.book_id}-${s.chapter_number}`)).size;
  const totalBibleChapters = 1189;
  const pct = Math.min(100, Math.round((uniqueChapters / totalBibleChapters) * 100));

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <CircularProgress pct={pct} color="#6366F1" />
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'none' }}>
            <span className="text-sm font-extrabold text-indigo-600">{pct}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-gray-900 text-sm">Bible Reading Progress</h3>
          <p className="text-xs text-gray-500 mt-0.5">{uniqueChapters} of {totalBibleChapters} chapters read</p>
          {progress?.last_book_id && (
            <p className="text-xs text-indigo-600 font-medium mt-1">
              Last: {progress.last_book_id} {progress.last_chapter}
            </p>
          )}
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <a href="/BibleReader" className="flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors">
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
        </a>
      </div>
    </div>
  );
}

// ── 3. Scripture Memory Quick-Recall Widget ───────────────────────
export function ScriptureMemoryWidget({ user }) {
  const [phase, setPhase] = useState('idle'); // idle | challenge | answered
  const [challenge, setChallenge] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState(null);

  const { data: memVerses = [] } = useQuery({
    queryKey: ['mem-verses-widget', user?.id],
    enabled: !!user,
    queryFn: () => base44.entities.MemoryVerse.filter({ user_id: user.id }, '-created_date', 20).catch(() => []),
  });

  const startChallenge = () => {
    if (memVerses.length === 0) return;
    const v = memVerses[Math.floor(Math.random() * memVerses.length)];
    // Blank out 3 random words
    const words = v.verse_text.split(' ');
    const blankedIdx = new Set();
    while (blankedIdx.size < Math.min(3, Math.floor(words.length * 0.3))) {
      blankedIdx.add(Math.floor(Math.random() * words.length));
    }
    const display = words.map((w, i) => blankedIdx.has(i) ? '___' : w).join(' ');
    setChallenge({ ...v, display, blankedWords: [...blankedIdx].map(i => words[i]) });
    setUserInput('');
    setResult(null);
    setPhase('challenge');
  };

  const checkAnswer = () => {
    if (!challenge) return;
    const userWords = userInput.trim().toLowerCase().split(/\s+/);
    const correct = challenge.blankedWords.map(w => w.toLowerCase());
    const matches = correct.filter(w => userWords.includes(w)).length;
    const score = Math.round((matches / correct.length) * 100);
    setResult({ score, matches, total: correct.length, correct: challenge.blankedWords });
    setPhase('answered');
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm">Scripture Memory</h3>
            <p className="text-xs text-gray-400">{memVerses.length} verse{memVerses.length !== 1 ? 's' : ''} to memorize</p>
          </div>
        </div>
        <a href="/MemoryVerses" className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-0.5">
          All <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {phase === 'idle' && (
        <div>
          {memVerses.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-xs text-gray-400 mb-2">No verses added yet</p>
              <a href="/MemoryVerses" className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors">+ Add Verses</a>
            </div>
          ) : (
            <button onClick={startChallenge}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-extrabold hover:from-amber-600 hover:to-orange-600 transition-all gap-2 flex items-center justify-center">
              <Zap className="w-4 h-4" /> Quick Recall Challenge
            </button>
          )}
        </div>
      )}

      {phase === 'challenge' && challenge && (
        <div>
          <div className="bg-indigo-50 rounded-xl p-3 mb-3">
            <p className="text-xs font-bold text-indigo-600 mb-1">{challenge.verse_ref}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{challenge.display}</p>
          </div>
          <p className="text-xs text-gray-500 mb-2">Type the missing words (space-separated):</p>
          <div className="flex gap-2">
            <input value={userInput} onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkAnswer()}
              placeholder="missing words…"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400" />
            <button onClick={checkAnswer} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setPhase('idle')} className="px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm hover:bg-gray-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {phase === 'answered' && result && challenge && (
        <div>
          <div className={`rounded-xl p-3 mb-3 ${result.score >= 80 ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
            <p className={`text-sm font-extrabold ${result.score >= 80 ? 'text-green-700' : 'text-amber-700'}`}>
              {result.score >= 80 ? '🎉 ' : '💪 '}{result.matches}/{result.total} words correct ({result.score}%)
            </p>
            <p className="text-xs text-gray-500 mt-1">Missing words: <span className="font-bold text-indigo-600">{result.correct.join(', ')}</span></p>
          </div>
          <div className="flex gap-2">
            <button onClick={startChallenge} className="flex-1 flex items-center justify-center gap-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">
              <RotateCcw className="w-3.5 h-3.5" /> Try Another
            </button>
            <button onClick={() => setPhase('idle')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs hover:bg-gray-200">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}