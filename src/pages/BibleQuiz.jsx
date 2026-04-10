import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Loader2, RotateCcw, ChevronRight, CheckCircle2, XCircle, Trophy, Calendar } from 'lucide-react';
import { useLanguageStore } from '@/components/languageStore';
import { formatDistanceToNow } from 'date-fns';

const PLANS = ['overcoming_anxiety', 'growth', 'strength', 'forgiveness'];

const PLAN_NAMES = {
  overcoming_anxiety: 'Overcoming Anxiety',
  growth: 'Spiritual Growth',
  strength: 'Finding Strength',
  forgiveness: 'Grace & Forgiveness',
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function BibleQuiz() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('overcoming_anxiety');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [previousScores, setPreviousScores] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadQuiz();
      loadPreviousScores();
    }
  }, [isAuthenticated, user, selectedPlan]);

  const loadQuiz = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      // Check if quiz already done today
      const existing = await base44.entities.DailyQuizAttempt.filter({
        userEmail: user.email,
        quizDate: getTodayKey(),
      });
      if (existing.length > 0) {
        setQuiz(existing[0].questions);
        setAnswers(
          existing[0].answers.reduce((acc, ans, idx) => {
            acc[idx] = ans;
            return acc;
          }, {})
        );
        setScore(existing[0].score);
        setSubmitted(true);
      } else {
        await generateQuiz();
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    try {
      const prompt = `Generate a Bible quiz for the reading plan "${PLAN_NAMES[selectedPlan]}". Create 4-5 multiple choice questions based on key verses and themes from this plan. 
Return JSON: { questions: [{ question: string, verse?: string, options: [string, string, string, string], correctIndex: number }, ...] }`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  verse: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  correctIndex: { type: 'number' },
                },
              },
            },
          },
        },
      });

      setQuiz(result.questions || []);
      setAnswers({});
      setSubmitted(false);
      setScore(null);
    } catch (e) {
      console.error(e);
      setError('Failed to generate quiz. Please try again.');
    }
  };

  const loadPreviousScores = async () => {
    try {
      const records = await base44.entities.DailyQuizAttempt.filter(
        { userEmail: user.email, readingPlanId: selectedPlan },
        '-quizDate',
        10
      );
      setPreviousScores(records);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || Object.keys(answers).length !== quiz.length) {
      setError('Please answer all questions');
      return;
    }

    let correctCount = 0;
    quiz.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correctCount++;
    });
    const finalScore = Math.round((correctCount / quiz.length) * 100);
    setScore(finalScore);

    try {
      await base44.entities.DailyQuizAttempt.create({
        userEmail: user.email,
        quizDate: getTodayKey(),
        readingPlanId: selectedPlan,
        questions: quiz,
        answers: Object.values(answers).map(Number),
        score: finalScore,
        totalQuestions: quiz.length,
        completedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
    }

    setSubmitted(true);
    loadPreviousScores();
  };

  const handleReset = () => {
    setQuiz(null);
    setAnswers({});
    setScore(null);
    setSubmitted(false);
    generateQuiz();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto text-indigo-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Bible Quiz</h1>
          <p className="text-gray-500 mb-6">Sign in to test your knowledge and unlock badges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-28">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={24} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Bible Quiz</h1>
            <p className="text-sm text-gray-500">{getTodayKey()}</p>
          </div>
        </div>

        {/* Plan selector */}
        <div className="mb-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Reading Plan</p>
          <div className="grid grid-cols-2 gap-2">
            {PLANS.map(plan => (
              <button
                key={plan}
                onClick={() => !submitted && setSelectedPlan(plan)}
                disabled={submitted}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
                  selectedPlan === plan
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 text-gray-700 hover:border-indigo-300 disabled:opacity-50'
                }`}
              >
                {PLAN_NAMES[plan]}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
            {!submitted && (
              <button onClick={generateQuiz} className="ml-2 underline font-semibold text-xs">
                Retry
              </button>
            )}
          </div>
        )}

        {/* Quiz content */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={32} className="animate-spin mx-auto text-indigo-600 mb-3" />
            <p className="text-gray-500">Generating quiz...</p>
          </div>
        ) : quiz && quiz.length > 0 ? (
          <div className="space-y-6">
            {/* Questions */}
            {!submitted ? (
              <>
                {quiz.map((q, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{q.question}</h3>
                        {q.verse && <p className="text-xs text-gray-500 mt-1">{q.verse}</p>}
                      </div>
                    </div>

                    <div className="space-y-2 ml-11">
                      {q.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => setAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                            answers[idx] === optIdx
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <span className="inline-block w-5 h-5 rounded-full border-2 text-xs flex items-center justify-center mr-2 font-bold">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length !== quiz.length}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 size={18} /> Submit Answers
                </button>
              </>
            ) : (
              <>
                {/* Score display */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-8 text-white text-center mb-6 shadow-lg"
                >
                  <Trophy size={48} className="mx-auto mb-3" />
                  <p className="text-sm opacity-90 mb-1">Your Score</p>
                  <p className="text-5xl font-bold">{score}%</p>
                  <p className={`text-sm mt-2 ${score >= 80 ? 'text-yellow-200' : 'text-blue-100'}`}>
                    {score >= 90 ? '🌟 Excellent!' : score >= 80 ? '🎯 Great job!' : score >= 70 ? '✓ Good effort' : '📚 Keep learning'}
                  </p>
                </motion.div>

                {/* Results breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Review Answers</h3>
                  <div className="space-y-3">
                    {quiz.map((q, idx) => {
                      const isCorrect = answers[idx] === q.correctIndex;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border-l-4 ${
                            isCorrect
                              ? 'bg-green-50 border-green-500'
                              : 'bg-red-50 border-red-500'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{q.question}</p>
                              <p className={`text-xs mt-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {isCorrect
                                  ? `✓ ${q.options[answers[idx]]}`
                                  : `✗ You said: ${q.options[answers[idx]]} | Correct: ${q.options[q.correctIndex]}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reset button */}
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw size={16} /> Try Another Plan
                </button>
              </>
            )}

            {/* Previous scores */}
            {previousScores.length > 0 && (
              <div className="mt-8 border-t-2 border-gray-100 pt-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-600" />
                  Score History ({PLAN_NAMES[selectedPlan]})
                </h3>
                <div className="space-y-2">
                  {previousScores.slice(0, 5).map((attempt, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg text-sm">
                      <span className="text-gray-600">
                        {new Date(attempt.quizDate).toLocaleDateString()} • {attempt.totalQuestions} questions
                      </span>
                      <span className={`font-bold ${attempt.score >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                        {attempt.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">No quiz available</p>
            <button
              onClick={generateQuiz}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Generate Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}