import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Plus, Loader2, Heart, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/**
 * Course forum for group discussions
 * Supports topics, replies, likes, instructor answers
 */
export default function CourseForum({ courseId, courseName, currentUser }) {
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newTopicData, setNewTopicData] = useState({ title: '', content: '', category: 'general' });
  const [replyContent, setReplyContent] = useState('');
  const queryClient = useQueryClient();

  // Get forum topics
  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['course-forum', courseId],
    queryFn: async () => {
      return await base44.entities.CourseForumTopic.filter(
        { course_id: courseId },
        '-last_reply_at'
      );
    },
  });

  // Get topic replies
  const { data: replies = [] } = useQuery({
    queryKey: ['forum-replies', selectedTopic?.id],
    queryFn: async () => {
      if (!selectedTopic) return [];
      return await base44.entities.CourseForumReply.filter(
        { topic_id: selectedTopic.id },
        'created_at'
      );
    },
    enabled: !!selectedTopic,
  });

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async () => {
      const topic = await base44.entities.CourseForumTopic.create({
        course_id: courseId,
        user_id: currentUser.id,
        title: newTopicData.title,
        content: newTopicData.content,
        category: newTopicData.category,
      });
      return topic;
    },
    onSuccess: () => {
      setNewTopicData({ title: '', content: '', category: 'general' });
      setShowNewTopic(false);
      queryClient.invalidateQueries({ queryKey: ['course-forum'] });
    },
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async () => {
      const reply = await base44.entities.CourseForumReply.create({
        topic_id: selectedTopic.id,
        user_id: currentUser.id,
        content: replyContent,
      });

      // Update reply count
      await base44.entities.CourseForumTopic.update(selectedTopic.id, {
        reply_count: (selectedTopic.reply_count || 0) + 1,
        last_reply_at: new Date().toISOString(),
      });

      return reply;
    },
    onSuccess: () => {
      setReplyContent('');
      queryClient.invalidateQueries({ queryKey: ['forum-replies'] });
      queryClient.invalidateQueries({ queryKey: ['course-forum'] });
    },
  });

  // Like reply
  const likeReplyMutation = useMutation({
    mutationFn: async (reply) => {
      const alreadyLiked = reply.liked_by?.includes(currentUser.id);
      const newLikedBy = alreadyLiked
        ? reply.liked_by.filter(id => id !== currentUser.id)
        : [...(reply.liked_by || []), currentUser.id];

      await base44.entities.CourseForumReply.update(reply.id, {
        liked_by: newLikedBy,
        likes_count: newLikedBy.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies'] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{courseName} Forum</h2>
        <Button onClick={() => setShowNewTopic(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Topic
        </Button>
      </div>

      {/* New Topic Dialog */}
      <Dialog open={showNewTopic} onOpenChange={setShowNewTopic}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Discussion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Topic Title</label>
              <input
                type="text"
                value={newTopicData.title}
                onChange={(e) => setNewTopicData({ ...newTopicData, title: e.target.value })}
                placeholder="What would you like to discuss?"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={newTopicData.category}
                onChange={(e) => setNewTopicData({ ...newTopicData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lesson_discussion">Lesson Discussion</option>
                <option value="question">Question</option>
                <option value="resource_share">Share Resource</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={newTopicData.content}
                onChange={(e) => setNewTopicData({ ...newTopicData, content: e.target.value })}
                placeholder="Share your thoughts..."
                rows="4"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewTopic(false)}>Cancel</Button>
              <Button
                onClick={() => createTopicMutation.mutate()}
                disabled={!newTopicData.title || !newTopicData.content || createTopicMutation.isPending}
              >
                {createTopicMutation.isPending ? 'Creating...' : 'Create Topic'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Topics List */}
      {!selectedTopic ? (
        <div className="space-y-3">
          {topics.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No discussions yet. Be the first to start!
              </CardContent>
            </Card>
          ) : (
            topics.map((topic) => (
              <Card
                key={topic.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTopic(topic)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                        {topic.is_pinned && <Badge className="bg-yellow-100 text-yellow-800">Pinned</Badge>}
                        {topic.is_locked && <Badge className="bg-red-100 text-red-800 gap-1"><Lock className="w-3 h-3" />Locked</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{topic.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {topic.reply_count} replies
                        </span>
                        <span>{topic.view_count} views</span>
                        <Badge variant="outline" className="text-xs">
                          {topic.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Topic Detail View */
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setSelectedTopic(null)}>← Back to Topics</Button>

          <Card>
            <CardHeader>
              <CardTitle>{selectedTopic.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{selectedTopic.content}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant="outline">{selectedTopic.category}</Badge>
                <span>{new Date(selectedTopic.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Replies ({replies.length})</h3>
            {replies.map((reply) => (
              <Card key={reply.id}>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 mb-3">{reply.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => likeReplyMutation.mutate(reply)}
                      className={`gap-1 ${
                        reply.liked_by?.includes(currentUser.id)
                          ? 'text-red-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <Heart className="w-4 h-4" fill={reply.liked_by?.includes(currentUser.id) ? 'currentColor' : 'none'} />
                      {reply.likes_count || 0}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Form */}
          {!selectedTopic.is_locked && (
            <Card>
              <CardContent className="p-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={() => createReplyMutation.mutate()}
                  disabled={!replyContent.trim() || createReplyMutation.isPending}
                  className="w-full"
                >
                  {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}