import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle } from 'lucide-react';

export default function QuizPerformanceDeepDive({ courseId, quizId }) {
  const { data: quizAnalytics = [] } = useQuery({
    queryKey: ['quiz-analytics', courseId, quizId],
    queryFn: async () => {
      if (!courseId || !quizId) return [];
      return await base44.entities.QuizAnalytics.filter({
        course_id: courseId,
        quiz_id: quizId,
      }, '-incorrect_answers');
    },
  });

  const stats = React.useMemo(() => {
    if (quizAnalytics.length === 0) return null;

    const avgAccuracy = Math.round(
      quizAnalytics.reduce((sum, q) => sum + (q.accuracy_percent || 0), 0) / quizAnalytics.length
    );

    const avgTime = Math.round(
      quizAnalytics.reduce((sum, q) => sum + (q.average_time_seconds || 0), 0) / quizAnalytics.length
    );

    const flaggedQuestions = quizAnalytics.filter(q => q.flag_for_review).length;

    return { avgAccuracy, avgTime, flaggedQuestions };
  }, [quizAnalytics]);

  // Question difficulty analysis
  const difficultyData = React.useMemo(() => {
    const easy = quizAnalytics.filter(q => q.difficulty_rating === 'easy').length;
    const medium = quizAnalytics.filter(q => q.difficulty_rating === 'medium').length;
    const hard = quizAnalytics.filter(q => q.difficulty_rating === 'hard').length;

    return [
      { difficulty: 'Easy', count: easy, color: '#10b981' },
      { difficulty: 'Medium', count: medium, color: '#f59e0b' },
      { difficulty: 'Hard', count: hard, color: '#ef4444' },
    ];
  }, [quizAnalytics]);

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center text-gray-600">
          No quiz data available
        </CardContent>
      </Card>
    );
  }

  // Questions needing review (low accuracy or common wrong answer)
  const problematicQuestions = quizAnalytics
    .filter(q => q.accuracy_percent < 70 || q.flag_for_review)
    .sort((a, b) => a.accuracy_percent - b.accuracy_percent);

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Accuracy</p>
            <p className={`text-3xl font-bold ${stats.avgAccuracy >= 80 ? 'text-green-600' : stats.avgAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stats.avgAccuracy}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Time Per Question</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.avgTime}s</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Questions Flagged</p>
            <p className={`text-3xl font-bold ${stats.flaggedQuestions > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.flaggedQuestions}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Question Difficulty Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={difficultyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="difficulty" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Problematic Questions */}
      {problematicQuestions.length > 0 && (
        <Card className="border-l-4 border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Questions Needing Review ({problematicQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {problematicQuestions.map(q => (
              <div key={q.id} className="p-4 border rounded-lg bg-red-50">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-900 flex-1">{q.question_text}</p>
                  <Badge className={q.accuracy_percent < 50 ? 'bg-red-600' : 'bg-yellow-600'}>
                    {q.accuracy_percent}% correct
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-600">Attempts: {q.total_attempts}</p>
                    <p className="text-gray-600">Correct: {q.correct_answers} / Incorrect: {q.incorrect_answers}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Time: {q.average_time_seconds}s</p>
                    {q.most_selected_wrong_answer !== undefined && (
                      <p className="text-red-700 font-semibold">⚠ Common wrong answer at option {q.most_selected_wrong_answer + 1}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}