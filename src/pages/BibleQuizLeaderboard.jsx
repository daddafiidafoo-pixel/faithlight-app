import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Zap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const BOOKS = ['John', 'Genesis', 'Psalms', 'Romans', 'Matthew', 'Mark', 'Luke'];

const BADGE_TYPES = {
  novice: { icon: '🟢', label: 'Novice', minScore: 0 },
  competent: { icon: '🔵', label: 'Competent', minScore: 70 },
  expert: { icon: '🟣', label: 'Expert', minScore: 85 },
  master: { icon: '⭐', label: 'Master', minScore: 95 },
};

export default function BibleQuizLeaderboard() {
  const [selectedBook, setSelectedBook] = useState('John');
  const [quizMode, setQuizMode] = useState('take'); // 'take' or 'leaderboard'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  const queryClient = useQueryClient();

  // Fetch quizzes
  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', selectedBook],
    queryFn: async () => {
      try {
        const results = await base44.entities.BibleQuiz.filter({
          book_name: selectedBook,
        });
        return results || [];
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
        return [];
      }
    },
  });

  // Fetch leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', selectedBook],
    queryFn: async () => {
      try {
        const results = await base44.entities.UserQuizResult.filter(
          { book_id: selectedBook },
          '-score',
          100
        );
        return results || [];
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        return [];
      }
    },
  });

  // Submit quiz result
  const submitQuizMutation = useMutation({
    mutationFn: async (result) => {
      const user = await base44.auth.me();
      if (!user) throw new Error('Not authenticated');

      return base44.entities.UserQuizResult.create({
        user_email: user.email,
        user_name: user.full_name || 'Anonymous',
        quiz_id: quizzes[0]?.id || 'default',
        book_id: selectedBook,
        score: result.correct,
        total_questions: result.total,
        points_earned: Math.round((result.correct / result.total) * 100),
        completion_time_seconds: result.time,
        percentage: Math.round((result.correct / result.total) * 100),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('Quiz submitted! Check the leaderboard!');
    },
    onError: (err) => {
      toast.error('Failed to submit quiz');
      console.error(err);
    },
  });

  const handleAnswerSelect = (answerIdx) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIdx;
    setUserAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    if (quizzes.length === 0) return;

    const quiz = quizzes[0];
    let correct = 0;

    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) {
        correct++;
      }
    });

    setScore(correct);
    setQuizComplete(true);

    submitQuizMutation.mutate({
      correct,
      total: quiz.questions.length,
      time: 60, // Placeholder
    });
  };

  const getBadge = (percentage) => {
    if (percentage >= 95) return BADGE_TYPES.master;
    if (percentage >= 85) return BADGE_TYPES.expert;
    if (percentage >= 70) return BADGE_TYPES.competent;
    return BADGE_TYPES.novice;
  };

  if (quizMode === 'take' && !quizComplete && quizzes.length > 0) {
    const quiz = quizzes[0];
    const question = quiz.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Quiz Header */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedBook} Quiz</h1>
                <p className="text-sm text-gray-600">{quiz.topic}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-indigo-600">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </Card>

          {/* Question */}
          <Card className="p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{question.question}</h2>

            {/* Answers */}
            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full p-4 rounded-lg text-left transition border-2 ${
                    userAnswers[currentQuestion] === idx
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-semibold text-gray-900">{String.fromCharCode(65 + idx)}.</span>
                  <span className="ml-3 text-gray-700">{option}</span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                variant="outline"
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion < quiz.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={userAnswers[currentQuestion] === undefined}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitQuiz}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={userAnswers[currentQuestion] === undefined}
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bible Quiz</h1>
          <p className="text-gray-600">Test your knowledge and compete with others</p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => {
              setQuizMode('take');
              setQuizComplete(false);
              setCurrentQuestion(0);
              setUserAnswers([]);
            }}
            variant={quizMode === 'take' ? 'default' : 'outline'}
            className={quizMode === 'take' ? 'bg-indigo-600' : ''}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Take Quiz
          </Button>
          <Button
            onClick={() => setQuizMode('leaderboard')}
            variant={quizMode === 'leaderboard' ? 'default' : 'outline'}
            className={quizMode === 'leaderboard' ? 'bg-indigo-600' : ''}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
        </div>

        {/* Book Selector */}
        <Card className="p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Book</label>
          <Select value={selectedBook} onValueChange={setSelectedBook}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOKS.map((book) => (
                <SelectItem key={book} value={book}>
                  {book}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {quizMode === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top 3 Podium */}
            <div className="lg:col-span-3">
              <Card className="p-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                <h2 className="text-2xl font-bold mb-6 text-center">Top Performers</h2>
                <div className="grid grid-cols-3 gap-4">
                  {leaderboard.slice(0, 3).map((entry, idx) => {
                    const medal = ['🥇', '🥈', '🥉'][idx];
                    const badge = getBadge(entry.percentage);
                    return (
                      <div
                        key={entry.id}
                        className={`p-6 rounded-lg text-center ${
                          idx === 0
                            ? 'bg-yellow-100 border-2 border-yellow-400'
                            : idx === 1
                            ? 'bg-gray-100 border-2 border-gray-400'
                            : 'bg-orange-100 border-2 border-orange-400'
                        }`}
                      >
                        <p className="text-4xl mb-2">{medal}</p>
                        <p className="font-bold text-gray-900">{entry.user_name}</p>
                        <p className="text-2xl font-bold text-indigo-600 my-2">{entry.score}/{entry.total_questions}</p>
                        <p className="text-sm text-gray-600 mb-2">{entry.percentage}%</p>
                        <p className="text-2xl">{badge.icon}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Full Leaderboard */}
            <div className="lg:col-span-3">
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Player</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Score</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Percentage</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Badge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {leaderboard.map((entry, idx) => {
                        const badge = getBadge(entry.percentage);
                        return (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{idx + 1}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{entry.user_name}</td>
                            <td className="px-6 py-4 text-sm text-center font-semibold text-indigo-600">
                              {entry.score}/{entry.total_questions}
                            </td>
                            <td className="px-6 py-4 text-sm text-center text-gray-700">{entry.percentage}%</td>
                            <td className="px-6 py-4 text-center text-2xl">{badge.icon}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {quizMode === 'take' && quizComplete && (
          <Card className="p-8 text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h2>
            <p className="text-4xl font-bold text-indigo-600 mb-2">
              {score}/{quizzes[0]?.questions.length}
            </p>
            <p className="text-xl text-gray-600 mb-6">
              {Math.round((score / quizzes[0]?.questions.length) * 100)}%
            </p>
            <p className="text-3xl mb-6">
              {getBadge(Math.round((score / quizzes[0]?.questions.length) * 100)).icon}
            </p>
            <Button
              onClick={() => {
                setQuizMode('leaderboard');
                setQuizComplete(false);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              View Leaderboard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}