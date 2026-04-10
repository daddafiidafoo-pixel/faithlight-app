import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Clock, Check, X, Loader2, Zap, Globe } from 'lucide-react';

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

// Seeded deterministic question selection by date
function seededIndex(seed, max) {
  return Math.abs((seed * 1103515245 + 12345) & 0x7fffffff) % max;
}

function selectDailyQIDs(allQIDs, count, seed) {
  if (!allQIDs.length) return [];
  const chosen = [];
  let s = seed;
  const pool = [...allQIDs];
  for (let i = 0; i < count && pool.length > 0; i++) {
    s = ((s * 1103515245) + 12345) & 0x7fffffff;
    const idx = s % pool.length;
    chosen.push(pool.splice(idx, 1)[0]);
  }
  return chosen;
}

export default function MultilingualDailyChallenge({ user, lang = 'en' }) {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, n) => acc + parseInt(n), 0) * 7;
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState({});

  // Load questions in user language
  const { data: langQuestions = [], isLoading: loadingLang } = useQuery({
    queryKey: ['quiz-questions-lang', lang, today],
    queryFn: async () => {
      // Try user language first
      const res = await base44.entities.QuizQuestionText.filter({ lang }, '-created_date', 50).catch(() => []);
      if (res.length >= 5) return res;
      // Fallback to English
      if (lang !== 'en') {
        const enRes = await base44.entities.QuizQuestionText.filter({ lang: 'en' }, '-created_date', 50).catch(() => []);
        return enRes;
      }
      return res;
    },
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  const { data: attempt } = useQuery({
    queryKey: ['daily-quiz-attempt-ml', user?.id, today],
    queryFn: async () => {
      const results = await base44.entities.UserDailyQuizAttempt.filter({ user_id: user.id, date: today }, '-created_date', 1).catch(() => []);
      return results[0] || null;
    },
    enabled: !!user?.id,
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ score, answers: ans }) => {
      if (attempt) {
        await base44.entities.UserDailyQuizAttempt.update(attempt.id, { score, completed: true });
      } else {
        await base44.entities.UserDailyQuizAttempt.create({ user_id: user.id, date: today, score, completed: true, lang });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['daily-quiz-attempt-ml', user?.id, today]),
  });

  // Pick 5 deterministic questions for today
  const allQIDs = [...new Set(langQuestions.map(q => q.qid))];
  const dailyQIDs = selectDailyQIDs(allQIDs, 5, seed);
  const questions = dailyQIDs.map(qid => langQuestions.find(q => q.qid === qid)).filter(Boolean);

  // If not enough DB questions, return null to fall back to BibleBook-based challenge
  if (!loadingLang && questions.length < 3) return null;

  const q = questions[currentQ];

  const handleSelect = (idx) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    setAnswers(prev => ({ ...prev, [currentQ]: idx }));
  };

  const handleNext = () => {
    const isLast = currentQ === questions.length - 1;
    const finalAnswers = { ...answers, [currentQ]: selected };
    if (isLast) {
      const correct = questions.filter((_, i) => finalAnswers[i] === questions[i].answer_index).length;
      saveMutation.mutate({ score: Math.round((correct / questions.length) * 100), answers: finalAnswers });
      setPhase('results');
    } else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  };

  if (attempt?.completed) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-5 text-center space-y-2">
          <div className="text-3xl">🏆</div>
          <p className="font-semibold text-amber-800">Daily Challenge Complete!</p>
          <p className="text-sm text-amber-700">Score: <strong>{attempt.score}%</strong></p>
          {lang !== 'en' && <Badge className="bg-amber-100 text-amber-700 border-0"><Globe className="w-3 h-3 inline mr-1" />{lang.toUpperCase()}</Badge>}
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
              <p className="text-xs text-amber-600">{today} · {questions.length} questions · ~2 min</p>
            </div>
            {lang !== 'en' && (
              <Badge className="ml-auto bg-amber-100 text-amber-700 border-0">
                <Globe className="w-3 h-3 inline mr-1" />{lang.toUpperCase()}
              </Badge>
            )}
          </div>
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 gap-2"
            onClick={() => setPhase('quiz')}
            disabled={loadingLang || questions.length === 0}
          >
            {loadingLang ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loadingLang ? 'Loading…' : 'Start Daily Challenge'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'results') {
    const finalAnswers = { ...answers };
    const correct = questions.filter((_, i) => finalAnswers[i] === questions[i].answer_index).length;
    const score = Math.round((correct / questions.length) * 100);
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-4xl">{score >= 80 ? '🏆' : score >= 60 ? '⭐' : '📖'}</div>
          <div>
            <p className="text-2xl font-bold text-amber-900">{score}%</p>
            <p className="text-sm text-amber-700">{correct} of {questions.length} correct</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600">
            <Clock className="w-3.5 h-3.5" />
            Next challenge in {getNextMidnight()}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!q) return null;

  const isCorrect = selected === q.answer_index;

  return (
    <Card className="border-amber-200">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Badge className="bg-amber-100 text-amber-700 border-0">
            <Flame className="w-3 h-3 inline mr-1" />Q {currentQ + 1}/{questions.length}
          </Badge>
          {lang !== 'en' && (
            <Badge className="bg-blue-50 text-blue-600 border-0">
              <Globe className="w-3 h-3 inline mr-1" />{lang.toUpperCase()}
            </Badge>
          )}
          {q.category && <Badge variant="outline" className="text-xs">{q.category}</Badge>}
        </div>

        <p className="font-semibold text-gray-900 text-base leading-relaxed">{q.prompt}</p>

        <div className="space-y-2">
          {q.choices.map((choice, idx) => {
            let bg = 'bg-white border-gray-200 hover:border-amber-400';
            if (showFeedback) {
              if (idx === q.answer_index) bg = 'bg-emerald-50 border-emerald-400';
              else if (idx === selected) bg = 'bg-red-50 border-red-400';
              else bg = 'bg-white border-gray-200 opacity-50';
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showFeedback}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${bg}`}
              >
                <span className="flex items-center gap-2">
                  {showFeedback && idx === q.answer_index && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                  {showFeedback && idx === selected && idx !== q.answer_index && <X className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  {choice}
                </span>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
            {isCorrect ? '✅ Correct! ' : '❌ Incorrect. '}{q.explanation}
          </div>
        )}

        {showFeedback && (
          <Button onClick={handleNext} className="w-full bg-amber-500 hover:bg-amber-600 gap-2">
            {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
            <Zap className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}