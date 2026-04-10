import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateTopicModal({
  courseId,
  lessonId,
  userId,
  onTopicCreated,
  onClose,
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !content.trim()) {
        throw new Error('Title and content are required');
      }

      const topicData = {
        course_id: courseId,
        lesson_id: lessonId,
        title: title.trim(),
        content: content.trim(),
        author_id: userId || user?.id,
        author_name: user?.full_name || 'Anonymous',
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      };

      return await base44.entities.CourseForumTopic.create(topicData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-forum-topics', courseId]);
      onTopicCreated();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Start a New Discussion</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-2">
              Topic Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or topic?"
              disabled={createMutation.isPending}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-2">
              Your Message *
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or insights..."
              rows={6}
              disabled={createMutation.isPending}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-2">
              Tags (Optional)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., question, resource, discussion (comma separated)"
              disabled={createMutation.isPending}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !title.trim() || !content.trim()}
              className="gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Post Topic'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}