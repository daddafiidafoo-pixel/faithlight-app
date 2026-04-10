import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Trash2, ThumbsUp, CornerDownRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ── Single Comment Row (handles replies, likes, delete, moderation) ────────────
function CommentRow({ comment, allComments, currentUser, isAdmin, sermonId, onRefresh, depth = 0 }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const replies = allComments.filter(c => c.parent_comment_id === comment.id && !c.is_deleted);
  const likeCount = comment.like_count || 0;
  const hasLiked = (comment.liked_by || []).includes(currentUser?.id);
  const canDelete = currentUser && (currentUser.id === comment.user_id || isAdmin);

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      await base44.entities.SermonComment.create({
        sermon_id: sermonId,
        user_id: currentUser.id,
        user_name: currentUser.full_name || 'Anonymous',
        content: replyText.trim(),
        parent_comment_id: comment.id,
        is_deleted: false,
        like_count: 0,
        liked_by: []
      });
      setReplyText('');
      setReplying(false);
      onRefresh();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async () => {
    if (!currentUser) return;
    const liked_by = comment.liked_by || [];
    const alreadyLiked = liked_by.includes(currentUser.id);
    await base44.entities.SermonComment.update(comment.id, {
      liked_by: alreadyLiked ? liked_by.filter(id => id !== currentUser.id) : [...liked_by, currentUser.id],
      like_count: alreadyLiked ? likeCount - 1 : likeCount + 1
    });
    onRefresh();
  };

  const deleteComment = async () => {
    await base44.entities.SermonComment.update(comment.id, { is_deleted: true });
    onRefresh();
  };

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-3' : ''}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
          {(comment.user_name || 'A')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm">
            <div className="flex items-center justify-between mb-1 gap-2">
              <span className="font-semibold text-gray-900 truncate">{comment.user_name || 'Anonymous'}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                </span>
                {canDelete && (
                  <button onClick={deleteComment} className="text-gray-300 hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{comment.content}</p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 px-1">
            <button onClick={toggleLike}
              className={`flex items-center gap-1 text-xs transition-colors ${hasLiked ? 'text-indigo-600 font-semibold' : 'text-gray-400 hover:text-indigo-500'}`}>
              <ThumbsUp className="w-3 h-3" fill={hasLiked ? 'currentColor' : 'none'} />
              {likeCount > 0 && <span>{likeCount}</span>}
              <span>Like</span>
            </button>
            {currentUser && depth === 0 && (
              <button onClick={() => setReplying(!replying)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 transition-colors">
                <CornerDownRight className="w-3 h-3" /> Reply
              </button>
            )}
          </div>
          {/* Reply input */}
          {replying && (
            <form onSubmit={submitReply} className="mt-2 flex gap-2">
              <Textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..." rows={1} className="flex-1 resize-none text-sm" />
              <Button type="submit" size="sm" disabled={submitting || !replyText.trim()} className="self-end">
                <Send className="w-3 h-3" />
              </Button>
            </form>
          )}
        </div>
      </div>
      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map(r => (
            <CommentRow key={r.id} comment={r} allComments={allComments} currentUser={currentUser}
              isAdmin={isAdmin} sermonId={sermonId} onRefresh={onRefresh} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────
export default function SermonCommentsSection({ sermonId, currentUser, isAdmin = false }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['sermon-comments', sermonId],
    queryFn: () => base44.entities.SermonComment.filter({ sermon_id: sermonId }, 'created_date', 200),
    enabled: !!sermonId
  });

  const refresh = () => queryClient.invalidateQueries(['sermon-comments', sermonId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      await base44.entities.SermonComment.create({
        sermon_id: sermonId,
        user_id: currentUser.id,
        user_name: currentUser.full_name || 'Anonymous',
        content: text.trim(),
        parent_comment_id: null,
        is_deleted: false,
        like_count: 0,
        liked_by: []
      });
      setText('');
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  // Only top-level comments (no parent)
  const topLevel = comments.filter(c => !c.is_deleted && !c.parent_comment_id);
  const total = comments.filter(c => !c.is_deleted).length;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-indigo-600" />
        Comments ({total})
      </h3>

      {currentUser ? (
        <form onSubmit={submit} className="mb-6 flex gap-3">
          <Textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Share your thoughts or reflections..." rows={2} className="flex-1 resize-none" />
          <Button type="submit" disabled={submitting || !text.trim()} size="sm" className="self-end gap-1">
            <Send className="w-4 h-4" /> Post
          </Button>
        </form>
      ) : (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm text-gray-500 border">
          <button className="text-indigo-600 font-medium" onClick={() => base44.auth.redirectToLogin()}>Log in</button> to leave a comment.
        </div>
      )}

      <div className="space-y-4">
        {topLevel.map(comment => (
          <CommentRow key={comment.id} comment={comment} allComments={comments}
            currentUser={currentUser} isAdmin={isAdmin} sermonId={sermonId} onRefresh={refresh} />
        ))}
        {total === 0 && (
          <p className="text-center text-sm text-gray-400 py-6">No comments yet. Be the first to share a reflection!</p>
        )}
      </div>
    </div>
  );
}