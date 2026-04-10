import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Pin, Lock, Trash2, EyeOff, CheckCircle2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ReactMarkdown from 'react-markdown';

export default function ForumTopic() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const topicId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    fetchUser();
  }, []);

  const { data: topic, isLoading } = useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async () => {
      const topics = await base44.entities.ForumTopic.filter({ id: topicId });
      const topic = topics[0];
      if (topic) {
        await base44.entities.ForumTopic.update(topicId, {
          views_count: (topic.views_count || 0) + 1
        });
      }
      return topic;
    },
    enabled: !!topicId,
  });

  const { data: replies = [], refetch: refetchReplies } = useQuery({
    queryKey: ['forum-replies', topicId],
    queryFn: () => base44.entities.ForumReply.filter({ topic_id: topicId, status: 'active' }, 'created_date'),
    enabled: !!topicId,
  });

  const createReplyMutation = useMutation({
    mutationFn: async (content) => {
      const reply = await base44.entities.ForumReply.create({
        topic_id: topicId,
        content,
        author_id: user.id,
        author_name: user.full_name,
      });
      await base44.entities.ForumTopic.update(topicId, {
        replies_count: (topic.replies_count || 0) + 1,
        last_reply_date: new Date().toISOString(),
      });
      return reply;
    },
    onSuccess: () => {
      setReplyContent('');
      refetchReplies();
      queryClient.invalidateQueries(['forum-topic', topicId]);
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: () => base44.entities.ForumTopic.update(topicId, { is_pinned: !topic.is_pinned }),
    onSuccess: () => queryClient.invalidateQueries(['forum-topic', topicId]),
  });

  const toggleLockMutation = useMutation({
    mutationFn: () => base44.entities.ForumTopic.update(topicId, { is_locked: !topic.is_locked }),
    onSuccess: () => queryClient.invalidateQueries(['forum-topic', topicId]),
  });

  const hideTopicMutation = useMutation({
    mutationFn: () => base44.entities.ForumTopic.update(topicId, { status: 'hidden' }),
    onSuccess: () => navigate(createPageUrl('Forum')),
  });

  const hideReplyMutation = useMutation({
    mutationFn: (replyId) => base44.entities.ForumReply.update(replyId, { status: 'hidden' }),
    onSuccess: () => refetchReplies(),
  });

  const markSolutionMutation = useMutation({
    mutationFn: async (replyId) => {
      await Promise.all(
        replies.map(r => base44.entities.ForumReply.update(r.id, { is_solution: r.id === replyId }))
      );
    },
    onSuccess: () => refetchReplies(),
  });

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    if (topic.is_locked) {
      alert('This topic is locked');
      return;
    }
    createReplyMutation.mutate(replyContent);
  };

  const isAdmin = user?.user_role === 'admin';
  const isTopicAuthor = user?.id === topic?.author_id;

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
              </div>
            </CardContent>
          </Card>
          {[1, 2, 3].map(i => (
            <Card key={i} className="mb-4">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!topic || topic.status !== 'active') {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Topic Not Available</h2>
              <p className="text-gray-600 mb-6">
                {!topic ? 'This topic could not be found.' : 'This topic has been removed or is no longer active.'}
              </p>
              <Button onClick={() => navigate(createPageUrl('Forum'))}>
                Back to Forum
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Topic */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {topic.is_pinned && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  {topic.is_locked && (
                    <Badge variant="outline">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-3xl mb-4">{topic.title}</CardTitle>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium">{topic.author_name}</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(topic.created_date).toLocaleString()}</span>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePinMutation.mutate()}
                  >
                    <Pin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLockMutation.mutate()}
                  >
                    <Lock className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => hideTopicMutation.mutate()}
                    className="text-red-600"
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <ReactMarkdown>{topic.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>
          {replies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No replies yet</p>
                <p className="text-sm text-gray-500">Be the first to share your thoughts!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {replies.map(reply => (
              <Card key={reply.id} className={reply.is_solution ? 'border-green-500 border-2' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{reply.author_name}</span>
                          {reply.is_solution && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Solution
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {new Date(reply.created_date).toLocaleString()}
                          </span>
                          {(isAdmin || isTopicAuthor) && !reply.is_solution && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markSolutionMutation.mutate(reply.id)}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => hideReplyMutation.mutate(reply.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{reply.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Post a Reply</CardTitle>
            </CardHeader>
            <CardContent>
              {topic.is_locked ? (
                <p className="text-gray-600 text-center py-4">This topic is locked and no longer accepts replies.</p>
              ) : (
                <>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={5}
                    className="mb-4"
                  />
                  <Button
                    onClick={handleSubmitReply}
                    disabled={createReplyMutation.isPending || !replyContent.trim()}
                  >
                    {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600 mb-4">Please log in to reply to this topic</p>
              <Button onClick={() => base44.auth.redirectToLogin()}>Log In</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}