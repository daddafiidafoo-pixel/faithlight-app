import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { validateQuiz } from './quizValidator';

export default function AIQuizGenerator({ book, chapter, verses, isDarkMode, userLanguage = 'en' }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const generateQuiz = async () => {
    if (!verses || verses.length === 0) {
      toast.error('No verses available');
      return;
    }

    setLoading(true);
    try {
      const verseText = verses.map(v => `${v.verse}. ${v.text}`).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehension quiz about ${book} ${chapter} with 5 multiple-choice questions. 
Each question should test understanding of the passage content.
Provide ONLY valid JSON (no markdown, no extra text) in this exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctIndex": 0
    }
  ]
}

PASSAGE:
${verseText}`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  correctIndex: { type: 'number' }
                }
              }
            }
          }
        }
      });

      // Validate questions before showing
      const qs = response.questions || [];
      const { invalidQuestions } = validateQuiz(qs);
      if (invalidQuestions.length > 0) {
        console.warn('Quiz validation: flagged questions', invalidQuestions);
        // Filter out invalid, keep valid ones
        const valid = qs.filter((_, i) => !invalidQuestions.find(q => q.index === i));
        response.questions = valid.length >= 3 ? valid : qs; // fallback to all if too few pass
      }
      setQuiz(response);
      setAnswers({});
      setSubmitted(false);
      setScore(null);
      toast.success('Quiz generated!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (!submitted) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: optionIndex
      }));
    }
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;

    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const percentage = Math.round((correct / quiz.questions.length) * 100);
    setScore({ correct, total: quiz.questions.length, percentage });
    setSubmitted(true);
  };

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  return (
    <>
      <Button
        onClick={() => {
          setShowQuiz(true);
          if (!quiz) generateQuiz();
        }}
        variant="outline"
        size="sm"
        className="gap-2"
        style={{ borderColor, color: primaryColor }}
      >
        <Sparkles className="w-4 h-4" />
        Quick Quiz
      </Button>

      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: cardColor }}>
          <DialogHeader>
            <DialogTitle style={{ color: textColor }}>
              {book} {chapter} - Comprehension Quiz
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: primaryColor }} />
                <p style={{ color: mutedColor }}>Generating quiz...</p>
              </div>
            ) : quiz ? (
              <>
                {submitted && score && (
                  <Card style={{ backgroundColor: bgColor, borderColor }}>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2" style={{ color: score.percentage >= 80 ? '#22C55E' : score.percentage >= 60 ? '#F59E0B' : '#EF4444' }}>
                          {score.percentage}%
                        </div>
                        <p style={{ color: textColor }} className="font-semibold">
                          You got {score.correct} out of {score.total} correct!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {quiz.questions.map((q, idx) => (
                    <Card key={q.id} style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}>
                      <CardContent className="pt-6">
                        <p className="font-semibold mb-4" style={{ color: textColor }}>
                          {idx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => {
                            const isSelected = answers[q.id] === optIdx;
                            const isCorrect = optIdx === q.correctIndex;
                            const showResult = submitted && isSelected;

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleAnswerSelect(q.id, optIdx)}
                                disabled={submitted}
                                className="w-full p-3 rounded-lg text-left transition-all"
                                style={{
                                  backgroundColor: submitted
                                    ? isCorrect
                                      ? '#ECFDF5'
                                      : isSelected
                                      ? '#FEE2E2'
                                      : borderColor
                                    : isSelected
                                    ? primaryColor
                                    : borderColor,
                                  color: isSelected && !submitted ? '#FFFFFF' : textColor,
                                  border: `2px solid ${isSelected ? primaryColor : 'transparent'}`
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-5 h-5 rounded border-2 flex items-center justify-center"
                                    style={{
                                      borderColor: submitted
                                        ? isCorrect
                                          ? '#22C55E'
                                          : isSelected
                                          ? '#EF4444'
                                          : borderColor
                                        : primaryColor,
                                      backgroundColor: isSelected && !submitted ? primaryColor : 'transparent'
                                    }}
                                  >
                                    {submitted && (
                                      <>
                                        {isCorrect && <Check className="w-4 h-4" style={{ color: '#22C55E' }} />}
                                        {isSelected && !isCorrect && <X className="w-4 h-4" style={{ color: '#EF4444' }} />}
                                      </>
                                    )}
                                  </div>
                                  <span>{option}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  {!submitted ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuiz(null);
                          setAnswers({});
                        }}
                        className="flex-1"
                      >
                        Generate New Quiz
                      </Button>
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(answers).length !== quiz.questions.length}
                        className="flex-1"
                        style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                      >
                        Submit Answers
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuiz(null);
                          setAnswers({});
                          setSubmitted(false);
                          setScore(null);
                        }}
                        className="flex-1"
                      >
                        Try Another Quiz
                      </Button>
                      <Button
                        onClick={() => setShowQuiz(false)}
                        className="flex-1"
                        style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                      >
                        Close
                      </Button>
                    </>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}