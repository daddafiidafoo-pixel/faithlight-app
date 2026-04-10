import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ThumbsUp, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function GroupForumTopic() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  
  // Get topic ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const topicId = urlParams.get('id');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  const { data: topic } = useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: () => base44.entities.ForumTopic.filter({ id: topicId }, null, 1),
    select: (data) => data[0],
    enabled: !!topicId,
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forum-replies', topicId],
    queryFn: async () => {
      if (!topicId) return [];
      return base44.entities.ForumReply.filter(
        { topic_id: topicId, status: 'active' },
        'created_date'
      );
    },
    enabled: !!topicId,
  });

  const { data: userUpvotes = [] } = useQuery({
    queryKey: ['user-forum-upvotes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return base44.entities.ForumUpvote.filter({ user_id: user.id });
    },
    enabled: !!user?.id,
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ForumReply.create({
        topic_id: topicId,
        content: replyContent,
        author_id: user.id,
        author_name: user.full_name,
        status: 'active',
      });
      
      // Update replies count
      const currentCount = topic?.replies_count || 0;
      await base44.entities.ForumTopic.update(topicId, {
        replies_count: currentCount + 1,
        last_reply_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setReplyContent('');
      queryClient.invalidateQueries(['forum-replies', topicId]);
      queryClient.invalidateQueries(['forum-topic', topicId]);
    },
  });

  const upvoteReplyMutation = useMutation({
    mutationFn: async (replyId) => {
      const existingUpvote = userUpvotes.find(u => u.reply_id === replyId && u.upvote_type === 'reply');
      
      if (existingUpvote) {
        await base44.entities.ForumUpvote.delete(existingUpvote.id);
        const reply = replies.find(r => r.id === replyId);
        await base44.entities.ForumReply.update(replyId, {
          upvotes_count: Math.max(0, (reply?.upvotes_count || 1) - 1)
        });
      } else {
        await base44.entities.ForumUpvote.create({
          user_id: user.id,
          reply_id: replyId,
          upvote_type: 'reply'
        });
        const reply = replies.find(r => r.id === replyId);
        await base44.entities.ForumReply.update(replyId, {
          upvotes_count: (reply?.upvotes_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forum-replies', topicId]);
      queryClient.invalidateQueries(['user-forum-upvotes', user?.id]);
    },
  });

  if (!topic) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600">Loading discussion...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link to={createPageUrl('Community')} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </Link>

        {/* Topic */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge className="mb-3">{topic.category}</Badge>
                <CardTitle className="text-2xl mb-2">{topic.title}</CardTitle>
                <p className="text-sm text-gray-600">
                  By {topic.author_name} • {new Date(topic.created_date).toLocaleDateString()}
                </p>
              </div>
              {user && (
                <button
                  onClick={() => {
                    // Would need to implement topic upvote similarly
                  }}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{topic.upvotes_count || 0}</span>
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{topic.content}</p>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </h2>
          </div>

          {/* Reply Form */}
          {user && (
            <Card>
              <CardContent className="pt-6">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="mb-4 h-24"
                />
                <Button
                  onClick={() => replyMutation.mutate()}
                  disabled={replyMutation.isPending || !replyContent.trim()}
                  className="w-full"
                >
                  {replyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Post Reply
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Replies List */}
          <div className="space-y-4">
            {replies.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600">No replies yet. Be the first to respond!</p>
                </CardContent>
              </Card>
            ) : (
              replies.map(reply => {
                const hasUpvoted = userUpvotes.some(u => u.reply_id === reply.id && u.upvote_type === 'reply');
                
                return (
                  <Card key={reply.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{reply.author_name}</p>
                          <p className="text-xs text-gray-600">{new Date(reply.created_date).toLocaleDateString()}</p>
                        </div>
                        {reply.is_solution && (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Solution
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{reply.content}</p>
                      {user && (
                        <button
                          onClick={() => upvoteReplyMutation.mutate(reply.id)}
                          disabled={upvoteReplyMutation.isPending}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            hasUpvoted
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{reply.upvotes_count || 0}</span>
                        </button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}