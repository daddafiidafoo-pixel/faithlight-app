import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AIQuizGenerator({ lessonTitle, lessonContent, language = 'en' }) {
  const [loading, setLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [error, setError] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');

  const generateQuiz = async () => {
    if (!lessonContent) {
      setError('No lesson content available to create quiz');
      return;
    }

    setLoading(true);
    setError('');
    setQuizQuestions(null);

    try {
      const difficultyLevels = {
        easy: 'basic comprehension and recall',
        medium: 'understanding and application',
        hard: 'critical thinking and synthesis',
      };

      const prompt = `You are an expert Bible teacher creating quiz questions for FaithLight, a biblical learning platform.

Create ${questionCount} multiple-choice quiz questions based on this lesson content in ${language === 'om' ? 'Afaan Oromo' : 'English'}:

**Lesson Title:** ${lessonTitle}

**Content:**
${lessonContent}

Requirements:
1. Questions should test ${difficultyLevels[difficulty]}
2. Each question has exactly 4 options (A, B, C, D)
3. Only ONE correct answer per question
4. Options should be realistic and test comprehension
5. Avoid trick questions
6. Base all questions on the lesson content
7. Include mix of factual and application questions

Return a JSON object with:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer_index": 0,
      "explanation": "Why this is correct"
    }
  ]
}`;

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
                  options: { type: 'array', items: { type: 'string' } },
                  correct_answer_index: { type: 'number' },
                  explanation: { type: 'string' },
                },
              },
            },
          },
        },
      });

      setQuizQuestions(result.questions || []);
      toast.success(`${result.questions?.length || questionCount} quiz questions generated`);
    } catch (err) {
      setError(`Failed to generate quiz: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5" />
          Generate Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!quizQuestions ? (
          <>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-2">Questions</label>
                <Select value={questionCount} onValueChange={setQuestionCount} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={generateQuiz}
              disabled={loading}
              className="w-full gap-2"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Generated {quizQuestions.length} questions • Ready to use
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
              {quizQuestions.map((q, idx) => (
                <div key={idx} className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">{idx + 1}. {q.question}</p>
                  <ul className="ml-4 space-y-0.5">
                    {q.options.map((opt, optIdx) => (
                      <li
                        key={optIdx}
                        className={`text-gray-700 ${
                          optIdx === q.correct_answer_index ? 'font-semibold text-green-700' : ''
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setQuizQuestions(null)}
              variant="outline"
              className="w-full text-sm"
            >
              Generate New Quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}