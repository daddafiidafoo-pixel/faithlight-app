import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export default function QuizInsights({ quizQuestions, quizAttempts, quiz }) {
  if (!quizQuestions.length || !quizAttempts.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No quiz data available yet</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate per-question statistics
  const questionStats = quizQuestions.map(question => {
    const answersForQuestion = quizAttempts.flatMap(attempt =>
      attempt.answers.filter(a => a.question_id === question.id)
    );

    const correctCount = answersForQuestion.filter(a => a.correct).length;
    const totalAnswers = answersForQuestion.length;
    const correctRate = totalAnswers > 0 ? (correctCount / totalAnswers) * 100 : 0;

    return {
      question,
      correctRate,
      totalAnswers,
      correctCount
    };
  });

  // Sort by difficulty (lowest correct rate first)
  const sortedByDifficulty = [...questionStats].sort((a, b) => a.correctRate - b.correctRate);
  const difficultQuestions = sortedByDifficulty.slice(0, 3);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questionStats.map((stat, index) => (
            <div key={stat.question.id} className="pb-3 border-b last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-gray-900 flex-1">
                  Q{index + 1}: {stat.question.question}
                </p>
                <Badge
                  className={
                    stat.correctRate >= 70
                      ? 'bg-green-100 text-green-800'
                      : stat.correctRate >= 50
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {stat.correctRate.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={stat.correctRate} />
              <p className="text-xs text-gray-500 mt-1">
                {stat.correctCount} of {stat.totalAnswers} answered correctly
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Most Challenging Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {difficultQuestions.map((stat, index) => (
            <div key={stat.question.id} className="bg-white rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <Badge variant="outline" className="text-orange-800 border-orange-300">
                  #{index + 1} Hardest
                </Badge>
                <Badge className="bg-red-100 text-red-800">
                  {stat.correctRate.toFixed(0)}% correct
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{stat.question.question}</p>
              <p className="text-xs text-gray-600">
                {stat.totalAnswers - stat.correctCount} students struggled with this
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}