import React from 'react';
import { CheckCircle, XCircle, Award } from 'lucide-react';

export default function QuizResults({ results, quiz }) {
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-emerald-600' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-600' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const gradeInfo = getGrade(results.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <Award className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h1>
          <div className={`text-6xl font-bold mb-4 ${gradeInfo.color}`}>
            {results.percentage}%
          </div>
          <p className="text-xl text-slate-700 mb-4">
            You got <strong>{results.score}</strong> out of{' '}
            <strong>{results.total_questions}</strong> correct
          </p>
          <p className="text-slate-600">
            Time: {Math.floor(results.completion_time_seconds / 60)}m{' '}
            {results.completion_time_seconds % 60}s
          </p>
        </div>

        {/* Answer Review */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Answer Review</h2>
          {results.answers.map((answer, idx) => {
            const question = quiz.questions[idx];
            const isCorrect = answer.is_correct;

            return (
              <div
                key={idx}
                className={`rounded-2xl border-2 p-6 ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex gap-3 mb-3">
                  {isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  )}
                  <h3 className="font-semibold text-slate-900 flex-1">
                    {question.question}
                  </h3>
                </div>

                <div className="ml-9 space-y-2 mb-3">
                  <p className="text-sm text-slate-700">
                    <strong>Your answer:</strong> {question.options[answer.selected_answer]}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-slate-700">
                      <strong>Correct answer:</strong>{' '}
                      {question.options[answer.correct_answer]}
                    </p>
                  )}
                </div>

                <div className="ml-9 bg-blue-100 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-slate-600 text-white py-3 rounded-xl font-medium hover:bg-slate-700"
          >
            Back to Home
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-medium hover:bg-violet-700"
          >
            Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}