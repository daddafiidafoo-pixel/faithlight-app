import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getQuizForChapter, saveQuizAttempt } from '@/lib/quizzes';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizResults from '@/components/quiz/QuizResults';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const CHAPTERS = ['JHN_3', 'ROM_5', 'PSA_23'];

export default function Quiz() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  if (!selectedChapter) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Bible Quiz</h1>
          <p className="text-indigo-100">Test your knowledge of Scripture</p>
        </div>

        <div className="max-w-2xl mx-auto p-4 grid gap-4">
          {CHAPTERS.map(chapter => {
            const quiz = getQuizForChapter(chapter);
            return (
              <button
                key={chapter}
                onClick={() => {
                  setSelectedChapter(chapter);
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setShowResults(false);
                }}
                className="card p-6 rounded-xl text-left hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">{chapter.replace('_', ' ')}</h3>
                <p className="text-sm text-slate-600">
                  {quiz.length} question{quiz.length !== 1 ? 's' : ''}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const quiz = getQuizForChapter(selectedChapter);
  if (!quiz.length) {
    return <div className="p-6 text-center">No quiz available for this chapter</div>;
  }

  const question = quiz[currentQuestion];
  const score = answers.filter((ans, idx) => ans === quiz[idx].correct).length;

  const handleAnswer = (answerIdx) => {
    const newAnswers = [...answers, answerIdx];
    setAnswers(newAnswers);

    if (currentQuestion === quiz.length - 1) {
      saveQuizAttempt(user.email, selectedChapter, score, quiz.length);
      setShowResults(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 z-30 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedChapter(null)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Quiz: {selectedChapter.replace('_', ' ')}</h1>
          <p className="text-xs text-slate-500">
            Question {currentQuestion + 1} of {quiz.length}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Progress bar */}
        <div className="h-1 bg-slate-200 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
          />
        </div>

        {showResults ? (
          <QuizResults
            score={score}
            totalQuestions={quiz.length}
            onRetry={() => {
              setCurrentQuestion(0);
              setAnswers([]);
              setShowResults(false);
            }}
            onClose={() => setSelectedChapter(null)}
          />
        ) : (
          <QuizQuestion
            question={question}
            onAnswer={handleAnswer}
            answered={answers[currentQuestion] !== undefined}
            selectedAnswer={answers[currentQuestion]}
          />
        )}
      </div>
    </div>
  );
}