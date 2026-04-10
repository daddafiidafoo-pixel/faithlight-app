import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Lock, Trash2, Flag, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ForumModerationPanel({ courseId }) {
  const queryClient = useQueryClient();
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [moderationNotes, setModerationNotes] = useState('');

  // Fetch flagged posts
  const { data: flaggedPosts = [], isLoading: flaggedLoading } = useQuery({
    queryKey: ['flagged-posts', courseId],
    queryFn: async () => {
      const result = await base44.entities.CourseForumPost.filter(
        { course_id: courseId, is_flagged: true },
        '-created_date',
        100
      );
      return result || [];
    },
  });

  // Fetch unapproved posts
  const { data: unapprovedPosts = [], isLoading: unapprovedLoading } = useQuery({
    queryKey: ['unapproved-posts', courseId],
    queryFn: async () => {
      const result = await base44.entities.CourseForumPost.filter(
        { course_id: courseId, is_approved: false },
        '-created_date',
        100
      );
      return result || [];
    },
  });

  // Fetch all topics for locking
  const { data: allTopics = [] } = useQuery({
    queryKey: ['all-forum-topics', courseId],
    queryFn: async () => {
      const result = await base44.entities.CourseForumTopic.filter(
        { course_id: courseId },
        '-created_date',
        200
      );
      return result || [];
    },
  });

  // Lock/unlock topic
  const lockTopicMutation = useMutation({
    mutationFn: async (topicId) => {
      const topic = allTopics.find((t) => t.id === topicId);
      return await base44.entities.CourseForumTopic.update(topicId, {
        is_locked: !topic.is_locked,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-forum-topics', courseId]);
      queryClient.invalidateQueries(['course-forum-topic']);
    },
  });

  // Pin/unpin topic
  const pinTopicMutation = useMutation({
    mutationFn: async (topicId) => {
      const topic = allTopics.find((t) => t.id === topicId);
      return await base44.entities.CourseForumTopic.update(topicId, {
        is_pinned: !topic.is_pinned,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-forum-topics', courseId]);
      queryClient.invalidateQueries(['course-forum-topics', courseId]);
    },
  });

  // Approve post
  const approvePostMutation = useMutation({
    mutationFn: (postId) =>
      base44.entities.CourseForumPost.update(postId, { is_approved: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['unapproved-posts', courseId]);
      queryClient.invalidateQueries(['course-forum-posts']);
    },
  });

  // Delete post
  const deletePostMutation = useMutation({
    mutationFn: (postId) =>
      base44.entities.CourseForumPost.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['flagged-posts', courseId]);
      queryClient.invalidateQueries(['unapproved-posts', courseId]);
      queryClient.invalidateQueries(['course-forum-posts']);
    },
  });

  // Unflag post
  const unflagPostMutation = useMutation({
    mutationFn: (postId) =>
      base44.entities.CourseForumPost.update(postId, {
        is_flagged: false,
        flag_reason: null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['flagged-posts', courseId]);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Forum Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flagged" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="flagged">
              Flagged ({flaggedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="unapproved">
              Unapproved ({unapprovedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="topics">Manage Topics</TabsTrigger>
          </TabsList>

          {/* Flagged Posts */}
          <TabsContent value="flagged" className="space-y-3">
            {flaggedLoading ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : flaggedPosts.length === 0 ? (
              <p className="text-gray-600 text-sm">No flagged posts</p>
            ) : (
              flaggedPosts.map((post) => (
                <div
                  key={post.id}
                  className="border rounded-lg p-3 bg-red-50 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {post.author_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Reason: {post.flag_reason || 'Not specified'}
                      </p>
                    </div>
                    <Badge variant="destructive">Flagged</Badge>
                  </div>

                  <p className="text-sm text-gray-700">{post.content}</p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => unflagPostMutation.mutate(post.id)}
                      disabled={unflagPostMutation.isPending}
                    >
                      Clear Flag
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePostMutation.mutate(post.id)}
                      disabled={deletePostMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Unapproved Posts */}
          <TabsContent value="unapproved" className="space-y-3">
            {unapprovedLoading ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : unapprovedPosts.length === 0 ? (
              <p className="text-gray-600 text-sm">No pending approvals</p>
            ) : (
              unapprovedPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-3 bg-yellow-50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {post.author_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(post.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>

                  <p className="text-sm text-gray-700">{post.content}</p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => approvePostMutation.mutate(post.id)}
                      disabled={approvePostMutation.isPending}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePostMutation.mutate(post.id)}
                      disabled={deletePostMutation.isPending}
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Manage Topics */}
          <TabsContent value="topics" className="space-y-3">
            {allTopics.length === 0 ? (
              <p className="text-gray-600 text-sm">No topics yet</p>
            ) : (
              allTopics.map((topic) => (
                <div key={topic.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {topic.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {topic.reply_count} replies
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {topic.is_pinned && <Badge variant="outline" className="text-xs">Pinned</Badge>}
                      {topic.is_locked && <Badge variant="destructive" className="text-xs">Locked</Badge>}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => pinTopicMutation.mutate(topic.id)}
                      disabled={pinTopicMutation.isPending}
                      className="flex-1"
                    >
                      {topic.is_pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => lockTopicMutation.mutate(topic.id)}
                      disabled={lockTopicMutation.isPending}
                      className="flex-1 gap-1"
                    >
                      <Lock className="w-3 h-3" />
                      {topic.is_locked ? 'Unlock' : 'Lock'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}