import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, XCircle, RotateCcw, Trophy, ChevronRight, Loader2, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const POPULAR_BOOKS = [
  { id: 'JHN', name: 'John', chapters: 21 },
  { id: 'PSA', name: 'Psalms', chapters: 150 },
  { id: 'GEN', name: 'Genesis', chapters: 50 },
  { id: 'ROM', name: 'Romans', chapters: 16 },
  { id: 'MAT', name: 'Matthew', chapters: 28 },
  { id: 'PRO', name: 'Proverbs', chapters: 31 },
  { id: 'ACT', name: 'Acts', chapters: 28 },
  { id: 'REV', name: 'Revelation', chapters: 22 },
  { id: 'ISA', name: 'Isaiah', chapters: 66 },
  { id: 'LUK', name: 'Luke', chapters: 24 },
  { id: 'EPH', name: 'Ephesians', chapters: 6 },
  { id: 'PHP', name: 'Philippians', chapters: 4 },
];

const DIFFICULTIES = [
  { value: 'easy', label: '🌱 Easy', desc: 'Basic comprehension' },
  { value: 'medium', label: '📖 Medium', desc: 'Deeper understanding' },
  { value: 'hard', label: '🔥 Hard', desc: 'Theological insight' },
];

function ScoreScreen({ score, total, questions, userAnswers, onRestart, onNew }) {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 80 ? { label: 'Excellent!', color: '#10B981', emoji: '🏆' }
    : pct >= 60 ? { label: 'Good Job!', color: '#F59E0B', emoji: '⭐' }
    : { label: 'Keep Studying', color: '#6C5CE7', emoji: '📚' };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
        <div className="text-5xl mb-3">{grade.emoji}</div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: grade.color }}>{grade.label}</h2>
        <p className="text-gray-500 text-sm mb-4">You scored {score} out of {total}</p>
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: grade.color }} />
        </div>
        <p className="text-2xl font-bold" style={{ color: grade.color }}>{pct}%</p>
      </div>

      {/* Review answers */}
      <div className="space-y-3">
        {questions.map((q, i) => {
          const selected = userAnswers[i];
          const correct = q.correct_answer;
          const isCorrect = selected === correct;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border">
              <div className="flex items-start gap-2 mb-2">
                {isCorrect ? <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />}
                <p className="text-sm font-medium text-gray-800">{q.question}</p>
              </div>
              {!isCorrect && (
                <div className="ml-6 space-y-1">
                  <p className="text-xs text-red-500">Your answer: {q.options[selected]}</p>
                  <p className="text-xs text-green-600">Correct: {q.options[correct]}</p>
                </div>
              )}
              {q.explanation && (
                <p className="text-xs text-gray-500 ml-6 mt-1 italic">{q.explanation}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onRestart}
          className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50">
          <RotateCcw size={15} /> Try Again
        </button>
        <button onClick={onNew}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B5CF6)' }}>
          <Sparkles size={15} /> New Quiz
        </button>
      </div>
    </div>
  );
}

export default function BibleQuizModule() {
  const [phase, setPhase] = useState('setup'); // setup | loading | quiz | score
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  const generateQuiz = async () => {
    if (!selectedBook) return;
    setPhase('loading');
    setError('');
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 Bible trivia questions about ${selectedBook.name} chapter ${selectedChapter} at ${difficulty} difficulty level. 
Each question should test understanding of the text, characters, themes, or theological meaning.
Return as JSON with a "questions" array. Each question object has:
- question (string)
- options (array of 4 strings)
- correct_answer (number 0-3, index of correct option)
- explanation (string, 1 sentence explaining the answer)`,
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
                  correct_answer: { type: 'number' },
                  explanation: { type: 'string' }
                }
              }
            }
          }
        }
      });
      if (!result?.questions?.length) throw new Error('No questions generated');
      setQuestions(result.questions);
      setCurrent(0);
      setSelected(null);
      setUserAnswers([]);
      setScore(0);
      setPhase('quiz');
    } catch (e) {
      setError('Failed to generate quiz. Please try again.');
      setPhase('setup');
    }
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === questions[current].correct_answer;
    if (isCorrect) setScore(s => s + 1);
    setUserAnswers(a => [...a, idx]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setPhase('score');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  const q = questions[current];

  // Get recently read books from localStorage
  const recentHistory = (() => {
    try {
      const h = JSON.parse(localStorage.getItem('fl_reading_history') || '[]');
      return h.slice(0, 3);
    } catch { return []; }
  })();

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F8FC' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #F43F5E 100%)' }}>
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-0.5">Bible Quiz</h1>
          <p className="text-orange-100 text-sm">Test your scripture knowledge with AI</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5">
        {phase === 'setup' && (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            {/* Recently Read */}
            {recentHistory.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recently Read</p>
                <div className="flex gap-2 flex-wrap">
                  {recentHistory.map((h, i) => {
                    const book = POPULAR_BOOKS.find(b => b.id === h.bookId) || { name: h.bookName, id: h.bookId, chapters: 50 };
                    return (
                      <button key={i} onClick={() => { setSelectedBook(book); setSelectedChapter(h.chapter || 1); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all"
                        style={{
                          borderColor: selectedBook?.id === book.id ? '#F59E0B' : '#E5E7EB',
                          backgroundColor: selectedBook?.id === book.id ? '#FEF3C7' : 'white',
                          color: selectedBook?.id === book.id ? '#D97706' : '#6B7280',
                        }}>
                        📖 {book.name} {h.chapter}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Book Selection */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Choose a Book</p>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_BOOKS.map(b => (
                  <button key={b.id} onClick={() => { setSelectedBook(b); setSelectedChapter(1); }}
                    className="py-2.5 px-2 rounded-xl border-2 text-xs font-medium transition-all text-center"
                    style={{
                      borderColor: selectedBook?.id === b.id ? '#F59E0B' : '#E5E7EB',
                      backgroundColor: selectedBook?.id === b.id ? '#FEF3C7' : 'white',
                      color: selectedBook?.id === b.id ? '#D97706' : '#6B7280',
                    }}>
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Selection */}
            {selectedBook && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Chapter</p>
                <div className="flex items-center gap-3">
                  <select value={selectedChapter} onChange={e => setSelectedChapter(Number(e.target.value))}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(c => (
                      <option key={c} value={c}>Chapter {c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Difficulty</p>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d.value} onClick={() => setDifficulty(d.value)}
                    className="py-3 px-2 rounded-xl border-2 text-center transition-all"
                    style={{
                      borderColor: difficulty === d.value ? '#F59E0B' : '#E5E7EB',
                      backgroundColor: difficulty === d.value ? '#FEF3C7' : 'white',
                    }}>
                    <p className="text-sm font-medium" style={{ color: difficulty === d.value ? '#D97706' : '#374151' }}>{d.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{d.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generateQuiz} disabled={!selectedBook}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F43F5E)' }}>
              <Sparkles size={18} /> Generate Quiz
            </button>
          </div>
        )}

        {phase === 'loading' && (
          <div className="text-center py-20">
            <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: '#F59E0B' }} />
            <p className="font-semibold text-gray-700">Generating your quiz...</p>
            <p className="text-sm text-gray-400 mt-1">{selectedBook?.name} Chapter {selectedChapter}</p>
          </div>
        )}

        {phase === 'quiz' && q && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Question {current + 1} of {questions.length}</span>
                <span className="text-xs font-semibold text-orange-500 flex items-center gap-1">
                  <Trophy size={12} /> {score} pts
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #F59E0B, #F43F5E)' }} />
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border">
              <div className="flex items-start gap-2 mb-4">
                <Target size={18} style={{ color: '#F59E0B' }} className="flex-shrink-0 mt-0.5" />
                <p className="font-semibold text-gray-800 leading-snug">{q.question}</p>
              </div>
              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  let style = { borderColor: '#E5E7EB', backgroundColor: 'white', color: '#374151' };
                  if (selected !== null) {
                    if (idx === q.correct_answer) style = { borderColor: '#10B981', backgroundColor: '#ECFDF5', color: '#065F46' };
                    else if (idx === selected) style = { borderColor: '#EF4444', backgroundColor: '#FEF2F2', color: '#991B1B' };
                  } else if (selected === null) {
                    // hover handled by CSS
                  }
                  return (
                    <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null}
                      className="w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-3"
                      style={style}>
                      <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ borderColor: style.borderColor }}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                      {selected !== null && idx === q.correct_answer && <CheckCircle2 size={16} className="ml-auto text-green-500" />}
                      {selected !== null && idx === selected && idx !== q.correct_answer && <XCircle size={16} className="ml-auto text-red-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation + Next */}
            {selected !== null && (
              <div className="space-y-3">
                {q.explanation && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-1">💡 Explanation</p>
                    <p className="text-sm text-blue-600">{q.explanation}</p>
                  </div>
                )}
                <button onClick={handleNext}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F43F5E)' }}>
                  {current + 1 >= questions.length ? <><Trophy size={16} /> See Results</> : <>Next Question <ChevronRight size={16} /></>}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'score' && (
          <ScoreScreen
            score={score}
            total={questions.length}
            questions={questions}
            userAnswers={userAnswers}
            onRestart={() => { setCurrent(0); setSelected(null); setUserAnswers([]); setScore(0); setPhase('quiz'); }}
            onNew={() => setPhase('setup')}
          />
        )}
      </div>
    </div>
  );
}