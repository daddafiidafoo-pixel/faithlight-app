import React, { useState } from 'react';
import { ChevronRight, Clock } from 'lucide-react';

export default function QuizPlayer({ quiz, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [startTime] = useState(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleSelectAnswer = (optionIndex) => {
    if (!isSubmitted) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion]: optionIndex,
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = () => {
    const completionTime = Math.floor((Date.now() - startTime) / 1000);
    const score = quiz.questions.filter(
      (q, idx) => selectedAnswers[idx] === q.correct_answer
    ).length;

    const answers = quiz.questions.map((q, idx) => ({
      question_id: q.id,
      selected_answer: selectedAnswers[idx],
      correct_answer: q.correct_answer,
      is_correct: selectedAnswers[idx] === q.correct_answer,
    }));

    onComplete({
      score,
      total_questions: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
      answers,
      completion_time_seconds: completionTime,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{quiz.title}</h1>
          <p className="text-slate-600">{quiz.passage_reference}</p>
          {quiz.topic && (
            <p className="text-sm text-slate-500 mt-1">Topic: {quiz.topic}</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              const isCorrect = index === question.correct_answer;
              const showResult = isSubmitted && selectedAnswers[currentQuestion] !== undefined;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectAnswer(index)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    showResult
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 bg-slate-50'
                      : isSelected
                      ? 'border-violet-600 bg-violet-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  } disabled:cursor-default`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-500'
                            : isSelected
                            ? 'border-red-500 bg-red-500'
                            : 'border-slate-300'
                          : isSelected
                          ? 'border-violet-600 bg-violet-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {(showResult && (isCorrect || isSelected)) && (
                        <span className="text-white text-sm font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-slate-800 font-medium">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation (shown after submit) */}
          {isSubmitted && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-blue-900 mb-2">Explanation:</p>
              <p className="text-sm text-blue-800">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {!isSubmitted ? (
            <>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentQuestion === quiz.questions.length - 1}
                className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700"
              >
                Submit Quiz
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 bg-slate-600 text-white py-3 rounded-xl font-medium hover:bg-slate-700"
            >
              Take Another Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}