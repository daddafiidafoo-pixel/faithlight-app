import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, XCircle, Brain } from 'lucide-react';

export default function PlanFlashcardQuiz({ plan }) {
  const [mode, setMode] = useState('idle'); // idle | loading | quiz | done
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState([]); // 'know' | 'review'

  const planDays = plan?.days || [];
  const topics = planDays.slice(0, 5).map(d => d.label).join(', ');

  const generate = async () => {
    setMode('loading');
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create 6 Bible study flashcards for a reading plan covering: ${topics}.
Plan title: "${plan.title}"

Each card should test understanding of a key biblical concept, verse, or theme from this plan.

Return JSON with array of cards. Each card has:
- front: a concise question or prompt (1 sentence)
- back: the answer with a brief explanation and relevant Bible reference (2-3 sentences)
- difficulty: "easy" | "medium" | "hard"`,
        response_json_schema: {
          type: 'object',
          properties: {
            cards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  front: { type: 'string' },
                  back: { type: 'string' },
                  difficulty: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setCards(result.cards || []);
      setIdx(0);
      setFlipped(false);
      setResults([]);
      setMode('quiz');
    } catch {
      setMode('idle');
    }
  };

  const answer = (result) => {
    setResults(prev => [...prev, result]);
    setFlipped(false);
    setTimeout(() => {
      if (idx + 1 >= cards.length) {
        setMode('done');
      } else {
        setIdx(i => i + 1);
      }
    }, 200);
  };

  const reset = () => { setMode('idle'); setCards([]); setResults([]); setIdx(0); setFlipped(false); };

  const known = results.filter(r => r === 'know').length;
  const diffColor = { easy: 'bg-green-100 text-green-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

  if (mode === 'idle') return (
    <Button variant="outline" size="sm" onClick={generate} className="gap-2 mt-3">
      <Brain className="w-4 h-4" /> Test Yourself with Flashcards
    </Button>
  );

  if (mode === 'loading') return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
      <Loader2 className="w-4 h-4 animate-spin" /> Generating flashcards...
    </div>
  );

  if (mode === 'done') {
    const pct = Math.round((known / cards.length) * 100);
    return (
      <Card className="mt-3 border-indigo-100">
        <CardContent className="p-5 text-center">
          <div className={`text-5xl mb-3`}>{pct >= 70 ? '🎉' : pct >= 40 ? '💪' : '📖'}</div>
          <h4 className="font-bold text-gray-900 text-lg mb-1">Quiz Complete!</h4>
          <p className="text-gray-500 text-sm mb-4">You knew {known}/{cards.length} cards ({pct}%)</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> New Quiz
            </Button>
            {results.filter(r => r === 'review').length > 0 && (
              <Button size="sm" onClick={() => { setResults([]); setIdx(0); setFlipped(false); setMode('quiz'); }} className="gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Retry Missed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const card = cards[idx];
  return (
    <Card className="mt-3 border-indigo-100">
      <CardContent className="p-4">
        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">{idx + 1} / {cards.length}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor[card.difficulty] || diffColor.medium}`}>
            {card.difficulty}
          </span>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">✕ Exit</button>
        </div>
        <div className="h-1 bg-gray-100 rounded-full mb-4">
          <div className="h-1 bg-indigo-500 rounded-full transition-all" style={{ width: `${((idx) / cards.length) * 100}%` }} />
        </div>

        {/* Flashcard */}
        <div
          onClick={() => setFlipped(f => !f)}
          className={`rounded-2xl p-5 cursor-pointer transition-all min-h-32 flex flex-col justify-center text-center border-2 ${
            flipped ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-900 hover:border-indigo-300'
          }`}>
          <p className="text-xs mb-2 font-medium opacity-60">{flipped ? 'Answer' : 'Question — tap to reveal'}</p>
          <p className="text-sm leading-relaxed font-medium">{flipped ? card.back : card.front}</p>
        </div>

        {/* Actions */}
        {flipped ? (
          <div className="flex gap-3 mt-4">
            <Button onClick={() => answer('review')} variant="outline" className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50">
              <XCircle className="w-4 h-4" /> Need Review
            </Button>
            <Button onClick={() => answer('know')} className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4" /> I Know This
            </Button>
          </div>
        ) : (
          <p className="text-center text-xs text-gray-400 mt-3">Tap the card to reveal the answer</p>
        )}
      </CardContent>
    </Card>
  );
}