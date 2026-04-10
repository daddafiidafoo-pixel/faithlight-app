import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Lock, Trash2, Flag, ThumbsUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CourseForumTopicView({
  topicId,
  courseId,
  onBackClick,
  userId,
  userRole,
}) {
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // Fetch topic
  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ['course-forum-topic', topicId],
    queryFn: async () => {
      const topics = await base44.entities.CourseForumTopic.filter(
        { id: topicId },
        null,
        1
      );
      if (topics.length > 0) {
        // Increment view count
        await base44.entities.CourseForumTopic.update(topicId, {
          view_count: (topics[0].view_count || 0) + 1,
        });
      }
      return topics[0];
    },
  });

  // Fetch posts/replies
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['course-forum-posts', topicId],
    queryFn: async () => {
      const result = await base44.entities.CourseForumPost.filter(
        { topic_id: topicId, is_approved: true },
        'created_date',
        500
      );
      return result || [];
    },
    enabled: !!topicId,
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async () => {
      if (!replyContent.trim()) {
        throw new Error('Reply content is required');
      }

      const postData = {
        topic_id: topicId,
        course_id: courseId,
        content: replyContent.trim(),
        author_id: userId || user?.id,
        author_name: user?.full_name || 'Anonymous',
        is_instructor: ['teacher', 'admin'].includes(user?.user_role),
      };

      await base44.entities.CourseForumPost.create(postData);

      // Update topic reply count and last reply
      if (topic) {
        await base44.entities.CourseForumTopic.update(topicId, {
          reply_count: (topic.reply_count || 0) + 1,
          last_reply_at: new Date().toISOString(),
          last_reply_by: user?.id,
        });
      }
    },
    onSuccess: () => {
      setReplyContent('');
      refetchPosts();
      queryClient.invalidateQueries(['course-forum-topics', courseId]);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId) => base44.entities.CourseForumPost.delete(postId),
    onSuccess: () => {
      refetchPosts();
    },
  });

  if (topicLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading discussion...</span>
        </CardContent>
      </Card>
    );
  }

  if (!topic) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600 mb-4">Discussion not found</p>
          <Button onClick={onBackClick} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button onClick={onBackClick} variant="outline" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Forum
      </Button>

      {/* Topic Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {topic.is_locked && (
                  <Badge variant="destructive" className="flex-shrink-0">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                )}
                {topic.is_pinned && (
                  <Badge variant="outline" className="flex-shrink-0">
                    Pinned
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{topic.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Started by <strong>{topic.author_name}</strong> •{' '}
                {new Date(topic.created_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{topic.content}</p>
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {topic.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts/Replies */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">
          {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
        </h3>

        {postsLoading ? (
          <Card>
            <CardContent className="pt-6 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              No replies yet. Be the first to respond!
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <strong className="text-gray-900">{post.author_name}</strong>
                      {post.is_instructor && (
                        <Badge variant="default" className="text-xs">
                          Instructor
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    {post.is_edited && (
                      <p className="text-xs text-gray-500 mt-2 italic">Edited</p>
                    )}
                  </div>

                  {/* Actions */}
                  {user?.id === post.author_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePostMutation.mutate(post.id)}
                      disabled={deletePostMutation.isPending}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Section */}
      {!topic.is_locked ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Your Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts or answer..."
              rows={5}
              disabled={createReplyMutation.isPending}
            />

            <Button
              onClick={() => createReplyMutation.mutate()}
              disabled={
                createReplyMutation.isPending || !replyContent.trim()
              }
              className="gap-2"
            >
              {createReplyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Reply'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <Lock className="w-4 h-4" />
          <AlertDescription>
            This discussion is locked. No new replies can be posted.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}