import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, ThumbsUp, Flag, Trash2, Pin, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';

export default function SermonDiscussionBoard({ sermonId, user }) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();
  const isAdmin = user?.user_role === 'admin';

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ['sermon-comments', sermonId],
    queryFn: () => base44.entities.SermonComment.filter({ sermon_id: sermonId }, '-created_date', 100),
  });

  // Fetch comment likes
  const { data: commentLikes = [] } = useQuery({
    queryKey: ['comment-likes', user?.id],
    queryFn: () => base44.entities.CommentLike.filter({ user_id: user?.id }),
    enabled: !!user,
  });

  // Fetch flagged comments (admin only)
  const { data: flaggedComments = [] } = useQuery({
    queryKey: ['flagged-comments', sermonId],
    queryFn: () => base44.entities.CommentFlag.filter({ sermon_id: sermonId }),
    enabled: isAdmin,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentData) => {
      const comment = await base44.entities.SermonComment.create(commentData);
      // Update comment count on sermon
      const sermon = await base44.entities.SharedSermon.filter({ id: sermonId }, null, 1);
      if (sermon[0]) {
        await base44.entities.SharedSermon.update(sermonId, {
          comments_count: (sermon[0].comments_count || 0) + 1
        });
      }
      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-comments'] });
      queryClient.invalidateQueries({ queryKey: ['shared-sermons'] });
      setNewComment('');
      setReplyText('');
      setReplyingTo(null);
      toast.success('Comment posted!');
    },
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const existingLike = commentLikes.find(l => l.comment_id === commentId);
      if (existingLike) {
        await base44.entities.CommentLike.delete(existingLike.id);
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
          await base44.entities.SermonComment.update(commentId, {
            likes_count: Math.max((comment.likes_count || 0) - 1, 0)
          });
        }
      } else {
        await base44.entities.CommentLike.create({
          comment_id: commentId,
          user_id: user.id
        });
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
          await base44.entities.SermonComment.update(commentId, {
            likes_count: (comment.likes_count || 0) + 1
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comment-likes'] });
    },
  });

  // Flag comment mutation
  const flagCommentMutation = useMutation({
    mutationFn: (commentId) => base44.entities.CommentFlag.create({
      comment_id: commentId,
      sermon_id: sermonId,
      user_id: user.id,
      reason: 'inappropriate'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-comments'] });
      toast.success('Comment flagged for review');
    },
  });

  // Delete comment mutation (admin only)
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      await base44.entities.SermonComment.delete(commentId);
      const sermon = await base44.entities.SharedSermon.filter({ id: sermonId }, null, 1);
      if (sermon[0]) {
        await base44.entities.SharedSermon.update(sermonId, {
          comments_count: Math.max((sermon[0].comments_count || 0) - 1, 0)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-comments'] });
      queryClient.invalidateQueries({ queryKey: ['shared-sermons'] });
      toast.success('Comment deleted');
    },
  });

  // Pin comment mutation (admin only)
  const pinCommentMutation = useMutation({
    mutationFn: ({ commentId, isPinned }) => 
      base44.entities.SermonComment.update(commentId, { is_pinned: !isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-comments'] });
      toast.success('Comment updated');
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate({
      sermon_id: sermonId,
      user_id: user.id,
      author_name: user.full_name || user.email,
      content: newComment,
      parent_id: null,
      is_pinned: false,
      is_question: false
    });
  };

  const handleAddReply = (parentId) => {
    if (!replyText.trim()) return;
    addCommentMutation.mutate({
      sermon_id: sermonId,
      user_id: user.id,
      author_name: user.full_name || user.email,
      content: replyText,
      parent_id: parentId,
      is_pinned: false,
      is_question: false
    });
  };

  const isLiked = (commentId) => commentLikes.some(l => l.comment_id === commentId);
  const isFlagged = (commentId) => flaggedComments.some(f => f.comment_id === commentId);

  // Organize comments into threads
  const topLevelComments = comments.filter(c => !c.parent_id).sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const getReplies = (parentId) => 
    comments.filter(c => c.parent_id === parentId).sort((a, b) => 
      new Date(a.created_date) - new Date(b.created_date)
    );

  const CommentCard = ({ comment, isReply = false }) => {
    const replies = getReplies(comment.id);
    const liked = isLiked(comment.id);
    const flagged = isFlagged(comment.id);

    return (
      <div className={`${isReply ? 'ml-8 mt-3' : ''}`}>
        <Card className={`${comment.is_pinned ? 'border-indigo-300 bg-indigo-50' : ''} ${flagged && isAdmin ? 'border-red-300 bg-red-50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
                  {comment.author_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{comment.author_name}</p>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                  </span>
                  {comment.is_pinned && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </Badge>
                  )}
                  {comment.is_question && (
                    <Badge variant="secondary" className="gap-1 text-xs bg-blue-100 text-blue-700">
                      <AlertCircle className="w-3 h-3" />
                      Question
                    </Badge>
                  )}
                  {flagged && isAdmin && (
                    <Badge variant="destructive" className="gap-1 text-xs">
                      <Flag className="w-3 h-3" />
                      Flagged
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                  {comment.content}
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 gap-1 text-xs ${liked ? 'text-indigo-600' : ''}`}
                    onClick={() => likeCommentMutation.mutate(comment.id)}
                  >
                    <ThumbsUp className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
                    {comment.likes_count || 0}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <MessageCircle className="w-3 h-3" />
                    Reply
                  </Button>
                  
                  {!isAdmin && comment.user_id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-gray-500"
                      onClick={() => flagCommentMutation.mutate(comment.id)}
                    >
                      <Flag className="w-3 h-3" />
                      Flag
                    </Button>
                  )}
                  
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => pinCommentMutation.mutate({ commentId: comment.id, isPinned: comment.is_pinned })}
                      >
                        <Pin className="w-3 h-3" />
                        {comment.is_pinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs text-red-600"
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {replyingTo === comment.id && (
              <div className="mt-4 ml-11">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="mb-2"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyText.trim()}
                  >
                    Post Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {replies.length > 0 && (
          <div className="space-y-3 mt-3">
            {replies.map(reply => (
              <CommentCard key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Please log in to join the discussion</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            Discussion ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Share your thoughts, ask a question, or start a discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="mb-2"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
            >
              Post Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No comments yet. Be the first to start a discussion!
            </CardContent>
          </Card>
        ) : (
          topLevelComments.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}