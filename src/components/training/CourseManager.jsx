import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseManager({ trackId }) {
  const queryClient = useQueryClient();
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    estimated_hours: 1,
  });
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    order: 1,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', trackId],
    queryFn: () => base44.entities.TrainingCourse.filter({ track_id: trackId }),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', selectedCourse?.id],
    queryFn: () =>
      selectedCourse
        ? base44.entities.TrainingLesson.filter({ course_id: selectedCourse.id })
        : Promise.resolve([]),
    enabled: !!selectedCourse,
  });

  const createCourseMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.TrainingCourse.create({
        track_id: trackId,
        ...newCourse,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['courses', trackId]);
      toast.success('Course created!');
      setCourseDialogOpen(false);
      setNewCourse({ title: '', description: '', estimated_hours: 1 });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.TrainingLesson.create({
        course_id: selectedCourse.id,
        order: lessons.length + 1,
        ...newLesson,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons', selectedCourse.id]);
      toast.success('Lesson created!');
      setLessonDialogOpen(false);
      setNewLesson({ title: '', content: '', order: 1 });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      return await base44.entities.TrainingCourse.delete(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['courses', trackId]);
      toast.success('Course deleted');
      setSelectedCourse(null);
    },
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
          {selectedCourse && <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>}
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Courses
              </CardTitle>
              <Button
                onClick={() => setCourseDialogOpen(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                New Course
              </Button>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No courses yet</p>
              ) : (
                <div className="space-y-2">
                  {courses.map(course => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedCourse?.id === course.id
                          ? 'bg-indigo-50 border-indigo-300'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{course.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{course.estimated_hours}h</Badge>
                            <Badge className="bg-green-100 text-green-800">{course.status}</Badge>
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCourseMutation.mutate(course.id);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons Tab */}
        {selectedCourse && (
          <TabsContent value="lessons">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{selectedCourse.title} - Lessons</CardTitle>
                <Button
                  onClick={() => setLessonDialogOpen(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Lesson
                </Button>
              </CardHeader>
              <CardContent>
                {lessons.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No lessons yet</p>
                ) : (
                  <div className="space-y-2">
                    {lessons.map(lesson => (
                      <div key={lesson.id} className="p-3 border rounded-lg">
                        <p className="font-semibold">{lesson.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{lesson.content?.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Create Course Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Course Title</Label>
              <Input
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="e.g., Biblical Foundations 101"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Course overview"
              />
            </div>
            <div>
              <Label>Estimated Hours</Label>
              <Input
                type="number"
                value={newCourse.estimated_hours}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, estimated_hours: Number(e.target.value) })
                }
                min="0.5"
                step="0.5"
              />
            </div>
            <Button
              onClick={() => createCourseMutation.mutate()}
              disabled={createCourseMutation.isPending || !newCourse.title}
              className="w-full"
            >
              Create Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lesson to {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Lesson Title</Label>
              <Input
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                placeholder="Lesson name"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={newLesson.content}
                onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                placeholder="Lesson content (markdown supported)"
                rows={6}
              />
            </div>
            <Button
              onClick={() => createLessonMutation.mutate()}
              disabled={createLessonMutation.isPending || !newLesson.title}
              className="w-full"
            >
              Add Lesson
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}