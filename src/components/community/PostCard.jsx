import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Flag, Send, ChevronDown, ChevronUp, Loader2, Trash2, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ReportContentModal from '../moderation/ReportContentModal';
import SignInPromptModal from './SignInPromptModal';
import { useModerationStatus } from '../moderation/useModerationStatus';
import { can, isMod } from '../permissions';

// Send a reply notification to the post author
async function sendReplyNotification({ post, commenter }) {
  if (!post.user_id || post.user_id === commenter.id) return;
  await base44.entities.AppNotification.create({
    user_id: post.user_id,
    notification_type: 'REPLY',
    title: `${commenter.full_name || 'Someone'} replied to your post`,
    message: `On "${post.title}"`,
    is_read: false,
  }).catch(() => {});
}

const CATEGORY_COLORS = {
  Teaching: 'bg-indigo-100 text-indigo-800',
  Devotional: 'bg-purple-100 text-purple-800',
  Testimony: 'bg-green-100 text-green-800',
  Question: 'bg-amber-100 text-amber-800',
  Announcement: 'bg-blue-100 text-blue-800',
};

function CommentItem({ comment, currentUser, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const isOwnComment = currentUser && currentUser.id === comment.user_id;

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    setDeleting(true);
    try {
      await onDelete(comment.id);
      toast.success('Comment deleted');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 overflow-hidden">
        {comment.user_photo ? (
          <img src={comment.user_photo} alt="" className="w-full h-full object-cover" />
        ) : (
          (comment.user_name?.[0] || '?').toUpperCase()
        )}
      </div>
      <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-gray-700">{comment.user_name}</p>
            <p className="text-xs text-gray-600 mt-0.5">{comment.comment_text}</p>
          </div>
          {isOwnComment && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-gray-300 hover:text-red-500 transition-colors p-0.5 disabled:opacity-50 flex-shrink-0"
              title="Delete comment"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostCard({ post, currentUser, userLikedIds = [], onLikeToggle, onPostDeleted, onModAction }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isLiked = userLikedIds.includes(post.id);
  const isOwnPost = currentUser && currentUser.id === post.user_id;
  const isModUser = isMod(currentUser);
  const { isSuspended } = useModerationStatus(currentUser?.id);

  const loadComments = async () => {
    if (commentsLoaded) return;
    const data = await base44.entities.PostComment.filter({ post_id: post.id, status: 'published' }, 'created_date', 30);
    setComments(data);
    setCommentsLoaded(true);
  };

  const toggleComments = async () => {
    if (!showComments) await loadComments();
    setShowComments(v => !v);
  };

  const submitComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    
    if (isSuspended) {
      toast.error('Your account is temporarily suspended from community features');
      return;
    }

    setSubmittingComment(true);
    try {
      const c = await base44.entities.PostComment.create({
        post_id: post.id,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_photo: currentUser.profile_photo_url || '',
        comment_text: commentText.trim(),
      });
      setComments(prev => [...prev, c]);
      setCommentText('');
      await base44.entities.CommunityPost.update(post.id, { comment_count: (post.comment_count || 0) + 1 }).catch(() => {});
      // Notify post author of reply
      sendReplyNotification({ post, commenter: currentUser });
    } catch { toast.error('Failed to post comment'); }
    setSubmittingComment(false);
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    
    setDeleting(true);
    try {
      await base44.entities.CommunityPost.update(post.id, {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by_user: true,
      });
      toast.success('Post deleted');
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      toast.error('Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const avatarLetter = (post.user_name?.[0] || '?').toUpperCase();

  return (
    <>
      <Card className="border border-gray-100 shadow-sm bg-white">
        <CardContent className="pt-5 pb-4">
          {/* Author row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0 overflow-hidden">
              {post.user_photo
                ? <img src={post.user_photo} alt="" className="w-full h-full object-cover" />
                : avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-gray-800">{post.user_name || 'Anonymous'}</span>
                <Badge className={`text-xs ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700'}`}>{post.category}</Badge>
                <span className="text-xs text-gray-400">{new Date(post.created_date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Mod: approve pending */}
              {isModUser && post.status === 'pending' && (
                <button
                  onClick={async () => {
                    await base44.entities.CommunityPost.update(post.id, { status: 'published' });
                    toast.success('Post approved');
                    onModAction?.();
                  }}
                  className="text-gray-300 hover:text-green-600 transition-colors p-1"
                  title="Approve post"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Mod: remove any post */}
              {isModUser && !isOwnPost && (
                <button
                  onClick={async () => {
                    if (!window.confirm('Remove this post?')) return;
                    await base44.entities.CommunityPost.update(post.id, { status: 'removed', is_removed: true, removed_at: new Date().toISOString(), removed_by: currentUser.id });
                    toast.success('Post removed');
                    onModAction?.();
                  }}
                  className="text-gray-300 hover:text-orange-500 transition-colors p-1"
                  title="Remove post (mod)"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                </button>
              )}
              {isOwnPost && (
                <button
                  onClick={handleDeletePost}
                  disabled={deleting}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                  title="Delete post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {currentUser && !isOwnPost && (
                <button
                  onClick={() => setShowReport(true)}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1"
                  title="Report"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{post.body}</p>
          {post.image_url && (
            <img src={post.image_url} alt="Post" className="mt-3 rounded-xl max-h-72 w-full object-cover border border-gray-100" />
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
            <button
              onClick={() => currentUser ? onLikeToggle(post) : setShowSignIn(true)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.like_count || 0}</span>
            </button>
            <button
              onClick={() => currentUser ? toggleComments() : setShowSignIn(true)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comment_count || 0}</span>
              {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Comments */}
          {showComments && (
            <div className="mt-3 space-y-3">
              {comments.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  currentUser={currentUser}
                  onDelete={async (cId) => {
                    setComments(prev => prev.filter(x => x.id !== cId));
                    await base44.entities.PostComment.update(cId, {
                      is_deleted: true,
                      deleted_at: new Date().toISOString(),
                    }).catch(() => {});
                  }}
                />
              ))}
              {currentUser && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a comment…"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitComment()}
                    className="text-sm h-8"
                  />
                  <Button size="sm" onClick={submitComment} disabled={submittingComment || !commentText.trim()} className="h-8 px-2">
                    {submittingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ReportContentModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        targetType="post"
        targetId={post.id}
        targetOwnerUserId={post.user_id}
        onSubmitted={() => toast.success('Report submitted')}
      />

      {isSuspended && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            Your account is suspended from community features.
          </p>
        </div>
      )}

      {showSignIn && (
        <SignInPromptModal
          message="Sign in to like, comment, and post in the community."
          onClose={() => setShowSignIn(false)}
        />
      )}
    </>
  );
}