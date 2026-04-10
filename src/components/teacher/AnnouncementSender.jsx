import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Loader2, Pin, AlertCircle } from 'lucide-react';

export default function AnnouncementSender({ courseId, teacherId, onSuccess }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');
  const [isPinned, setIsPinned] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      base44.entities.CourseAnnouncement.create({
        course_id: courseId,
        teacher_id: teacherId,
        title,
        content,
        announcement_type: type,
        is_pinned: isPinned,
        sent_at: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-announcements', courseId]);
      setTitle('');
      setContent('');
      setType('general');
      setIsPinned(false);
      if (onSuccess) onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send Announcement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Title
            </label>
            <Input
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Content
            </label>
            <Textarea
              placeholder="Write your announcement here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Type
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant={isPinned ? 'default' : 'outline'}
                className="w-full gap-2"
                onClick={() => setIsPinned(!isPinned)}
              >
                <Pin className="w-4 h-4" />
                {isPinned ? 'Pinned' : 'Pin to Top'}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!title.trim() || !content.trim() || createMutation.isPending}
            className="w-full gap-2"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to Students
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}