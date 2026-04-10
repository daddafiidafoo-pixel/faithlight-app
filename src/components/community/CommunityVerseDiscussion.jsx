import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageCircle, ThumbsUp, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunityVerseDiscussion({ verseRef, verseText, isDarkMode, user }) {
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const queryClient = useQueryClient();

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  // Fetch comments for this verse
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['verseComments', verseRef],
    queryFn: async () => {
      try {
        return await base44.entities.SermonComment.filter({
          verse_reference: verseRef
        }, '-created_date', 10);
      } catch {
        return [];
      }
    }
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (commentText) => {
      return base44.entities.SermonComment.create({
        verse_reference: verseRef,
        verse_text: verseText,
        content: commentText,
        user_id: user?.id,
        author_name: user?.full_name || 'Anonymous'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verseComments', verseRef] });
      setComment('');
      setIsCommenting(false);
      toast.success('Comment posted!');
    },
    onError: () => {
      toast.error('Failed to post comment');
    }
  });

  const handlePostComment = async () => {
    if (!comment.trim() || !user) {
      toast.error('Please log in to comment');
      return;
    }
    createCommentMutation.mutate(comment);
  };

  return (
    <Card style={{ backgroundColor: cardColor, borderColor }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
          <MessageCircle className="w-5 h-5" style={{ color: primaryColor }} />
          Community Discussion
        </CardTitle>
        <p className="text-xs mt-2" style={{ color: mutedColor }}>
          {comments.length} people discussing this verse
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p style={{ color: mutedColor, fontSize: '14px' }}>
              Be the first to discuss this verse!
            </p>
          ) : (
            comments.map(comment => (
              <div
                key={comment.id}
                className="p-3 rounded-lg border"
                style={{ backgroundColor: bgColor, borderColor }}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                    {comment.author_name}
                  </p>
                  <span className="text-xs" style={{ color: mutedColor }}>
                    {comment.created_date ? new Date(comment.created_date).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <p className="text-sm" style={{ color: textColor }}>
                  {comment.comment_text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Section */}
        {user ? (
          <div className="space-y-2 border-t pt-4" style={{ borderColor }}>
            <Textarea
              placeholder="Share your thoughts about this verse..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-sm"
              style={{
                backgroundColor: bgColor,
                borderColor,
                color: textColor
              }}
            />
            <Button
              onClick={handlePostComment}
              disabled={!comment.trim()}
              className="w-full gap-2"
              style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
            >
              <Send className="w-4 h-4" />
              Post Comment
            </Button>
          </div>
        ) : (
          <div className="border-t pt-4 text-center" style={{ borderColor }}>
            <p style={{ color: mutedColor, fontSize: '14px' }}>
              Log in to join the discussion
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}