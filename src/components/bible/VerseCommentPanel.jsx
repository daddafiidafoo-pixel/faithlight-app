import React, { useState } from 'react';
import { MessageCircle, Send, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import moment from 'moment';

export default function VerseCommentPanel({ book, chapter, verse, reference, user }) {
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['verseComments', book, chapter, verse],
    queryFn: async () => {
      const all = await base44.entities.VerseComment.filter({
        book,
        chapter,
        ...(verse && { verse })
      }, '-created_date', 100);
      return all || [];
    },
    enabled: !!book && !!chapter
  });

  const addCommentMutation = useMutation({
    mutationFn: async (text) => {
      await base44.entities.VerseComment.create({
        user_id: user.id,
        user_name: user.full_name,
        book,
        chapter,
        verse: verse || null,
        reference,
        comment_text: text,
        parent_comment_id: replyTo?.id || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['verseComments', book, chapter, verse]);
      setCommentText('');
      setReplyTo(null);
      toast.success('Comment posted');
    }
  });

  const handleSubmit = () => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText.trim());
  };

  const topLevelComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (commentId) => comments.filter(c => c.parent_comment_id === commentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MessageCircle className="w-4 h-4" />
        <span>Comments ({comments.length})</span>
      </div>

      <div className="space-y-3">
        {topLevelComments.map(comment => (
          <div key={comment.id} className="bg-white p-3 rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.user_name}</span>
                  <span className="text-xs text-gray-500">{moment(comment.created_date).fromNow()}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.comment_text}</p>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setReplyTo(comment)}>
                Reply
              </Button>
            </div>

            {getReplies(comment.id).length > 0 && (
              <div className="mt-3 ml-6 space-y-2">
                {getReplies(comment.id).map(reply => (
                  <div key={reply.id} className="bg-gray-50 p-2 rounded border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-xs">{reply.user_name}</span>
                      <span className="text-xs text-gray-500">{moment(reply.created_date).fromNow()}</span>
                    </div>
                    <p className="text-xs text-gray-700">{reply.comment_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Replying to {replyTo.user_name}</span>
            <button onClick={() => setReplyTo(null)} className="text-indigo-600 hover:underline">
              Cancel
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <Textarea
            placeholder={user ? "Share your thoughts..." : "Sign in to comment"}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            disabled={!user}
          />
          <Button onClick={handleSubmit} disabled={!commentText.trim() || addCommentMutation.isPending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}