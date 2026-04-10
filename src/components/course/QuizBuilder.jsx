import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Save, X, Loader2 } from 'lucide-react';

export default function QuizBuilder({ lessonId, onQuizCreated, onClose }) {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);

  const [quizTitle, setQuizTitle] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: 0,
    points: 1,
  });

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const addQuestion = () => {
    if (!currentQuestion.question_text || (currentQuestion.question_type === 'multiple_choice' && currentQuestion.options.some(o => !o))) {
      return;
    }
    setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    setCurrentQuestion({
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: 0,
      points: 1,
    });
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateOption = (idx, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[idx] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const quizData = {
        lesson_id: lessonId,
        title: quizTitle,
        passing_score: Number(passingScore),
        questions: questions.map(({ id, ...q }) => q),
        teacher_id: user.id,
        status: 'draft',
      };

      return await base44.entities.TrainingQuiz.create(quizData);
    },
    onSuccess: (quiz) => {
      queryClient.invalidateQueries(['lesson-quizzes']);
      if (onQuizCreated) {
        onQuizCreated(quiz);
      }
      if (onClose) {
        onClose();
      }
    },
  });

  const isValid = quizTitle && questions.length > 0;

  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create Quiz for Lesson</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quizTitle">Quiz Title</Label>
            <Input
              id="quizTitle"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g., John Chapter 2 Quiz"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="passingScore">Passing Score (%)</Label>
            <Input
              id="passingScore"
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        {/* Current Question Builder */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">Add Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                value={currentQuestion.question_text}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                placeholder="Enter the question..."
                rows={2}
                className="mt-2"
              />
            </div>

            {currentQuestion.question_type === 'multiple_choice' && (
              <div className="space-y-2">
                <Label>Answer Options *</Label>
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1"
                    />
                    {idx === currentQuestion.correct_answer && (
                      <Badge className="bg-green-600">Correct</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestion({ ...currentQuestion, correct_answer: idx })}
                    >
                      Mark Correct
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: Number(e.target.value) })}
                className="mt-2"
              />
            </div>

            <Button
              onClick={addQuestion}
              className="w-full gap-2"
              disabled={!currentQuestion.question_text || currentQuestion.options.some(o => !o)}
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              Added Questions
              <Badge>{questions.length}</Badge>
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{idx + 1}. {q.question_text}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {q.options.length} options • {q.points} pts
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(q.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!user && (
          <Alert>
            <AlertDescription>Loading user information...</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-end pt-4">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!isValid || saveMutation.isLoading || !user}
            className="gap-2"
          >
            {saveMutation.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}