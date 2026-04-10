import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Eye, CheckCircle2, Brain, TrendingUp, Zap } from 'lucide-react';

const RATING_LABELS = [
  { quality: 1, emoji: '😰', label: 'Forgot', color: 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200' },
  { quality: 3, emoji: '😐', label: 'Almost', color: 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200' },
  { quality: 5, emoji: '😊', label: 'Got it!', color: 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200' },
];

export default function FlashcardView({ verses, onReviewComplete, onExit }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);
  const [flipping, setFlipping] = useState(false);

  const current = verses[currentIdx];

  const learned = sessionResults.filter(r => r.quality >= 4).length;
  const learning = sessionResults.filter(r => r.quality < 4).length;

  const handleRate = (quality) => {
    setSessionResults(prev => [...prev, { verseRef: current.verse_ref, quality }]);
    onReviewComplete(current, quality);

    if (currentIdx + 1 >= verses.length) {
      setDone(true);
    } else {
      setFlipping(true);
      setTimeout(() => {
        setCurrentIdx(i => i + 1);
        setRevealed(false);
        setFlipping(false);
      }, 180);
    }
  };

  if (done) {
    const total = sessionResults.length;
    const learnedCount = sessionResults.filter(r => r.quality >= 4).length;
    const learningCount = total - learnedCount;
    const pct = Math.round((learnedCount / total) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Session Complete!</h2>
          <p className="text-gray-500 mb-6">You reviewed {total} verse{total !== 1 ? 's' : ''}</p>

          {/* Progress ring */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22C55E" strokeWidth="2.5"
                strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-extrabold text-gray-900">{pct}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{learnedCount}</div>
              <div className="text-xs text-green-700 font-medium">✅ Learned</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{learningCount}</div>
              <div className="text-xs text-blue-700 font-medium">🔄 Still Learning</div>
            </div>
          </div>

          {learningCount > 0 && (
            <p className="text-xs text-gray-500 mb-4 bg-amber-50 rounded-xl p-3 border border-amber-100">
              💡 {learningCount} verse{learningCount !== 1 ? 's' : ''} will appear sooner in your next session.
            </p>
          )}

          <Button onClick={onExit} className="w-full bg-indigo-700 hover:bg-indigo-800">Back to Verses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <button onClick={onExit} className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-green-300 font-bold">{learned} ✅</span>
          <span className="text-white/60">{currentIdx + 1}/{verses.length}</span>
          <span className="text-blue-300 font-bold">🔄 {learning}</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-white rounded-full transition-all duration-300"
          style={{ width: `${(currentIdx / verses.length) * 100}%` }} />
      </div>

      {/* Mastery badge */}
      <div className="flex justify-center mb-4">
        <span className={`text-xs font-bold px-3 py-1 rounded-full
          ${{ new: 'bg-gray-500/40 text-gray-200', learning: 'bg-blue-500/40 text-blue-200', reviewing: 'bg-amber-500/40 text-amber-200', mastered: 'bg-green-500/40 text-green-200' }[current.mastery_level] || 'bg-gray-500/40 text-gray-200'}`}>
          {current.mastery_level || 'new'}
        </span>
      </div>

      {/* Card */}
      <div className={`flex-1 flex items-center justify-center transition-opacity duration-150 ${flipping ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
          <p className="text-indigo-600 font-extrabold text-xl mb-1">{current.verse_ref}</p>
          {current.translation && (
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-5">{current.translation}</p>
          )}

          {!revealed ? (
            <>
              <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 mb-6 min-h-[110px] flex flex-col items-center justify-center gap-2 border border-indigo-100">
                <Brain className="w-8 h-8 text-indigo-300" />
                <p className="text-gray-400 text-sm">Try to recite this verse from memory…</p>
              </div>
              <Button onClick={() => setRevealed(true)} className="w-full bg-indigo-700 hover:bg-indigo-800 gap-2 text-base py-5">
                <Eye className="w-4 h-4" /> Reveal Verse
              </Button>
            </>
          ) : (
            <>
              <div className="bg-indigo-50 rounded-2xl p-5 mb-5 min-h-[110px] flex items-center border border-indigo-100">
                <p className="text-gray-800 text-base leading-relaxed text-left">{current.verse_text}</p>
              </div>
              <p className="text-gray-500 text-sm mb-4 font-medium">How well did you remember it?</p>
              <div className="grid grid-cols-3 gap-2">
                {RATING_LABELS.map(({ quality, emoji, label, color }) => (
                  <button key={quality} onClick={() => handleRate(quality)}
                    className={`${color} rounded-xl py-3 text-sm font-bold border transition-all active:scale-95`}>
                    <span className="block text-xl mb-0.5">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upcoming verse refs */}
      {verses.length > currentIdx + 1 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-white/30">Next: {verses[currentIdx + 1]?.verse_ref}</p>
        </div>
      )}
    </div>
  );
}