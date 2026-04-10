import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, Trophy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function InteractiveLessonQuiz({ 
  lessonId, 
  lessonTitle,
  lessonContent,
  userId,
  quizType = 'mid', // 'mid' or 'end'
  onComplete,
  minPassScore = 70
}) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    generateQuiz();
  }, [lessonId, quizType]);

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
      const questionCount = quizType === 'mid' ? 3 : 5;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate ${questionCount} ${quizType === 'mid' ? 'knowledge-check' : 'comprehensive'} quiz questions for this lesson.

LESSON: ${lessonTitle}
CONTENT EXCERPT: ${lessonContent.substring(0, 500)}...

Requirements:
- ${quizType === 'mid' ? 'Quick knowledge checks on key concepts' : 'Comprehensive questions covering all main points'}
- Multiple choice (4 options each)
- Clear, unambiguous questions
- Realistic distractors

Provide JSON:
{
  "questions": [
    {
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0-3,
      "explanation": "why this is correct"
    }
  ]
}`,
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
                  correctAnswer: { type: 'number' },
                  explanation: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setQuestions(response.questions || []);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (questionIndex, answerIndex) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    try {
      // Calculate score
      let correct = 0;
      questions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) {
          correct++;
        }
      });

      const finalScore = (correct / questions.length) * 100;
      setScore(finalScore);

      // Record quiz result
      await base44.entities.UserQuizResult.create({
        user_id: userId,
        lesson_id: lessonId,
        score: finalScore,
        total_questions: questions.length,
        correct_answers: correct,
        quiz_type: quizType,
        topic: lessonTitle
      });

      // Track learning metrics
      const incorrectQuestions = questions
        .map((q, idx) => answers[idx] !== q.correctAnswer ? q.question : null)
        .filter(Boolean);

      if (incorrectQuestions.length > 0) {
        await base44.entities.UserLearningMetrics.create({
          user_id: userId,
          lesson_id: lessonId,
          metric_type: 'struggle_area',
          metric_value: incorrectQuestions.length,
          metadata: {
            topic: lessonTitle,
            incorrect_answers: incorrectQuestions,
            confidence_level: finalScore >= 80 ? 'high' : finalScore >= 60 ? 'medium' : 'low'
          }
        });
      }

      // Generate AI feedback
      const feedbackResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide encouraging feedback for this quiz performance:

Score: ${finalScore.toFixed(0)}%
Correct: ${correct}/${questions.length}
Quiz Type: ${quizType === 'mid' ? 'Mid-lesson checkpoint' : 'End-of-lesson assessment'}

Provide JSON with:
{
  "message": "personalized encouraging message",
  "nextSteps": "what they should do next",
  "strengths": "what they did well"
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            nextSteps: { type: 'string' },
            strengths: { type: 'string' }
          }
        }
      });

      setFeedback(feedbackResponse);
      setShowResults(true);

      if (finalScore >= minPassScore) {
        toast.success(`Great job! You scored ${finalScore.toFixed(0)}%`);
      } else {
        toast.error(`You scored ${finalScore.toFixed(0)}%. Review and try again!`);
      }

      if (onComplete) {
        onComplete(finalScore, finalScore >= minPassScore);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isGenerating) {
    return (
      <Card className="border-indigo-200">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating personalized quiz...</p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  if (showResults) {
    const passed = score >= minPassScore;
    return (
      <Card className={`border-2 ${passed ? 'border-green-300' : 'border-orange-300'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <Trophy className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-600" />
            )}
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`text-center p-6 rounded-lg ${passed ? 'bg-green-50' : 'bg-orange-50'}`}>
            <p className="text-5xl font-bold mb-2">{score.toFixed(0)}%</p>
            <p className="text-gray-600">
              {questions.filter((q, idx) => answers[idx] === q.correctAnswer).length} / {questions.length} correct
            </p>
          </div>

          {feedback && (
            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-1">Feedback</p>
                <p className="text-sm text-blue-800">{feedback.message}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900 mb-1">Your Strengths</p>
                <p className="text-sm text-green-800">{feedback.strengths}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-900 mb-1">Next Steps</p>
                <p className="text-sm text-purple-800">{feedback.nextSteps}</p>
              </div>
            </div>
          )}

          {/* Review wrong answers */}
          <div className="space-y-3">
            <p className="font-semibold text-gray-900">Review Your Answers</p>
            {questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={idx} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="font-semibold text-sm">{q.question}</p>
                  </div>
                  <p className="text-xs text-gray-600 ml-7 mb-1">
                    Your answer: {q.options[userAnswer]}
                  </p>
                  {!isCorrect && (
                    <>
                      <p className="text-xs text-green-700 ml-7 mb-1">
                        Correct: {q.options[q.correctAnswer]}
                      </p>
                      <p className="text-xs text-gray-700 ml-7 italic">
                        {q.explanation}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {!passed && (
            <Button 
              onClick={() => {
                setAnswers({});
                setCurrentQuestion(0);
                setShowResults(false);
                generateQuiz();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Retry Quiz
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  const allAnswered = questions.every((_, idx) => answers[idx] !== undefined);

  return (
    <Card className="border-indigo-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {quizType === 'mid' ? '📝 Knowledge Check' : '🎯 Final Assessment'}
          </CardTitle>
          <Badge variant="outline">
            Question {currentQuestion + 1} / {questions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div>
          <p className="text-lg font-semibold text-gray-900 mb-4">{currentQ.question}</p>
          
          <RadioGroup
            value={answers[currentQuestion]?.toString()}
            onValueChange={(value) => handleAnswer(currentQuestion, parseInt(value))}
          >
            {currentQ.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200 mb-2">
                <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion] === undefined}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={submitQuiz}
              disabled={!allAnswered || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          )}
        </div>

        {/* Answer status */}
        <div className="flex gap-2 flex-wrap">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                answers[idx] !== undefined
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}