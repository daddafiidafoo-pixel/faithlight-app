import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, X, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AnnouncementManager({ courseId, teacherId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcement_type: 'general',
  });
  const [error, setError] = useState('');

  // Fetch announcements
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['course-announcements', courseId],
    queryFn: async () => {
      const result = await base44.entities.CourseAnnouncement.filter(
        { course_id: courseId },
        '-sent_at',
        100
      );
      return result || [];
    },
    enabled: !!courseId,
  });

  // Create announcement
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!formData.title.trim() || !formData.content.trim()) {
        throw new Error('Title and content are required');
      }

      return await base44.entities.CourseAnnouncement.create({
        course_id: courseId,
        teacher_id: teacherId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        announcement_type: formData.announcement_type,
        is_pinned: false,
        sent_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-announcements', courseId]);
      setFormData({ title: '', content: '', announcement_type: 'general' });
      setShowForm(false);
      setError('');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Pin/unpin announcement
  const pinMutation = useMutation({
    mutationFn: (announcementId) => {
      const announcement = announcements.find((a) => a.id === announcementId);
      return base44.entities.CourseAnnouncement.update(announcementId, {
        is_pinned: !announcement.is_pinned,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-announcements', courseId]);
    },
  });

  // Delete announcement
  const deleteMutation = useMutation({
    mutationFn: (announcementId) =>
      base44.entities.CourseAnnouncement.delete(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-announcements', courseId]);
    },
  });

  const handleSubmit = () => {
    createMutation.mutate();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'important':
        return 'bg-red-100 text-red-800';
      case 'assignment':
        return 'bg-blue-100 text-blue-800';
      case 'deadline':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Announcement */}
      {showForm ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create Announcement</CardTitle>
            <button
              onClick={() => setShowForm(false)}
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
                Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Announcement title"
                disabled={createMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">
                Type
              </label>
              <select
                value={formData.announcement_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    announcement_type: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
                disabled={createMutation.isPending}
              >
                <option value="general">General</option>
                <option value="assignment">Assignment</option>
                <option value="deadline">Deadline</option>
                <option value="important">Important</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">
                Content
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write your announcement..."
                rows={5}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || !formData.title.trim()}
                className="gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Publish Announcement
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </Button>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">
          Recent Announcements ({announcements.length})
        </h3>

        {isLoading ? (
          <Card>
            <CardContent className="py-8 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </CardContent>
          </Card>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              No announcements yet
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.is_pinned && (
                        <Badge variant="outline">📌 Pinned</Badge>
                      )}
                      <Badge className={getTypeColor(announcement.announcement_type)}>
                        {announcement.announcement_type}
                      </Badge>
                    </div>

                    <h4 className="font-semibold text-gray-900">
                      {announcement.title}
                    </h4>
                    <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(announcement.sent_at).toLocaleDateString()} at{' '}
                      {new Date(announcement.sent_at).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-col">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => pinMutation.mutate(announcement.id)}
                      disabled={pinMutation.isPending}
                    >
                      {announcement.is_pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(announcement.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}