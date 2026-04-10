import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Clock, Check, X, Loader2, Zap } from 'lucide-react';

// Seeded random using a date string as seed
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = ((s * 1103515245) + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build 5 daily questions seeded by today's date
function buildDailyQuestions(books, seed) {
  if (!books.length) return [];
  const all = [...books];
  const ot = all.filter(b => b.testament === 'OT');
  const nt = all.filter(b => b.testament === 'NT');
  const shuffled = seededShuffle(all, seed);
  const questions = [];

  // Q1: OT or NT?
  const q1book = shuffled[0];
  if (q1book) {
    questions.push({
      id: 1,
      question: `Is the book of ${q1book.name} in the Old or New Testament?`,
      options: ['Old Testament', 'New Testament'],
      correctIndex: q1book.testament === 'OT' ? 0 : 1,
      explanation: `${q1book.name} is in the ${q1book.testament === 'OT' ? 'Old' : 'New'} Testament.`,
    });
  }

  // Q2: Category
  const q2book = shuffled[1];
  if (q2book?.category) {
    const cats = [...new Set(all.map(b => b.category))].filter(c => c !== q2book.category).slice(0, 3);
    const opts = seededShuffle([q2book.category, ...cats], seed + 1);
    questions.push({
      id: 2,
      question: `The book of ${q2book.name} belongs to which category?`,
      options: opts,
      correctIndex: opts.indexOf(q2book.category),
      explanation: `${q2book.name} is categorized as ${q2book.category}.`,
    });
  }

  // Q3: Author
  const booksWithAuthor = all.filter(b => b.author);
  const q3book = seededShuffle(booksWithAuthor, seed + 2)[0];
  if (q3book) {
    const others = seededShuffle(booksWithAuthor.filter(b => b.author !== q3book.author).map(b => b.author), seed + 3).slice(0, 3);
    const opts = seededShuffle([q3book.author, ...others], seed + 4);
    questions.push({
      id: 3,
      question: `Who traditionally authored the book of ${q3book.name}?`,
      options: opts,
      correctIndex: opts.indexOf(q3book.author),
      explanation: `${q3book.name} is traditionally attributed to ${q3book.author}.`,
    });
  }

  // Q4: Not a Gospel
  const gospels = all.filter(b => b.category === 'Gospels');
  const nonGospel = all.find(b => b.category !== 'Gospels' && b.testament === 'NT');
  if (gospels.length >= 3 && nonGospel) {
    const opts = seededShuffle([nonGospel.name, ...gospels.slice(0, 3).map(g => g.name)], seed + 5);
    questions.push({
      id: 4,
      question: 'Which of these is NOT one of the four Gospels?',
      options: opts,
      correctIndex: opts.indexOf(nonGospel.name),
      explanation: `The four Gospels are Matthew, Mark, Luke, and John. ${nonGospel.name} is not a Gospel.`,
    });
  }

  // Q5: Chapter count
  const booksWithChapters = all.filter(b => b.chapter_count);
  const q5book = seededShuffle(booksWithChapters, seed + 6)[0];
  if (q5book) {
    const wrongCounts = seededShuffle(booksWithChapters.filter(b => b.chapter_count !== q5book.chapter_count).map(b => b.chapter_count), seed + 7).slice(0, 3);
    const opts = seededShuffle([q5book.chapter_count, ...wrongCounts], seed + 8).map(String);
    questions.push({
      id: 5,
      question: `How many chapters are in the book of ${q5book.name}?`,
      options: opts,
      correctIndex: opts.indexOf(String(q5book.chapter_count)),
      explanation: `${q5book.name} has ${q5book.chapter_count} chapters.`,
    });
  }

  return questions.slice(0, 5);
}

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function DailyChallenge({ user }) {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, n) => acc + parseInt(n), 0) * 7;
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState('intro'); // intro | quiz | results
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState({});

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['bible-books-daily'],
    queryFn: () => base44.entities.BibleBook.list('canonical_order', 70).catch(() => []),
    retry: false,
  });

  const { data: attempt } = useQuery({
    queryKey: ['daily-quiz-attempt', user?.id, today],
    queryFn: async () => {
      const results = await base44.entities.UserDailyQuizAttempt.filter({ user_id: user.id, date: today }, '-created_date', 1).catch(() => []);
      return results[0] || null;
    },
    enabled: !!user?.id,
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ score, answers }) => {
      if (attempt) {
        await base44.entities.UserDailyQuizAttempt.update(attempt.id, { score, completed: true, answers });
      } else {
        await base44.entities.UserDailyQuizAttempt.create({ user_id: user.id, date: today, score, completed: true, answers });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['daily-quiz-attempt', user?.id, today]),
  });

  const questions = buildDailyQuestions(books, seed);
  const q = questions[currentQ];

  const handleSelect = (idx) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    setAnswers(prev => ({ ...prev, [q.id]: idx }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      const correct = questions.filter(q2 => answers[q2.id] === q2.correctIndex || (currentQ === questions.indexOf(q2) && selected === q2.correctIndex)).length;
      const finalAnswers = { ...answers, [q.id]: selected };
      const finalCorrect = questions.filter(q2 => finalAnswers[q2.id] === q2.correctIndex).length;
      saveMutation.mutate({ score: Math.round((finalCorrect / questions.length) * 100), answers: finalAnswers });
      setPhase('results');
    }
  };

  // Already completed today
  if (attempt?.completed) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-5 text-center space-y-2">
          <div className="text-3xl">🏆</div>
          <p className="font-semibold text-amber-800">Daily Challenge Complete!</p>
          <p className="text-sm text-amber-700">Score: <strong>{attempt.score}%</strong></p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600">
            <Clock className="w-3.5 h-3.5" />
            Next challenge in {getNextMidnight()}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'intro') {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-amber-900">Daily Bible Challenge</p>
              <p className="text-xs text-amber-600">{today} · 5 questions · ~2 min</p>
            </div>
          </div>
          <p className="text-sm text-amber-800">Same challenge for everyone today. Answer all 5 questions to complete your daily challenge!</p>
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 gap-2"
            onClick={() => setPhase('quiz')}
            disabled={booksLoading || questions.length === 0}
          >
            {booksLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {booksLoading ? 'Loading…' : 'Start Daily Challenge'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'results') {
    const finalAnswers = { ...answers };
    const finalCorrect = questions.filter(q2 => finalAnswers[q2.id] === q2.correctIndex).length;
    const pct = Math.round((finalCorrect / questions.length) * 100);
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-5 text-center space-y-3">
          <div className="text-4xl">{pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '📖'}</div>
          <p className="text-xl font-bold text-gray-900">{pct}%</p>
          <p className="text-sm text-gray-600">{finalCorrect} / {questions.length} correct</p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            Next challenge in {getNextMidnight()}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!q) return null;

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            Daily Challenge
          </CardTitle>
          <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">{currentQ + 1} / {questions.length}</Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-semibold text-gray-900">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === q.correctIndex;
            let cls = 'border-gray-200 bg-white hover:border-amber-300';
            if (showFeedback) {
              if (isCorrect) cls = 'border-green-500 bg-green-50';
              else if (isSelected) cls = 'border-red-400 bg-red-50';
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showFeedback}
                className={`w-full text-left p-3 rounded-lg border-2 text-sm transition-all flex items-center gap-2 ${cls}`}
              >
                {showFeedback && isCorrect && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                {showFeedback && isSelected && !isCorrect && <X className="w-4 h-4 text-red-500 flex-shrink-0" />}
                {opt}
              </button>
            );
          })}
        </div>
        {showFeedback && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">{q.explanation}</p>
            <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600" onClick={handleNext}>
              {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}