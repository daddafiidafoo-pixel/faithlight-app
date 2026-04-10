import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, Pin } from 'lucide-react';

export default function NoteTaker({ lessonId, courseId, userId }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['lesson-notes', userId, lessonId],
    queryFn: async () => {
      const userNotes = await base44.entities.LessonNote.filter(
        { user_id: userId, lesson_id: lessonId },
        '-is_pinned,-created_date'
      );
      return userNotes || [];
    },
    enabled: !!userId && !!lessonId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.LessonNote.create({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        title: title || 'Untitled Note',
        content,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-notes', userId, lessonId] });
      setTitle('');
      setContent('');
      setTags('');
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId) => {
      await base44.entities.LessonNote.delete(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-notes', userId, lessonId] });
    },
  });

  const pinMutation = useMutation({
    mutationFn: async (note) => {
      await base44.entities.LessonNote.update(note.id, {
        is_pinned: !note.is_pinned,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-notes', userId, lessonId] });
    },
  });

  if (isLoading) {
    return <div className="text-gray-600 py-4">Loading notes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          My Notes ({notes.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* New Note Button */}
        {!showForm ? (
          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
            className="w-full gap-2 justify-start text-gray-600"
          >
            <Plus className="w-4 h-4" />
            Add a note...
          </Button>
        ) : (
          <div className="bg-indigo-50 p-4 rounded-lg space-y-3 border border-indigo-200">
            <Input
              placeholder="Note title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
            />
            <Textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-24 text-sm"
            />
            <Input
              placeholder="Tags (comma-separated, optional)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setTitle('');
                  setContent('');
                  setTags('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!content.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-3 mt-6">
          {notes.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">
              No notes yet. Start taking notes to keep track of key concepts!
            </p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-3 space-y-2 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {note.title && (
                      <h4 className="font-semibold text-gray-900 text-sm">{note.title}</h4>
                    )}
                    <p className="text-sm text-gray-700 line-clamp-2 mt-1">{note.content}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => pinMutation.mutate(note)}
                      className={`p-1.5 rounded transition-colors ${
                        note.is_pinned
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-400 hover:text-yellow-600'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(note.id)}
                      className="p-1.5 rounded bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  {new Date(note.created_date).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}