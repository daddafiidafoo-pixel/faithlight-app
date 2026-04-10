import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

export default function LessonQuizSection({ lessonId, courseId }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['lesson-quiz', lessonId],
    queryFn: async () => {
      const quizzes = await base44.entities.Quiz.filter(
        { lesson_id: lessonId },
        '-created_date',
        1
      );
      if (!quizzes.length) return null;

      const questions = await base44.entities.QuizQuestion.filter(
        { quiz_id: quizzes[0].id },
        'order'
      );

      return { ...quizzes[0], questions };
    },
    enabled: !!lessonId,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const correctCount = quiz.questions.filter(
        (q, idx) => answers[idx] === q.correct_answer
      ).length;
      const score = Math.round((correctCount / quiz.questions.length) * 100);

      await base44.entities.QuizAttempt.create({
        quiz_id: quiz.id,
        user_id: user.id,
        score,
        answers: JSON.stringify(answers),
      });

      return score;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-quiz', lessonId] });
      setSubmitted(true);
    },
  });

  if (isLoading) return null;
  if (!quiz) return null;

  if (!showQuiz) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">{quiz.title || 'Lesson Quiz'}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {quiz.questions?.length || 0} questions
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowQuiz(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Take Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    const correctCount = quiz.questions.filter(
      (q, idx) => answers[idx] === q.correct_answer
    ).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);

    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
          <div>
            <p className="text-4xl font-bold text-green-600">{score}%</p>
            <p className="text-gray-600 mt-1">
              You got {correctCount} out of {quiz.questions.length} correct
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowQuiz(false);
              setCurrentQuestion(0);
              setAnswers({});
              setSubmitted(false);
            }}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </CardTitle>
          <Badge>{Math.round(progress)}%</Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">{question.question_text}</h3>

          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setAnswers({ ...answers, [currentQuestion]: option })}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  answers[currentQuestion] === option
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === option
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {answers[currentQuestion] === option && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            className="flex-1"
          >
            Previous
          </Button>

          {currentQuestion < quiz.questions.length - 1 ? (
            <Button
              disabled={!answers[currentQuestion]}
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button
              disabled={!answers[currentQuestion] || submitQuizMutation.isPending}
              onClick={() => submitQuizMutation.mutate()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {submitQuizMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}