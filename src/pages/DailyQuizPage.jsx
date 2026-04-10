import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';
import LoadingState from '@/components/states/LoadingState';

export default function DailyQuizPage() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [verseOfDay, setVerseOfDay] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          const me = await base44.auth.me();
          setUser(me);
        }

        // Fetch verse of day (mock)
        const verse = {
          reference: 'John 3:16',
          text: 'For God so loved the world that he gave his only begotten Son, that whoever believes in him should not perish, but have eternal life.'
        };
        setVerseOfDay(verse);

        // Generate quiz questions from verse
        await generateQuizQuestions(verse);
        setLoading(false);
      } catch (err) {
        console.error('[DailyQuiz] Error:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateQuizQuestions = async (verse) => {
    setGeneratingQuestions(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create 5 multiple-choice questions based on this Bible verse: "${verse.text}" (${verse.reference})
        
For each question, provide:
- question (clear, focused question)
- options (array of 4 options)
- correctOptionIndex (0-3, the correct answer)
- explanation (brief explanation of the correct answer)`,
        response_json_schema: {
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  correctOptionIndex: { type: 'number' },
                  explanation: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('[DailyQuiz] Generation error:', error);
      // Use fallback questions
      setQuestions([
        {
          question: 'What is the main theme of this verse?',
          options: ['God\'s love', 'Fear and judgment', 'Wealth', 'Power'],
          correctOptionIndex: 0,
          explanation: 'The verse emphasizes God\'s love for the world.'
        }
      ]);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleSelectAnswer = (optionIndex) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    let correctCount = 0;
    const detailedAnswers = questions.map((q, idx) => {
      const userAnswer = userAnswers[idx];
      const isCorrect = userAnswer === q.correctOptionIndex;
      if (isCorrect) correctCount++;

      return {
        question_id: `q_${idx}`,
        question: q.question,
        user_answer: q.options[userAnswer] || 'Not answered',
        correct_answer: q.options[q.correctOptionIndex],
        is_correct: isCorrect,
        explanation: q.explanation
      };
    });

    const scorePercentage = (correctCount / questions.length) * 100;
    const result = {
      correct_answers: correctCount,
      score_percentage: scorePercentage,
      answers: detailedAnswers
    };

    setResults(result);
    setQuizCompleted(true);

    // Save result if authenticated
    if (user) {
      try {
        await base44.entities.DailyQuizResult.create({
          user_id: user.id,
          quiz_date: new Date().toISOString().split('T')[0],
          verse_reference: verseOfDay.reference,
          verse_text: verseOfDay.text,
          total_questions: questions.length,
          correct_answers: correctCount,
          score_percentage: scorePercentage,
          answers: detailedAnswers,
          completed_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('[DailyQuiz] Save result error:', err);
      }
    }
  };

  if (loading) return <LoadingState />;

  if (quizCompleted && results) {
    return <QuizResultsScreen results={results} verse={verseOfDay} questions={questions} />;
  }

  if (questions.length === 0) {
    return <LoadingState />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answered = userAnswers[currentQuestionIndex] !== undefined;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('quiz.dailyQuiz', 'Daily Quiz')}</h1>
        <div className="text-sm font-bold text-indigo-600">
          {currentQuestionIndex + 1}/{questions.length}
        </div>
      </div>

      {/* Verse Reference */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <p className="text-sm font-bold text-blue-900 mb-1">{t('quiz.basedon', 'Based on:')}</p>
        <p className="text-lg italic text-blue-800">{verseOfDay?.reference}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{currentQuestion.question}</h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(idx)}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                userAnswers[currentQuestionIndex] === idx
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    userAnswers[currentQuestionIndex] === idx
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300'
                  }`}
                >
                  {userAnswers[currentQuestionIndex] === idx && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-medium text-gray-800">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className="flex-1"
        >
          {t('common.previous', 'Previous')}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!answered}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {currentQuestionIndex === questions.length - 1
            ? t('common.finish', 'Finish')
            : t('common.next', 'Next')}
        </Button>
      </div>
    </div>
  );
}

function QuizResultsScreen({ results, verse, questions }) {
  const { t } = useI18n();
  const performanceLevel =
    results.score_percentage >= 80 ? 'Excellent' :
    results.score_percentage >= 60 ? 'Good' :
    'Keep practicing';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-6">
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-center">
          {results.score_percentage >= 60 ? (
            <CheckCircle className="w-16 h-16 text-green-600" />
          ) : (
            <XCircle className="w-16 h-16 text-orange-600" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t('quiz.results', 'Quiz Results')}</h1>
        <p className="text-gray-600">{verse.reference}</p>
      </div>

      {/* Score Display */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-6 text-white text-center shadow-lg">
        <p className="text-sm font-bold mb-2 opacity-90">{t('quiz.yourScore', 'Your Score')}</p>
        <div className="text-5xl font-bold mb-2">{Math.round(results.score_percentage)}%</div>
        <p className="text-lg font-semibold">{results.correct_answers}/{questions.length} {t('quiz.correct', 'Correct')}</p>
        <p className="mt-3 text-indigo-100">{performanceLevel}</p>
      </div>

      {/* Review Answers */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{t('quiz.reviewAnswers', 'Review Your Answers')}</h2>
        {results.answers.map((answer, idx) => (
          <div key={idx} className={`rounded-xl p-4 border-2 ${
            answer.is_correct
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3 mb-2">
              {answer.is_correct ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <p className="font-bold text-gray-900">{answer.question}</p>
                <p className={`text-sm mt-1 ${answer.is_correct ? 'text-green-800' : 'text-red-800'}`}>
                  {t('quiz.yourAnswer', 'Your answer')}: {answer.user_answer}
                </p>
                {!answer.is_correct && (
                  <p className="text-sm text-green-800 mt-1">
                    {t('quiz.correctAnswer', 'Correct answer')}: {answer.correct_answer}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white bg-opacity-60 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-medium mb-1">{t('quiz.explanation', 'Explanation')}:</p>
              <p>{answer.explanation}</p>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => window.location.reload()}>
        {t('quiz.tryAgainTomorrow', 'Try Again Tomorrow')}
      </Button>
    </div>
  );
}