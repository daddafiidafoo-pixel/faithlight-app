import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Heart, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudyGroupThread() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const threadId = searchParams.get('threadId');
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  
  const [newMessage, setNewMessage] = useState('');

  // Fetch thread details
  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['discussionThread', threadId],
    queryFn: async () => {
      if (!threadId) return null;
      const results = await base44.entities.StudyGroupDiscussion.filter({ id: threadId });
      return results.length > 0 ? results[0] : null;
    },
    enabled: !!threadId
  });

  // Fetch posts
  const { data: posts = [] } = useQuery({
    queryKey: ['threadPosts', threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const results = await base44.entities.StudyGroupPost.filter({
        discussionId: threadId
      });
      return results.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!threadId
  });

  // Post message mutation
  const postMessageMutation = useMutation({
    mutationFn: async (content) => {
      return await base44.entities.StudyGroupPost.create({
        discussionId: threadId,
        groupId: thread?.groupId,
        authorEmail: user.email,
        authorName: user.full_name || 'Member',
        content: content,
        likes: 0,
        likedByEmails: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threadPosts', threadId] });
      queryClient.invalidateQueries({ queryKey: ['discussionThread', threadId] });
      setNewMessage('');
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    postMessageMutation.mutate(newMessage);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-slate-600">Please sign in to view discussions</p>
      </div>
    );
  }

  if (threadLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-slate-600">Discussion not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-purple-600 hover:text-purple-700 font-semibold mb-2"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900">{thread.topic}</h1>
        <p className="text-sm text-slate-600 mt-1">
          Started by {thread.createdByName} • {thread.postCount || 0} responses
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Messages */}
        <div className="space-y-4 mb-8">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg text-slate-600">
              No messages yet. Be the first to share!
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} threadId={threadId} />
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sticky bottom-0">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your reflection or prayer request..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows="3"
            />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || postMessageMutation.isPending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {postMessageMutation.isPending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, threadId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const newLiked = !liked;
      const newLikes = newLiked ? likeCount + 1 : likeCount - 1;
      
      await base44.entities.StudyGroupPost.update(post.id, {
        likes: newLikes,
        likedByEmails: newLiked 
          ? [...(post.likedByEmails || []), user.email]
          : (post.likedByEmails || []).filter(e => e !== user.email)
      });

      setLiked(newLiked);
      setLikeCount(newLikes);
    }
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-sm font-semibold">
          {post.authorName?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{post.authorName}</p>
          <p className="text-xs text-slate-500">
            {new Date(post.created_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-700 mb-4 leading-relaxed">{post.content}</p>

      {/* Actions */}
      <div className="flex gap-4 pt-3 border-t border-slate-200 text-slate-600">
        <button
          onClick={() => likeMutation.mutate()}
          className="flex items-center gap-2 text-sm hover:text-red-600 transition-colors"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-600 text-red-600' : ''}`} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        <button className="flex items-center gap-2 text-sm hover:text-purple-600 transition-colors">
          <Reply className="w-4 h-4" />
          Reply
        </button>
      </div>
    </div>
  );
}