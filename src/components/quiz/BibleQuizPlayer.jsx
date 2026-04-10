import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2, SkipBack } from 'lucide-react';
import { cacheData, getCachedData, isOnline } from '@/lib/offlineCacheManager';

export default function BibleQuizPlayer({ quiz, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  if (!quiz || !quiz.questions) {
    return <div className="p-6 text-center text-gray-500">Quiz data not available</div>;
  }

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const answeredCount = answers.filter(a => a !== null).length;

  const handleSelectAnswer = (optionIndex) => {
    if (showExplanation) return; // Don't allow changing after revealing
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === question.correct_answer;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { selected: selectedAnswer, isCorrect };
    setAnswers(newAnswers);
    setShowExplanation(true);

    if (isCorrect) {
      setScore(score + 1);
    }

    // Cache answer locally
    await cacheData('quizAttempts', {
      quiz_id: quiz.id,
      question_index: currentQuestion,
      answer: newAnswers[currentQuestion]
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      submitQuiz();
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      const percentage = Math.round((score / quiz.questions.length) * 100);

      const attempt = {
        user_email: user?.email || 'anonymous',
        quiz_id: quiz.id,
        quiz_date: quiz.date,
        quiz_mode: quiz.mode,
        plan_id: quiz.plan_id || null,
        answers: answers.map((a, i) => ({
          question_id: quiz.questions[i].id,
          selected_answer: a.selected,
          is_correct: a.isCorrect,
          time_spent_seconds: 0
        })),
        score,
        total_questions: quiz.questions.length,
        percentage,
        time_spent_seconds: 0,
        completed_at: new Date().toISOString()
      };

      if (isOnline()) {
        await base44.entities.UserQuizAttempt.create(attempt);
      } else {
        await cacheData('quizAttempts', attempt);
      }

      setCompleted(true);
      onComplete?.({ score, percentage, total: quiz.questions.length });
    } catch (error) {
      console.error('Submit quiz error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Completion screen
  if (completed) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="mb-4">
            {percentage >= 80 ? (
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Try!' : 'Keep Learning!'}
          </h2>
          <p className="text-5xl font-bold text-indigo-600 mb-2">{percentage}%</p>
          <p className="text-gray-600 mb-6">
            You got {score} out of {quiz.questions.length} correct
          </p>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <SkipBack className="w-4 h-4" /> Try Another Quiz
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-6 mb-6">
        <p className="text-xs text-indigo-600 font-semibold mb-2">{quiz.reference}</p>
        <h3 className="text-lg font-bold text-gray-900 mb-6">{question.question}</h3>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correct_answer;
            const showResult = showExplanation;

            let bgClass = 'bg-white border-2 border-gray-200';
            if (isSelected && showResult) {
              bgClass = isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500';
            } else if (isSelected) {
              bgClass = 'bg-indigo-50 border-indigo-600';
            } else if (showResult && isCorrect) {
              bgClass = 'bg-green-50 border-green-200';
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={showExplanation}
                className={`w-full p-4 text-left rounded-lg font-medium transition-all ${bgClass} ${
                  showExplanation ? 'cursor-default' : 'hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      isSelected && showResult
                        ? isCorrect
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-red-500 border-red-500 text-white'
                        : isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-amber-900 mb-2">Explanation</p>
            <p className="text-sm text-amber-800">{question.explanation}</p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {!showExplanation ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={submitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
              </>
            ) : isLastQuestion ? (
              'Finish Quiz'
            ) : (
              'Next Question'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}