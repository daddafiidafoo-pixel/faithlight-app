import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TrainingQuiz() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id');
  const selectedRole = urlParams.get('role') || 'general';

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: quiz } = useQuery({
    queryKey: ['training-quiz', quizId],
    queryFn: async () => {
      const quizzes = await base44.entities.TrainingQuiz.filter({ id: quizId });
      return quizzes[0];
    },
    enabled: !!quizId,
  });

  const { data: allQuestions = [] } = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => base44.entities.TrainingQuizQuestion.filter({ quiz_id: quizId }, 'order'),
    enabled: !!quizId,
  });

  // Filter questions based on role: 7 core + 3 role-specific
  const questions = React.useMemo(() => {
    if (!allQuestions.length) return [];
    
    const coreQuestions = allQuestions.filter(q => q.role_specific === 'core' || !q.role_specific);
    const roleQuestions = allQuestions.filter(q => q.role_specific === selectedRole);
    
    // Take first 7 core questions and 3 role-specific questions
    const selectedCore = coreQuestions.slice(0, 7);
    const selectedRole = roleQuestions.slice(0, 3);
    
    return [...selectedCore, ...selectedRole];
  }, [allQuestions, selectedRole]);

  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      let correctCount = 0;
      const detailedAnswers = questions.map((q, index) => {
        const userAnswer = parseInt(answers[q.id]);
        const isCorrect = userAnswer === q.correct_answer_index;
        if (isCorrect) correctCount++;
        return {
          question: q.question,
          userAnswer,
          correctAnswer: q.correct_answer_index,
          isCorrect,
        };
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= quiz.pass_score;

      const result = await base44.entities.UserQuizResult.create({
        user_id: user.id,
        quiz_id: quizId,
        course_id: quiz.course_id,
        score,
        passed,
        answers: detailedAnswers,
        attempt_number: 1,
      });

      return { score, passed, correctCount, detailedAnswers };
    },
    onSuccess: (data) => {
      setResults(data);
      setSubmitted(true);
      queryClient.invalidateQueries(['course-quiz-results']);
      if (data.passed) {
        toast.success(`Congratulations! You passed with ${data.score}%`);
      } else {
        toast.error(`You scored ${data.score}%. You need ${quiz.pass_score}% to pass.`);
      }
    },
  });

  const handleSubmit = () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error('Please answer all questions');
      return;
    }
    submitQuizMutation.mutate();
  };

  if (!quiz) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Quiz Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            <div className="flex gap-3">
              <Badge>{questions.length} questions</Badge>
              <Badge variant="outline">Pass score: {quiz.pass_score}%</Badge>
              {quiz.time_limit_minutes && (
                <Badge variant="outline">{quiz.time_limit_minutes} minutes</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {!submitted ? (
          <>
            {/* Questions */}
            <div className="space-y-6 mb-8">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">
                      {index + 1}. {question.question}
                    </h3>
                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={optIndex.toString()} id={`q${question.id}-${optIndex}`} />
                          <Label htmlFor={`q${question.id}-${optIndex}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitQuizMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              {submitQuizMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </>
        ) : (
          <>
            {/* Results */}
            <Card className={results.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <CardContent className="p-8 text-center">
                {results.passed ? (
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                )}
                <h2 className="text-3xl font-bold mb-2">
                  {results.passed ? 'Congratulations!' : 'Not Quite There'}
                </h2>
                <p className="text-xl mb-4">Your Score: {results.score}%</p>
                <p className="text-gray-700">
                  You got {results.correctCount} out of {questions.length} questions correct
                </p>
                {!results.passed && (
                  <p className="text-red-600 font-semibold mt-4">
                    You need {quiz.pass_score}% to pass
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Answer Review */}
            <div className="mt-8 space-y-4">
              <h3 className="text-2xl font-bold">Review Your Answers</h3>
              {questions.map((question, index) => {
                const answer = results.detailedAnswers[index];
                return (
                  <Card key={question.id} className={answer.isCorrect ? 'bg-green-50' : 'bg-red-50'}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold mb-2">{question.question}</h4>
                          <p className="text-sm mb-1">
                            <strong>Your answer:</strong> {question.options[answer.userAnswer]}
                          </p>
                          {!answer.isCorrect && (
                            <p className="text-sm mb-2">
                              <strong>Correct answer:</strong> {question.options[answer.correctAnswer]}
                            </p>
                          )}
                          {question.explanation && (
                            <p className="text-sm text-gray-700 mt-2">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-4 mt-8">
              <Button onClick={() => window.history.back()} className="flex-1">
                Back to Course
              </Button>
              {quiz.allow_retake && !results.passed && (
                <Button onClick={() => window.location.reload()} className="flex-1 bg-blue-600">
                  Retake Quiz
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}