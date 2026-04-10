import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Check, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function GroupDiscussionPanel({ discussion, groupId, user }) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['discussion-comments', discussion.id],
    queryFn: () => base44.entities.DiscussionComment.filter(
      { discussion_id: discussion.id },
      '-created_date'
    ),
    enabled: !!discussion?.id
  });

  const postCommentMutation = useMutation({
    mutationFn: async (content) => {
      return base44.entities.DiscussionComment.create({
        discussion_id: discussion.id,
        group_id: groupId,
        user_id: user.id,
        user_name: user.full_name,
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussion-comments']);
      setNewComment('');
    }
  });

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    await postCommentMutation.mutateAsync(newComment);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Discussion Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{discussion.topic}</h3>
        {discussion.scripture_reference && (
          <p className="text-sm text-indigo-700 mb-2">📖 {discussion.scripture_reference}</p>
        )}
        {discussion.description && (
          <p className="text-sm text-gray-700 mb-3">{discussion.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>By {discussion.creator_name}</span>
          {discussion.type === 'ai_generated' && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">✨ AI-Generated</span>
          )}
        </div>
      </Card>

      {/* Discussion Questions */}
      {discussion.discussion_questions?.length > 0 && (
        <Card className="bg-white border-indigo-100 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            Discussion Questions
          </h4>
          <ul className="space-y-2">
            {discussion.discussion_questions.map((q, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex gap-2">
                <span className="text-indigo-600 font-semibold">{idx + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Comments Section */}
      <Card className="bg-white border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Discussion ({comments.length})
        </h4>

        {/* Comment List */}
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No comments yet. Be the first to share!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm text-gray-900">{comment.user_name}</span>
                  {comment.is_marked_helpful && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> Helpful
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                <button className="text-xs text-gray-600 hover:text-indigo-600">
                  👍 {comment.helpful_count > 0 ? comment.helpful_count : 'Like'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="space-y-2 pt-3 border-t">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this discussion..."
            className="text-sm min-h-20"
            disabled={isSubmitting}
          />
          <Button
            onClick={handlePostComment}
            disabled={!newComment.trim() || isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Post Comment
          </Button>
        </div>
      </Card>
    </div>
  );
}