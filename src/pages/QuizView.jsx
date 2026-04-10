import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function QuizView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id');
  const lessonId = urlParams.get('lesson_id');
  
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => base44.entities.Quiz.filter({ id: quizId }).then(r => r[0]),
    enabled: !!quizId,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: async () => {
      const qs = await base44.entities.QuizQuestion.filter({ quiz_id: quizId });
      return qs.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    },
    enabled: !!quizId,
  });

  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => base44.entities.Lesson.filter({ id: lessonId }).then(r => r[0]),
    enabled: !!lessonId,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      const answersArray = questions.map(q => ({
        question_id: q.id,
        selected_answer: answers[q.id] ?? -1,
        correct: answers[q.id] === q.correct_answer,
      }));

      const correctCount = answersArray.filter(a => a.correct).length;
      const score = (correctCount / questions.length) * 100;
      const passed = score >= (quiz.passing_score || 70);

      const attempt = await base44.entities.QuizAttempt.create({
        user_id: user.id,
        quiz_id: quizId,
        lesson_id: lessonId,
        score: score,
        answers: answersArray,
        passed: passed,
        attempt_date: new Date().toISOString(),
      });

      return { score, passed, answersArray };
    },
    onSuccess: (data) => {
      setResults(data);
      setSubmitted(true);
      queryClient.invalidateQueries(['user-progress']);
    },
  });

  const handleSubmit = () => {
    const unanswered = questions.filter(q => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      return; // Disabled state prevents this
    }
    submitQuizMutation.mutate();
  };

  const canSubmit = Object.keys(answers).length === questions.length;

  const handleNext = () => {
    if (lesson?.course_id) {
      navigate(createPageUrl(`CourseDetail?id=${lesson.course_id}`));
    } else {
      navigate(createPageUrl('Home'));
    }
  };

  if (quizLoading || questionsLoading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="h-12 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!quiz || !questions.length) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Not Available</h2>
              <p className="text-gray-600 mb-6">This quiz could not be found or has been removed.</p>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Passing score: {quiz.passing_score}%
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            {!submitted ? (
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} className="pb-6 border-b last:border-b-0">
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-indigo-600">Question {index + 1}</span>
                      <h3 className="text-lg font-medium mt-1">{question.question}</h3>
                    </div>

                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => setAnswers({ ...answers, [question.id]: parseInt(value) })}
                    >
                      <div className="space-y-3">
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                            <RadioGroupItem value={optionIndex.toString()} id={`q${question.id}-o${optionIndex}`} />
                            <Label htmlFor={`q${question.id}-o${optionIndex}`} className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ))}

                <div className="flex justify-between pt-4">
                  <Button 
                    onClick={() => navigate(-1)}
                    variant="outline"
                    size="lg"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitQuizMutation.isPending || !canSubmit}
                    size="lg"
                  >
                    {submitQuizMutation.isPending ? 'Submitting...' : `Submit (${Object.keys(answers).length}/${questions.length})`}
                  </Button>
                </div>
                {!canSubmit && (
                  <p className="text-sm text-amber-600 text-center mt-2">
                    Choose one answer for each question to submit
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Results Summary */}
                <div className={`p-6 rounded-lg ${results.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    {results.passed ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{results.passed ? 'Congratulations!' : 'Keep Learning'}</h3>
                      <p className="text-sm">{results.passed ? 'You passed the quiz!' : 'You can retake this lesson and quiz'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-3xl font-bold">{Math.round(results.score)}%</div>
                      <div className="text-sm text-gray-600">Your Score</div>
                    </div>
                    <div className="h-12 w-px bg-gray-300"></div>
                    <div>
                      <div className="text-3xl font-bold">
                        {results.answersArray.filter(a => a.correct).length} / {questions.length}
                      </div>
                      <div className="text-sm text-gray-600">Correct Answers</div>
                    </div>
                  </div>
                </div>

                {/* Question Review */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Review Your Answers</h3>
                  {questions.map((question, index) => {
                    const userAnswer = results.answersArray[index];
                    const isCorrect = userAnswer.correct;
                    
                    return (
                      <div key={question.id} className="p-4 rounded-lg border">
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-gray-600">Question {index + 1}</span>
                            <h4 className="font-medium mt-1">{question.question}</h4>
                          </div>
                        </div>

                        <div className="ml-8 space-y-2">
                          <div className={`p-2 rounded ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                            <span className="text-sm font-medium">Your answer: </span>
                            <span className="text-sm">{question.options[userAnswer.selected_answer]}</span>
                          </div>
                          {!isCorrect && (
                            <div className="p-2 rounded bg-green-50">
                              <span className="text-sm font-medium">Correct answer: </span>
                              <span className="text-sm">{question.options[question.correct_answer]}</span>
                            </div>
                          )}
                          {question.explanation && (
                            <div className="p-2 rounded bg-blue-50 border border-blue-200">
                              <span className="text-sm font-medium text-blue-900">Explanation: </span>
                              <span className="text-sm text-blue-800">{question.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleNext} size="lg" className="gap-2">
                    Continue Learning
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}