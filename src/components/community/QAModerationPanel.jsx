import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export default function QAModerationPanel({ groupId }) {
  const queryClient = useQueryClient();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: pendingAnswers = [] } = useQuery({
    queryKey: ['pending-answers', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      // Get all answers with pending_review status
      const answers = await base44.entities.GroupQAReply.filter(
        { status: 'pending_review' },
        '-created_date',
        50
      );
      // Filter to answers in this group (need to check question group_id)
      if (answers.length === 0) return [];

      const questionIds = [...new Set(answers.map(a => a.question_id))];
      const questions = await Promise.all(
        questionIds.map(qId => base44.entities.GroupQA.filter({ id: qId }, '-created_date', 1))
      );
      const groupQuestions = questions.flat().filter(q => q.group_id === groupId);
      const groupQuestionIds = groupQuestions.map(q => q.id);

      return answers.filter(a => groupQuestionIds.includes(a.question_id));
    },
    enabled: !!groupId,
    refetchInterval: 5000,
  });

  const approveAnswerMutation = useMutation({
    mutationFn: async (answerId) => {
      return base44.entities.GroupQAReply.update(answerId, {
        status: 'approved',
      });
    },
    onSuccess: () => {
      toast.success('Answer approved');
      queryClient.invalidateQueries(['pending-answers']);
    },
  });

  const rejectAnswerMutation = useMutation({
    mutationFn: async (answerId) => {
      if (!rejectionReason.trim()) {
        toast.error('Please provide a rejection reason');
        throw new Error('Reason required');
      }
      // Note: We'd need to add a rejection_reason field to GroupQAReply to store this
      return base44.entities.GroupQAReply.update(answerId, {
        status: 'rejected',
      });
    },
    onSuccess: () => {
      toast.success('Answer rejected');
      queryClient.invalidateQueries(['pending-answers']);
      setSelectedAnswer(null);
      setRejectionReason('');
    },
  });

  if (pendingAnswers.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-amber-200 bg-amber-50 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Q&A Moderation
            <Badge className="ml-2 bg-red-600">{pendingAnswers.length}</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {pendingAnswers.map((answer) => (
            <div
              key={answer.id}
              className="p-3 bg-white rounded-lg border border-amber-200 space-y-2"
            >
              <p className="text-sm text-gray-900 line-clamp-2">{answer.content}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => approveAnswerMutation.mutate(answer.id)}
                  disabled={approveAnswerMutation.isPending}
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Approve
                </Button>
                <Button
                  onClick={() => setSelectedAnswer(answer.id)}
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedAnswer} onOpenChange={(open) => !open && setSelectedAnswer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Answer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide a reason for rejection (optional)"
              className="h-24"
            />

            <div className="flex gap-3">
              <Button
                onClick={() => setSelectedAnswer(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => rejectAnswerMutation.mutate(selectedAnswer)}
                disabled={rejectAnswerMutation.isPending}
                variant="destructive"
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}