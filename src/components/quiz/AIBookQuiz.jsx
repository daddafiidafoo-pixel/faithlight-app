import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Loader2, Check, X, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','Ezra','Nehemiah','Esther','Job',
  'Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah',
  'Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Jonah','Micah',
  'Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians',
  'Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','1 Timothy',
  'Hebrews','James','1 Peter','1 John','Jude','Revelation'
];

const DIFFICULTIES = [
  { id: 'easy', label: '🟢 Easy', desc: 'Basic facts and stories' },
  { id: 'medium', label: '🟡 Medium', desc: 'Themes and key passages' },
  { id: 'hard', label: '🔴 Hard', desc: 'Deep theology & details' },
];

export default function AIBookQuiz({ user }) {
  const [book, setBook] = useState('John');
  const [difficulty, setDifficulty] = useState('medium');
  const [phase, setPhase] = useState('setup'); // setup | loading | quiz | results
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const generateQuiz = async () => {
    setPhase('loading');
    try {
      const prompt = `Generate a ${difficulty} difficulty Bible quiz about the Book of ${book}. 
Create exactly 5 multiple-choice questions based on the actual content, stories, characters, and teachings in ${book}.
Each question must have 4 answer options (A, B, C, D) with exactly one correct answer.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}

Difficulty guidelines:
- easy: focus on well-known stories, main characters, famous verses
- medium: themes, chapter events, key teachings, relationships between characters
- hard: specific details, theological nuances, cross-references, minor characters

Make all questions clearly answerable from reading the Book of ${book}.`;

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
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  correctIndex: { type: 'number' },
                  explanation: { type: 'string' },
                }
              }
            }
          }
        }
      });

      const qs = result?.questions;
      if (!qs || qs.length === 0) throw new Error('No questions returned');

      const valid = qs.filter(q =>
        q.question && q.options?.length === 4 &&
        q.correctIndex >= 0 && q.correctIndex < 4
      ).slice(0, 5);

      if (valid.length < 3) throw new Error('Not enough valid questions');

      setQuestions(valid.map((q, i) => ({ ...q, id: i })));
      setAnswers({});
      setSelected(null);
      setShowFeedback(false);
      setCurrentQ(0);
      setPhase('quiz');
    } catch (err) {
      console.error('AIBookQuiz error:', err);
      toast.error('Failed to generate quiz. Please try again.');
      setPhase('setup');
    }
  };

  const handleSelect = (idx) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    setAnswers(prev => ({ ...prev, [currentQ]: idx }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      setPhase('results');
    }
  };

  const correctCount = questions.filter((q, i) => answers[i] === q.correctIndex).length;
  const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  const getScoreInfo = () => {
    if (pct >= 80) return { emoji: '🏆', label: 'Excellent!', color: 'text-green-600' };
    if (pct >= 60) return { emoji: '⭐', label: 'Well Done!', color: 'text-blue-600' };
    return { emoji: '📖', label: 'Keep Studying!', color: 'text-amber-600' };
  };

  // Setup
  if (phase === 'setup') return (
    <div className="space-y-6">
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
        <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-purple-800">AI generates 5 fresh questions about your chosen book every time</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 block">📖 Choose a Book</label>
        <Select value={book} onValueChange={setBook}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {BIBLE_BOOKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 block">⚡ Difficulty</label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${difficulty === d.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-200'}`}
            >
              <div className="text-xs font-bold text-gray-800">{d.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={generateQuiz} className="w-full h-12 gap-2 bg-purple-600 hover:bg-purple-700">
        <Sparkles className="w-5 h-5" />
        Generate AI Quiz for {book}
      </Button>
    </div>
  );

  // Loading
  if (phase === 'loading') return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
      <p className="text-gray-600 font-medium">Generating your {book} quiz…</p>
      <p className="text-sm text-gray-400">AI is crafting 5 personalized questions</p>
    </div>
  );

  // Quiz
  const q = questions[currentQ];
  if (phase === 'quiz' && q) {
    const isCorrect = selected === q.correctIndex;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className="bg-purple-100 text-purple-800">{currentQ + 1} / {questions.length}</Badge>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-100 text-indigo-700 text-xs">{book}</Badge>
            <Badge className={`text-xs capitalize ${difficulty === 'easy' ? 'bg-green-100 text-green-700' : difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{difficulty}</Badge>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-purple-600 h-1.5 rounded-full transition-all" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
        </div>

        <Card className="shadow-md">
          <CardContent className="p-5">
            <p className="text-base font-semibold text-gray-900 leading-relaxed">{q.question}</p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            let style = 'border-gray-200 bg-white hover:border-purple-300';
            if (showFeedback) {
              if (idx === q.correctIndex) style = 'border-green-500 bg-green-50';
              else if (idx === selected) style = 'border-red-400 bg-red-50';
            } else if (idx === selected) style = 'border-purple-500 bg-purple-50';
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${style}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${showFeedback && idx === q.correctIndex ? 'bg-green-500 text-white' : showFeedback && idx === selected ? 'bg-red-400 text-white' : idx === selected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {showFeedback && idx === q.correctIndex ? <Check className="w-4 h-4" /> : showFeedback && idx === selected && !isCorrect ? <X className="w-4 h-4" /> : String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-medium text-gray-800">{opt}</span>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <>
            <Card className={`border-2 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="p-4">
                <p className={`font-semibold text-sm mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '✅ Correct!' : `❌ The answer is "${q.options[q.correctIndex]}"`}
                </p>
                {q.explanation && <p className="text-sm text-gray-600">{q.explanation}</p>}
              </CardContent>
            </Card>
            <Button onClick={handleNext} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
              {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    );
  }

  // Results
  const { emoji, label, color } = getScoreInfo();
  return (
    <div className="space-y-4">
      <Card className="shadow-lg text-center">
        <CardContent className="p-8">
          <div className="text-5xl mb-3">{emoji}</div>
          <h2 className={`text-2xl font-bold ${color}`}>{label}</h2>
          <p className={`text-5xl font-bold mt-2 ${color}`}>{pct}%</p>
          <p className="text-gray-500 mt-1">{correctCount} of {questions.length} correct</p>
          <div className="flex justify-center gap-2 mt-3">
            <Badge className="bg-indigo-100 text-indigo-700">{book}</Badge>
            <Badge className={`capitalize ${difficulty === 'easy' ? 'bg-green-100 text-green-700' : difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{difficulty}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {questions.map((q, i) => {
          const correct = answers[i] === q.correctIndex;
          return (
            <div key={i} className={`p-3 rounded-lg flex items-start gap-3 ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5 ${correct ? 'bg-green-500' : 'bg-red-400'}`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium">{q.question}</p>
                {!correct && <p className="text-xs text-red-700 mt-0.5">Correct: <strong>{q.options[q.correctIndex]}</strong></p>}
              </div>
              {correct ? <Check className="w-4 h-4 text-green-600 shrink-0" /> : <X className="w-4 h-4 text-red-500 shrink-0" />}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button onClick={generateQuiz} className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700">
          <RefreshCw className="w-4 h-4" /> New Quiz
        </Button>
        <Button variant="outline" onClick={() => setPhase('setup')} className="flex-1">
          Change Book
        </Button>
      </div>
    </div>
  );
}