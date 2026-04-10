import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ThumbsUp, CheckCircle2 } from 'lucide-react';

export default function LessonQASection({ lessonId, courseId }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const user = null; // Will be set from useEffect

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['lesson-questions', lessonId],
    queryFn: async () => {
      const qs = await base44.entities.LessonQuestion.filter(
        { lesson_id: lessonId },
        '-created_date'
      );
      return qs || [];
    },
    enabled: !!lessonId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const currentUser = await base44.auth.me();
      return await base44.entities.LessonQuestion.create({
        lesson_id: lessonId,
        course_id: courseId,
        author_id: currentUser.id,
        author_name: currentUser.full_name,
        title,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-questions', lessonId] });
      setTitle('');
      setContent('');
      setShowForm(false);
    },
  });

  if (isLoading) {
    return <div className="text-gray-600 py-4">Loading Q&A...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Q&A ({questions.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ask Question Form */}
        {!showForm ? (
          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
            className="w-full gap-2 justify-start text-gray-600"
          >
            <MessageCircle className="w-4 h-4" />
            Ask a question...
          </Button>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
            <Input
              placeholder="Question title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
            />
            <Textarea
              placeholder="Describe your question in detail..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-24 text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setTitle('');
                  setContent('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!title.trim() || !content.trim() || submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                {submitMutation.isPending ? 'Posting...' : 'Post Question'}
              </Button>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-3 mt-6">
          {questions.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">
              No questions yet. Be the first to ask!
            </p>
          ) : (
            questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionCard({ question }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">{question.title}</h4>
          <p className="text-xs text-gray-600 mt-1">by {question.author_name}</p>
        </div>
        {question.is_resolved && (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Answered
          </Badge>
        )}
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{question.content}</p>

      <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
        <button className="flex items-center gap-1 hover:text-indigo-600">
          <ThumbsUp className="w-3 h-3" />
          Helpful ({question.helpful_count || 0})
        </button>
        <span>
          {question.answer_count || 0} {question.answer_count === 1 ? 'Answer' : 'Answers'}
        </span>
      </div>
    </div>
  );
}