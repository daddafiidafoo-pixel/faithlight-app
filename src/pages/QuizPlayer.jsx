import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useI18n } from '@/components/I18nProvider';
import quizzes from '@/components/quizzes';
import QuizGameScreen from '@/components/quiz/QuizGameScreen';
import QuizResults from '@/components/quiz/QuizResults';

export default function QuizPlayer() {
  const { lang } = useI18n();
  const [searchParams] = useSearchParams();
  const categoryKey = searchParams.get('category');
  const difficulty = searchParams.get('difficulty') || 'easy';

  const [screen, setScreen] = useState('loading'); // 'loading', 'game', 'results'
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState(null);

  // Load quiz on mount
  useEffect(() => {
    if (!categoryKey) {
      setScreen('error');
      return;
    }

    // Find quiz by category and difficulty
    const foundQuiz = quizzes.quizzes.find(
      q => q.category === categoryKey && q.difficulty === difficulty
    );

    if (!foundQuiz) {
      setScreen('error');
      return;
    }

    // Shuffle questions (optional)
    const shuffledQuestions = [...foundQuiz.questions].sort(() => Math.random() - 0.5);
    setQuiz(foundQuiz);
    setQuestions(shuffledQuestions);
    setScreen('game');
  }, [categoryKey, difficulty]);

  const handleQuizComplete = (resultData) => {
    setResults(resultData);
    setScreen('results');
  };

  const handleRetry = () => {
    // Reshuffle questions
    const shuffledQuestions = [...quiz.questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffledQuestions);
    setResults(null);
    setScreen('game');
  };

  const handleBackToCategories = () => {
    window.location.href = createPageUrl('QuizCategories');
  };

  if (screen === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (screen === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h1>
          <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist.</p>
          <a href={createPageUrl('QuizCategories')} className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Back to Categories
          </a>
        </div>
      </div>
    );
  }

  if (screen === 'game' && quiz && questions.length > 0) {
    return (
      <QuizGameScreen
        quiz={quiz}
        questions={questions}
        language={lang}
        onAnswer={() => {}}
        onComplete={handleQuizComplete}
        onBack={handleBackToCategories}
      />
    );
  }

  if (screen === 'results' && results) {
    return (
      <QuizResults
        score={results.score}
        percentage={results.percentage}
        correctCount={results.correctCount}
        totalQuestions={results.totalQuestions}
        resultLevel={results.resultLevel}
        language={lang}
        onRetry={handleRetry}
        onBackToCategories={handleBackToCategories}
      />
    );
  }

  return null;
}