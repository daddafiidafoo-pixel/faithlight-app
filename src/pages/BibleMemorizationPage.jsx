import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Plus, Trash2, BookOpen, Check, X, AlertCircle, Star, ChevronRight, RotateCcw } from 'lucide-react';
import {
  loadDeck, addToDeck, removeFromDeck, reviewCard, getDueCards, getDeckStats
} from '@/lib/memorizationStore';
import { toast } from 'sonner';

// --- Masking logic ---
function maskWords(text, revealedIndices) {
  const words = text.split(' ');
  // Mask ~40% of words, preferring content words (longer than 3 chars)
  return words.map((word, i) => {
    if (revealedIndices.has(i)) return word;
    const clean = word.replace(/[^a-zA-Z]/g, '');
    if (clean.length > 3) return '_'.repeat(clean.length);
    return word;
  });
}

function FlashCard({ card, onReviewed }) {
  const words = card.text.split(' ');
  const [revealed, setRevealed] = useState(new Set());
  const [showFull, setShowFull] = useState(false);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'

  // Indices to mask (content words > 3 chars)
  const maskedIndices = words.reduce((acc, w, i) => {
    if (w.replace(/[^a-zA-Z]/g, '').length > 3) acc.push(i);
    return acc;
  }, []);

  const maskedWords = words.map((word, i) => {
    if (revealed.has(i) || showFull) return word;
    const clean = word.replace(/[^a-zA-Z]/g, '');
    if (maskedIndices.includes(i)) return { blank: true, index: i, original: word, len: clean.length };
    return word;
  });

  const allRevealed = maskedIndices.every(i => revealed.has(i));

  const checkInput = (wordIndex, originalWord) => {
    const clean = w => w.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (clean(input) === clean(originalWord)) {
      setRevealed(r => new Set([...r, wordIndex]));
      setFeedback('correct');
      setInput('');
      setTimeout(() => setFeedback(null), 800);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const handleScore = (quality) => {
    reviewCard(card.reference, quality);
    onReviewed(quality);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{card.reference}</span>
        <span className="text-xs text-gray-400">{maskedIndices.length - revealed.size} blanks left</span>
      </div>

      {/* Verse with blanks */}
      <div className="mb-6 min-h-[80px] flex flex-wrap gap-1 items-center leading-relaxed">
        {maskedWords.map((item, i) =>
          typeof item === 'string' ? (
            <span key={i} className="text-gray-800 text-base">{item}</span>
          ) : (
            <span
              key={i}
              className={`inline-block border-b-2 text-base font-mono text-center ${revealed.has(item.index) ? 'border-green-500 text-green-700' : 'border-indigo-400 text-transparent'}`}
              style={{ minWidth: item.len * 9, maxWidth: 120 }}
            >
              {revealed.has(item.index) ? item.original : '_'.repeat(item.len)}
            </span>
          )
        )}
      </div>

      {/* Input for next blank */}
      {!allRevealed && !showFull && (() => {
        const nextBlankIndex = maskedIndices.find(i => !revealed.has(i));
        if (nextBlankIndex === undefined) return null;
        const original = words[nextBlankIndex];
        return (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1.5">Type the missing word:</p>
            <div className="flex gap-2">
              <input
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkInput(nextBlankIndex, original)}
                placeholder="Type word…"
                className={`flex-1 border rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  feedback === 'correct' ? 'border-green-400 bg-green-50' :
                  feedback === 'wrong' ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              <button
                onClick={() => checkInput(nextBlankIndex, original)}
                className="px-3 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
              >
                ✓
              </button>
            </div>
            {feedback === 'correct' && <p className="text-xs text-green-600 mt-1">✓ Correct!</p>}
            {feedback === 'wrong' && <p className="text-xs text-red-500 mt-1">✗ Try again</p>}
          </div>
        );
      })()}

      {/* Reveal all */}
      {!showFull && (
        <button
          onClick={() => setShowFull(true)}
          className="text-xs text-gray-400 underline mb-4"
        >
          Show full verse
        </button>
      )}

      {/* Score buttons — show when all revealed or full shown */}
      {(allRevealed || showFull) && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-3 text-center">How well did you recall this?</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { q: 0, label: '😓 Forgot', color: 'bg-red-100 text-red-700' },
              { q: 1, label: '😅 Hard', color: 'bg-orange-100 text-orange-700' },
              { q: 2, label: '🙂 OK', color: 'bg-blue-100 text-blue-700' },
              { q: 3, label: '😄 Easy', color: 'bg-green-100 text-green-700' },
            ].map(s => (
              <button key={s.q} onClick={() => handleScore(s.q)} className={`py-2 rounded-xl text-xs font-semibold ${s.color}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AddVerseModal({ onClose, onAdded }) {
  const [reference, setReference] = useState('');
  const [text, setText] = useState('');
  const [bookName, setBookName] = useState('');

  const save = () => {
    if (!reference.trim() || !text.trim()) { toast.error('Fill in reference and verse text'); return; }
    addToDeck({ reference: reference.trim(), text: text.trim(), bookName: bookName.trim() });
    toast.success('Verse added to memorization deck!');
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Add Verse to Deck</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          <input
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="Reference (e.g. John 3:16)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            value={bookName}
            onChange={e => setBookName(e.target.value)}
            placeholder="Book name (e.g. John)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste the full verse text here…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm h-28 resize-none"
          />
          <button onClick={save} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold">
            Add to Deck
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BibleMemorizationPage() {
  const [deck, setDeck] = useState([]);
  const [stats, setStats] = useState({ total: 0, due: 0, learned: 0 });
  const [mode, setMode] = useState('deck'); // 'deck' | 'review'
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showAdd, setShowAdd] = useState(false);

  const refresh = useCallback(() => {
    setDeck(loadDeck());
    setStats(getDeckStats());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const startReview = () => {
    const due = getDueCards();
    if (due.length === 0) { toast.info('No cards due for review — check back later!'); return; }
    setReviewQueue(due);
    setReviewIndex(0);
    setMode('review');
  };

  const handleReviewed = (quality) => {
    refresh();
    if (reviewIndex + 1 >= reviewQueue.length) {
      setMode('done');
    } else {
      setReviewIndex(i => i + 1);
    }
  };

  const currentCard = reviewQueue[reviewIndex];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Memorization</h1>
            <p className="text-sm text-gray-500">Spaced repetition for Bible verses</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total', value: stats.total, color: 'bg-indigo-600', icon: BookOpen },
            { label: 'Due Today', value: stats.due, color: stats.due > 0 ? 'bg-amber-500' : 'bg-gray-300', icon: AlertCircle },
            { label: 'Learned', value: stats.learned, color: 'bg-green-500', icon: Star },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${s.color} rounded-2xl p-3 text-white text-center`}>
                <Icon size={16} className="mx-auto mb-1 opacity-80" />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs opacity-80">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Review / Done mode */}
        {mode === 'review' && currentCard && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setMode('deck')} className="text-sm text-gray-500 flex items-center gap-1">
                <RotateCcw size={13} /> Back to deck
              </button>
              <span className="text-xs text-gray-400">{reviewIndex + 1} / {reviewQueue.length}</span>
            </div>
            <FlashCard card={currentCard} onReviewed={handleReviewed} />
          </div>
        )}

        {mode === 'done' && (
          <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center mb-5">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="font-bold text-green-800 text-lg mb-1">Session Complete!</h2>
            <p className="text-green-600 text-sm">All due cards reviewed. Well done!</p>
            <button onClick={() => { setMode('deck'); refresh(); }} className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm">
              Back to Deck
            </button>
          </div>
        )}

        {mode === 'deck' && (
          <>
            {/* Start review */}
            <button
              onClick={startReview}
              disabled={stats.due === 0}
              className="w-full py-3.5 mb-5 bg-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Brain size={16} />
              {stats.due > 0 ? `Review ${stats.due} Due Card${stats.due > 1 ? 's' : ''}` : 'No Cards Due Right Now'}
            </button>

            {/* Deck list */}
            {deck.length === 0 ? (
              <div className="text-center py-16">
                <Brain className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Your deck is empty</p>
                <p className="text-gray-300 text-sm">Add verses you want to memorize</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Deck</p>
                {deck.map(card => {
                  const isDue = new Date(card.nextReview) <= new Date();
                  return (
                    <div key={card.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isDue ? 'bg-amber-400' : 'bg-green-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{card.reference}</p>
                        <p className="text-xs text-gray-500 truncate">{card.text}</p>
                        <p className="text-xs text-gray-300 mt-0.5">
                          {isDue ? '⏰ Due now' : `Next: ${new Date(card.nextReview).toLocaleDateString()}`} · {card.repetitions} reps
                        </p>
                      </div>
                      <button onClick={() => { removeFromDeck(card.reference); refresh(); }} className="p-1.5 text-red-300 hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {showAdd && <AddVerseModal onClose={() => setShowAdd(false)} onAdded={refresh} />}
      </div>
    </div>
  );
}