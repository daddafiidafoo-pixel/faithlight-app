import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function QuizGameScreen({
  quiz,
  questions,
  language = 'en',
  onAnswer,
  onComplete,
  onBack,
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [scores, setScores] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const correctAnswerIndex = currentQuestion?.correctAnswer;
  const isCorrect = selectedAnswer === correctAnswerIndex;

  // Countdown timer
  useEffect(() => {
    if (answered || !currentQuestion) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(null);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [answered, currentQuestion]);

  const handleAnswer = (answerIndex) => {
    if (answered) return;
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    setShowFeedback(true);
    setScores([...scores, answerIndex === correctAnswerIndex ? 1 : 0]);
    setTimeLeft(15);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setShowFeedback(false);
    } else {
      // Quiz complete
      const correctCount = scores.filter(s => s === 1).length;
      const percentage = (correctCount / questions.length) * 100;
      let resultLevel = {
        key: 'excellent',
        text: percentage >= 90 ? 'Excellent' : percentage >= 70 ? 'Good' : 'Keep Trying',
      };
      onComplete({
        score: correctCount,
        percentage,
        correctCount,
        totalQuestions: questions.length,
        resultLevel,
      });
    }
  };

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const questionText = currentQuestion.text[language] || currentQuestion.text.en;
  const options = currentQuestion.options;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">
              {quiz?.title?.[language] || quiz?.title?.en}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Timer Circle */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ scale: timeLeft <= 5 ? 1.05 : 1 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl ${
              timeLeft <= 5
                ? 'bg-red-100 text-red-600'
                : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            {timeLeft}s
          </motion.div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-8 leading-relaxed">
            {questionText}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option, idx) => {
              const optionText = typeof option === 'string' ? option : option[language] || option.en;
              const isSelected = selectedAnswer === idx;
              const isCorrectAnswer = idx === correctAnswerIndex;
              let buttonClass = 'bg-white border-2 border-gray-200 hover:border-indigo-400 text-gray-900';

              if (answered) {
                if (isCorrectAnswer) {
                  buttonClass = 'bg-green-50 border-2 border-green-500 text-gray-900';
                } else if (isSelected && !isCorrect) {
                  buttonClass = 'bg-red-50 border-2 border-red-500 text-gray-900';
                } else if (isSelected) {
                  buttonClass = 'bg-indigo-50 border-2 border-indigo-500 text-gray-900';
                } else {
                  buttonClass = 'bg-gray-50 border-2 border-gray-200 text-gray-600 opacity-50';
                }
              } else if (isSelected) {
                buttonClass = 'bg-indigo-50 border-2 border-indigo-500 text-gray-900';
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!answered ? { scale: 1.02 } : {}}
                  whileTap={!answered ? { scale: 0.98 } : {}}
                  onClick={() => !answered && handleAnswer(idx)}
                  disabled={answered}
                  className={`w-full p-4 rounded-xl font-medium transition-all text-left flex items-center justify-between ${buttonClass}`}
                >
                  <span>{optionText}</span>
                  {answered && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg text-sm ${
                isCorrect
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {isCorrect ? '✅ Correct!' : '❌ Incorrect.'}
              {currentQuestion.explanation && (
                <p className="mt-2">{currentQuestion.explanation[language] || currentQuestion.explanation.en}</p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Next Button */}
        {answered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <Button
              onClick={handleNext}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 rounded-xl"
            >
              {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}