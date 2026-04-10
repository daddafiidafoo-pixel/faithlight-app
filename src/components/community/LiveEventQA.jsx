import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, ThumbsUp, MessageCircle, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function LiveEventQA({ eventId, userId, isHost }) {
  const queryClient = useQueryClient();
  const [questionText, setQuestionText] = useState('');

  const { data: questions = [] } = useQuery({
    queryKey: ['event-questions', eventId],
    queryFn: async () => {
      return base44.entities.LiveEventQuestion.filter(
        { event_id: eventId },
        '-created_date',
        100
      );
    },
    refetchInterval: 5000,
  });

  const askQuestionMutation = useMutation({
    mutationFn: async (text) => {
      return base44.entities.LiveEventQuestion.create({
        event_id: eventId,
        user_id: userId,
        question_text: text,
        status: 'pending',
      });
    },
    onSuccess: () => {
      toast.success('Question submitted!');
      setQuestionText('');
      queryClient.invalidateQueries(['event-questions']);
    },
  });

  const upvoteQuestionMutation = useMutation({
    mutationFn: async (questionId) => {
      const question = questions.find(q => q.id === questionId);
      return base44.entities.LiveEventQuestion.update(questionId, {
        upvotes: (question?.upvotes || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-questions']);
    },
  });

  const answerQuestionMutation = useMutation({
    mutationFn: async ({ questionId, answer }) => {
      return base44.entities.LiveEventQuestion.update(questionId, {
        status: 'answered',
        answer_text: answer,
        answered_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Answer posted!');
      queryClient.invalidateQueries(['event-questions']);
    },
  });

  const dismissQuestionMutation = useMutation({
    mutationFn: async (questionId) => {
      return base44.entities.LiveEventQuestion.update(questionId, {
        status: 'dismissed',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-questions']);
    },
  });

  const pendingQuestions = questions.filter(q => q.status === 'pending').sort((a, b) => b.upvotes - a.upvotes);
  const answeredQuestions = questions.filter(q => q.status === 'answered');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Q&A Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ask Question */}
        {!isHost && (
          <div className="space-y-2">
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Ask your question..."
              className="min-h-[80px]"
            />
            <Button
              onClick={() => askQuestionMutation.mutate(questionText)}
              disabled={!questionText.trim() || askQuestionMutation.isPending}
              className="w-full gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Question
            </Button>
          </div>
        )}

        {/* Pending Questions */}
        {pendingQuestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">
              Pending Questions ({pendingQuestions.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pendingQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  isHost={isHost}
                  onUpvote={() => upvoteQuestionMutation.mutate(q.id)}
                  onAnswer={(answer) => answerQuestionMutation.mutate({ questionId: q.id, answer })}
                  onDismiss={() => dismissQuestionMutation.mutate(q.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Answered Questions */}
        {answeredQuestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">
              Answered ({answeredQuestions.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {answeredQuestions.map((q) => (
                <QuestionCard key={q.id} question={q} isAnswered />
              ))}
            </div>
          </div>
        )}

        {questions.length === 0 && (
          <p className="text-center text-gray-500 py-8">No questions yet</p>
        )}
      </CardContent>
    </Card>
  );
}

function QuestionCard({ question, isHost, isAnswered, onUpvote, onAnswer, onDismiss }) {
  const [answerText, setAnswerText] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);

  return (
    <div className="p-3 bg-gray-50 rounded-lg space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-800 flex-1">{question.question_text}</p>
        {!isAnswered && !isHost && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onUpvote}
            className="gap-1 shrink-0"
          >
            <ThumbsUp className="w-3 h-3" />
            <span className="text-xs">{question.upvotes || 0}</span>
          </Button>
        )}
      </div>

      {isAnswered && question.answer_text && (
        <div className="pl-3 border-l-2 border-green-500 bg-green-50 p-2 rounded">
          <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
            <CheckCircle2 className="w-3 h-3" />
            Answer
          </div>
          <p className="text-sm text-gray-800">{question.answer_text}</p>
        </div>
      )}

      {isHost && !isAnswered && (
        <div className="space-y-2">
          {!showAnswerInput ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setShowAnswerInput(true)}
                className="gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                Answer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="gap-1"
              >
                <X className="w-3 h-3" />
                Dismiss
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer..."
                className="min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onAnswer(answerText);
                    setAnswerText('');
                    setShowAnswerInput(false);
                  }}
                  disabled={!answerText.trim()}
                >
                  Post Answer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAnswerInput(false);
                    setAnswerText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{format(new Date(question.created_date), 'h:mm a')}</span>
        {question.upvotes > 0 && !isAnswered && (
          <Badge variant="secondary" className="text-xs">
            {question.upvotes} upvote{question.upvotes !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </div>
  );
}