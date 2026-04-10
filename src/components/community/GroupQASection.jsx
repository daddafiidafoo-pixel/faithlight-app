import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, ThumbsUp, MessageSquare, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import CreateGroupQAModal from './CreateGroupQAModal';

export default function GroupQASection({ groupId }) {
  const queryClient = useQueryClient();
  const [showCreateQA, setShowCreateQA] = useState(false);
  const [expandedQA, setExpandedQA] = useState(null);

  const { data: questions = [] } = useQuery({
    queryKey: ['group-qa', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      return base44.entities.GroupQA.filter(
        { group_id: groupId, status: 'open' },
        '-upvotes',
        50
      );
    },
    enabled: !!groupId,
  });

  const { data: answers = [] } = useQuery({
    queryKey: ['qa-answers', expandedQA],
    queryFn: async () => {
      if (!expandedQA) return [];
      return base44.entities.GroupQAReply.filter(
        { question_id: expandedQA, status: 'approved' },
        '-is_accepted',
        '-upvotes',
        20
      );
    },
    enabled: !!expandedQA,
  });

  const upvoteQuestionMutation = useMutation({
    mutationFn: async (questionId) => {
      const qa = questions.find(q => q.id === questionId);
      if (!qa) throw new Error('Question not found');
      return base44.entities.GroupQA.update(questionId, {
        upvotes: (qa.upvotes || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-qa']);
    },
  });

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Q&A Discussion</h3>
          <Button
            onClick={() => setShowCreateQA(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Ask Question
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No questions yet. Ask something!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Q&A Discussion</h3>
        <Button
          onClick={() => setShowCreateQA(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Ask Question
        </Button>
      </div>

      {questions.map((question) => (
        <Card key={question.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-semibold text-gray-900 flex-1">{question.title}</h4>
                {question.is_answered && (
                  <Badge className="bg-green-100 text-green-800 flex-shrink-0">
                    Answered
                  </Badge>
                )}
              </div>

              <p className="text-gray-700 text-sm line-clamp-2">{question.content}</p>

              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
                <span>{formatDistanceToNow(new Date(question.created_date), { addSuffix: true })}</span>
                <button
                  onClick={() => upvoteQuestionMutation.mutate(question.id)}
                  className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{question.upvotes || 0}</span>
                </button>
                <button
                  onClick={() => setExpandedQA(expandedQA === question.id ? null : question.id)}
                  className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{answers.length}</span>
                </button>
              </div>

              {expandedQA === question.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {answers.length} Answer{answers.length !== 1 ? 's' : ''}
                  </p>
                  {answers.map((answer) => (
                    <div key={answer.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{answer.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                        {answer.is_accepted && (
                          <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                        )}
                        <button className="flex items-center gap-1 hover:text-indigo-600">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{answer.upvotes || 0}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <CreateGroupQAModal
        open={showCreateQA}
        onOpenChange={setShowCreateQA}
        groupId={groupId}
        onQuestionCreated={() => queryClient.invalidateQueries(['group-qa'])}
      />
    </div>
  );
}