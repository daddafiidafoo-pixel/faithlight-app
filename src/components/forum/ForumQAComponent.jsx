import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, HelpCircle, Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ForumQAComponent({ qaId, topicId, userId, userName }) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const queryClient = useQueryClient();

  // Fetch QA data
  const { data: qa } = useQuery({
    queryKey: ['forum-qa', qaId],
    queryFn: async () => {
      const result = await base44.entities.ForumQA.filter({ id: qaId }, '-created_date', 1);
      return result[0];
    },
    enabled: !!qaId,
  });

  // Fetch answers
  const { data: answers = [] } = useQuery({
    queryKey: ['qa-answers', qaId],
    queryFn: async () => {
      // Would need ForumAnswer entity to implement this properly
      return [];
    },
    enabled: !!qaId,
  });

  // Increment view count
  React.useEffect(() => {
    if (qa && qa.id) {
      base44.entities.ForumQA.update(qa.id, {
        view_count: (qa.view_count || 0) + 1,
      }).catch(err => console.log('View update error:', err));
    }
  }, [qa?.id]);

  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!answerText.trim()) {
        toast.error('Answer cannot be empty');
        return;
      }

      // Would create ForumAnswer entity
      await base44.entities.ForumQA.update(qaId, {
        answer_count: (qa.answer_count || 0) + 1,
      });

      toast.success('Answer posted!');
      setAnswerText('');
      setShowAnswerForm(false);
      queryClient.invalidateQueries(['qa-answers', qaId]);
    },
  });

  if (!qa) {
    return <div className="p-4 text-gray-600">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <Badge className="bg-blue-600">Q&A</Badge>
            </div>
            {qa.is_answered && (
              <Badge className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Answered
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">{qa.question_text}</CardTitle>

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {qa.view_count} views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {qa.answer_count} answers
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {qa.helpful_count} helpful
            </span>
          </div>

          {qa.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {qa.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{qa.question_author_name}</p>
              <p className="text-sm text-gray-500 mb-3">asked this question</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {qa.answer_count > 0 ? `${qa.answer_count} Answer${qa.answer_count !== 1 ? 's' : ''}` : 'No answers yet'}
        </h3>

        {answers.length === 0 && qa.answer_count === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-6 pb-6 text-center text-gray-600">
              <HelpCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p>Be the first to answer this question!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Answer Form */}
      {!showAnswerForm ? (
        <Button
          onClick={() => setShowAnswerForm(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          Post Your Answer
        </Button>
      ) : (
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-6">
            <Textarea
              placeholder="Share your answer..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="min-h-[120px] mb-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => submitAnswerMutation.mutate()}
                disabled={submitAnswerMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Post Answer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAnswerForm(false);
                  setAnswerText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}