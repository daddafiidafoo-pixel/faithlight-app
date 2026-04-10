import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/components/I18nProvider';
import { Play, Plus, X } from 'lucide-react';
import QuizCreator from '@/components/quiz/QuizCreator';
import QuizResults from '@/components/quiz/QuizResults';
import QuizMemberView from '@/components/quiz/QuizMemberView';

export default function ChurchQuiz({ sessionId, isPastor, user }) {
  const { t } = useI18n();
  const [showCreator, setShowCreator] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const queryClient = useQueryClient();

  // Subscribe to realtime events
  useEffect(() => {
    const unsubscribe = base44.realtime.subscribe(`session:${sessionId}`, (event) => {
      if (event.type === 'quiz:question_live' || event.type === 'quiz:question_ended') {
        queryClient.invalidateQueries({ queryKey: ['quizQuestions', sessionId] });
      }
    });
    return unsubscribe;
  }, [sessionId, queryClient]);

  // Get live questions for this session
  const { data: questions = [] } = useQuery({
    queryKey: ['quizQuestions', sessionId],
    queryFn: () => base44.entities.ChurchQuizQuestion.filter(
      { sessionId, status: 'live' },
      '-created_date'
    ),
    refetchInterval: 5000 // Fallback to polling if realtime unavailable
  });

  const currentQuestion = questions[0] || null;

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions.invoke('quizLaunchQuestion', {
        sessionId,
        questionText: data.question,
        choices: data.choices,
        correctIndex: data.correctIndex
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizQuestions', sessionId] });
      setShowCreator(false);
    }
  });

  const endMutation = useMutation({
    mutationFn: (questionId) =>
      base44.functions.invoke('quizEndQuestion', {
        questionId,
        sessionId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizQuestions', sessionId] });
      setSelectedQuestion(null);
    }
  });

  if (!isPastor) {
    // Member view
    return currentQuestion ? (
      <QuizMemberView question={currentQuestion} sessionId={sessionId} user={user} />
    ) : (
      <div className="text-center py-8 text-slate-500">
        Waiting for a question...
      </div>
    );
  }

  // Pastor view
  return (
    <div className="space-y-6">
      {/* Creator */}
      {showCreator && (
        <QuizCreator
          sessionId={sessionId}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowCreator(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {!showCreator && !currentQuestion && (
        <Button
          onClick={() => setShowCreator(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          <Plus className="w-4 h-4" /> Create Question
        </Button>
      )}

      {/* Current Question */}
      {currentQuestion && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-xl font-bold text-slate-900">{currentQuestion.question}</h3>
          <div className="space-y-2">
            {currentQuestion.choices.map((choice, idx) => (
              <div key={idx} className="bg-slate-100 p-3 rounded">
                <span className="font-semibold text-slate-900">{String.fromCharCode(65 + idx)}.</span> {choice}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setSelectedQuestion(currentQuestion)}
              className="flex-1 gap-2"
            >
              View Results
            </Button>
            <Button
              onClick={() => endMutation.mutate(currentQuestion.id)}
              variant="destructive"
            >
              End Question
            </Button>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {selectedQuestion && (
        <QuizResults
          question={selectedQuestion}
          sessionId={sessionId}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </div>
  );
}