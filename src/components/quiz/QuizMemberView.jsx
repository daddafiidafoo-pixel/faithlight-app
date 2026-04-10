import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function QuizMemberView({ question, sessionId, user }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const queryClient = useQueryClient();

  // Check if user already answered
  const { data: userResponse } = useQuery({
    queryKey: ['userQuizResponse', question.id, user?.email],
    queryFn: () => base44.entities.ChurchQuizResponse.filter({
      questionId: question.id,
      userId: user?.email
    }).then(r => r[0] || null)
  });

  const answerMutation = useMutation({
    mutationFn: (choiceIndex) =>
      base44.functions.invoke('quizRespondQuestion', {
        questionId: question.id,
        sessionId,
        choiceIndex
      }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userQuizResponse'] });
      setHasAnswered(true);
    },
    onError: () => {
      alert('Failed to submit answer');
    }
  });

  useEffect(() => {
    if (userResponse) {
      setHasAnswered(true);
      setSelectedAnswer(userResponse.choiceIndex);
    }
  }, [userResponse]);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-bold text-slate-900">{question.question}</h3>

      <div className="space-y-2">
        {question.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (!hasAnswered) {
                setSelectedAnswer(idx);
                answerMutation.mutate(idx);
              }
            }}
            disabled={hasAnswered}
            className={`w-full p-3 rounded-lg text-left font-semibold transition-colors ${
              selectedAnswer === idx
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            } ${hasAnswered ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <span className="mr-2">{String.fromCharCode(65 + idx)}.</span>{choice}
          </button>
        ))}
      </div>

      {hasAnswered && (
        <div className="text-center text-sm text-slate-600">
          ✓ Answer submitted
        </div>
      )}
    </div>
  );
}