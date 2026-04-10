import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function FinalExam() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const trackType = urlParams.get('type'); // 'biblical' or 'leadership'

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: exam } = useQuery({
    queryKey: ['final-exam', trackType],
    queryFn: async () => {
      const exams = await base44.entities.FinalExam.filter({ track_type: trackType });
      return exams[0];
    },
    enabled: !!trackType,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['final-exam-questions', exam?.id],
    queryFn: () => base44.entities.FinalExamQuestion.filter({ exam_id: exam.id }, 'order'),
    enabled: !!exam,
  });

  useEffect(() => {
    if (exam?.time_limit_minutes && !submitted) {
      setTimeLeft(exam.time_limit_minutes * 60);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [exam, submitted]);

  const submitExamMutation = useMutation({
    mutationFn: async () => {
      let correctCount = 0;
      const detailedAnswers = questions.map((q) => {
        const userAnswer = parseInt(answers[q.id]);
        const isCorrect = userAnswer === q.correct_answer_index;
        if (isCorrect) correctCount++;
        return {
          question: q.question,
          userAnswer,
          correctAnswer: q.correct_answer_index,
          isCorrect,
          category: q.category,
        };
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= exam.pass_score;

      await base44.entities.UserFinalExamResult.create({
        user_id: user.id,
        exam_id: exam.id,
        track_type: trackType,
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
      queryClient.invalidateQueries(['user-exam-results']);
      if (data.passed) {
        toast.success(`Congratulations! You passed with ${data.score}%`);
      } else {
        toast.error(`You scored ${data.score}%. You need ${exam.pass_score}% to pass.`);
      }
    },
  });

  const handleSubmit = () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error('Please answer all questions');
      return;
    }
    submitExamMutation.mutate();
  };

  if (!exam || !user) return <div className="p-12 text-center">Loading...</div>;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (Object.keys(answers).length / questions.length) * 100;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {!submitted ? (
          <>
            {/* Exam Header */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-3xl">{exam.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{exam.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-3">
                    <Badge>{questions.length} questions</Badge>
                    <Badge variant="outline">Pass: {exam.pass_score}%</Badge>
                  </div>
                  {timeLeft !== null && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="text-lg font-bold text-orange-600">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Object.keys(answers).length} / {questions.length}</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-6 mb-8">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        answers[question.id] !== undefined ? 'bg-green-600 text-white' : 'bg-gray-200'
                      }`}>
                        {answers[question.id] !== undefined ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">{question.category}</Badge>
                        <h3 className="font-bold text-lg">{question.question}</h3>
                      </div>
                    </div>
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
              disabled={submitExamMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              {submitExamMutation.isPending ? 'Submitting...' : 'Submit Final Exam'}
            </Button>
          </>
        ) : (
          <>
            {/* Results */}
            <Card className={results.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <CardContent className="p-8 text-center">
                {results.passed ? (
                  <>
                    <Award className="w-20 h-20 text-yellow-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
                    <p className="text-xl mb-4">You passed the final exam!</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Not Quite There</h2>
                  </>
                )}
                <p className="text-xl mb-4">Your Score: {results.score}%</p>
                <p className="text-gray-700">
                  You got {results.correctCount} out of {questions.length} questions correct
                </p>
                {results.passed && (
                  <p className="text-green-700 font-semibold mt-4">
                    ✅ You have completed all requirements. You can now request your certificate!
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4 mt-8">
              <Button onClick={() => window.location.href = '/TrainingHome'} className="flex-1">
                Back to Training
              </Button>
              {results.passed && (
                <Button onClick={() => window.location.href = '/MyCertificates'} className="flex-1 bg-yellow-600">
                  Request Certificate
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}