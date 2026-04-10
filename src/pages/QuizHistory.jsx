import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, RotateCw, Loader2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function QuizHistory() {
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => null);
  }, []);

  const { data: quizAttempts = [], isLoading } = useQuery({
    queryKey: ['quiz-attempts', currentUser?.id],
    queryFn: () => currentUser?.id 
      ? base44.entities.QuizAttempt.filter({ user_id: currentUser.id }, '-attempt_date', 100)
      : Promise.resolve([]),
    enabled: !!currentUser?.id,
  });

  const stats = {
    total: quizAttempts.length,
    avgScore: quizAttempts.length > 0 
      ? Math.round(quizAttempts.reduce((sum, q) => sum + (q.score || 0), 0) / quizAttempts.length)
      : 0,
    bestScore: quizAttempts.length > 0 
      ? Math.max(...quizAttempts.map(q => q.score || 0))
      : 0,
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600 mb-4">Please log in to view your quiz history.</p>
        <Link to={createPageUrl('AIQuizzes')}>
          <Button>{`Back to Quizzes`}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Quiz History</h1>
        </div>
        <p className="text-gray-600">Review your past quizzes and retake them to improve your scores.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
              <p className="text-sm text-gray-600 mt-1">Quizzes Taken</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.avgScore}%</p>
              <p className="text-sm text-gray-600 mt-1">Average Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.bestScore}%</p>
              <p className="text-sm text-gray-600 mt-1">Best Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        </div>
      ) : quizAttempts.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">No quizzes taken yet.</p>
            <Link to={createPageUrl('AIQuizzes')}>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <BookOpen className="w-4 h-4" />
                Start Your First Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizAttempts.map((attempt, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{attempt.quiz_title || `Quiz ${idx + 1}`}</h3>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline">{attempt.lesson_id || 'Custom'}</Badge>
                      <Badge className={attempt.passed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                        {attempt.score}%
                      </Badge>
                      {attempt.passed && (
                        <Badge className="bg-green-100 text-green-800">Passed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {attempt.attempt_date 
                        ? new Date(attempt.attempt_date).toLocaleDateString() 
                        : new Date(attempt.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{attempt.score}%</p>
                      <p className="text-xs text-gray-600">score</p>
                    </div>
                    <Link to={createPageUrl('AIQuizzes')}>
                      <Button variant="outline" size="sm" className="gap-2 mt-2">
                        <RotateCw className="w-4 h-4" />
                        Retake
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}