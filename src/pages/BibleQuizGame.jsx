import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import QuizPlayer from '@/components/quiz/QuizPlayer';
import QuizResults from '@/components/quiz/QuizResults';

export default function BibleQuizGame() {
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const currentUser = await base44.auth.me().catch(() => null);
        setUser(currentUser);

        // Fetch a random quiz
        const quizzes = await base44.entities.BibleQuiz.list('-created_date', 1);
        if (quizzes.length > 0) {
          setQuiz(quizzes[0]);
        }
      } catch (error) {
        console.error('Failed to load quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, []);

  const handleQuizComplete = async (quizResults) => {
    setResults(quizResults);

    // Save attempt if user is logged in
    if (user) {
      try {
        await base44.entities.UserQuizAttempt.create({
          user_email: user.email,
          quiz_id: quiz.id,
          quiz_title: quiz.title,
          score: quizResults.score,
          total_questions: quizResults.total_questions,
          percentage: quizResults.percentage,
          answers: quizResults.answers,
          completion_time_seconds: quizResults.completion_time_seconds,
        });
      } catch (error) {
        console.error('Failed to save quiz attempt:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No quizzes available</p>
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (results) {
    return <QuizResults results={results} quiz={quiz} />;
  }

  return <QuizPlayer quiz={quiz} onComplete={handleQuizComplete} />;
}