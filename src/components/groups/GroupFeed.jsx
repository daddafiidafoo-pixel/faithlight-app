import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageSquare, Send, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

function PostItem({ post, user, onDelete }) {
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: replies = [] } = useQuery({
    queryKey: ['group-post-replies', post.id],
    queryFn: () => base44.entities.GroupPost.filter({ parent_post_id: post.id }, 'created_date', 20).catch(() => []),
  });

  const likeMutation = useMutation({
    mutationFn: () => base44.entities.GroupPost.update(post.id, { like_count: (post.like_count || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries(['group-feed', post.group_id]),
  });

  const submitReply = async () => {
    if (!reply.trim()) return;
    setSubmitting(true);
    await base44.entities.GroupPost.create({
      group_id: post.group_id,
      user_id: user.id,
      user_name: user.full_name,
      content: reply.trim(),
      parent_post_id: post.id,
    });
    setReply('');
    setShowReply(false);
    queryClient.invalidateQueries(['group-post-replies', post.id]);
    setSubmitting(false);
  };

  const isOwn = post.user_id === user?.id;

  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
          {(post.user_name || 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">{post.user_name || 'Member'}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">
                {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ''}
              </span>
              {isOwn && (
                <button onClick={() => onDelete(post.id)} className="text-gray-300 hover:text-red-400 transition-colors p-0.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{post.content}</p>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => likeMutation.mutate()}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              {post.like_count || 0}
            </button>
            <button
              onClick={() => setShowReply(v => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Reply {replies.length > 0 && `(${replies.length})`}
            </button>
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-gray-100">
              {replies.map(r => (
                <div key={r.id} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
                    {(r.user_name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{r.user_name}</p>
                    <p className="text-xs text-gray-600">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showReply && (
            <div className="mt-2 flex gap-2">
              <Textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="text-sm resize-none flex-1"
              />
              <Button onClick={submitReply} disabled={submitting || !reply.trim()} size="sm" className="self-end">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GroupFeed({ groupId, user }) {
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['group-feed', groupId],
    queryFn: () => base44.entities.GroupPost.filter({ group_id: groupId, parent_post_id: null }, '-created_date', 30).catch(() => []),
    enabled: !!groupId,
  });

  const submitPost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    await base44.entities.GroupPost.create({
      group_id: groupId,
      user_id: user.id,
      user_name: user.full_name,
      content: newPost.trim(),
      like_count: 0,
    });
    setNewPost('');
    queryClient.invalidateQueries(['group-feed', groupId]);
    setPosting(false);
    toast.success('Post shared!');
  };

  const deletePost = async (id) => {
    await base44.entities.GroupPost.delete(id);
    queryClient.invalidateQueries(['group-feed', groupId]);
  };

  return (
    <div className="space-y-4">
      {/* Compose */}
      <Card className="border-indigo-100">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(user?.full_name || 'U')[0].toUpperCase()}
            </div>
            <Textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Share a thought, verse, or update with the group..."
              rows={3}
              className="resize-none text-sm flex-1"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={submitPost} disabled={posting || !newPost.trim()} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <PostItem key={post.id} post={post} user={user} onDelete={deletePost} />
          ))}
        </div>
      )}
    </div>
  );
}