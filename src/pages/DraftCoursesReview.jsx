import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Eye, CheckCircle, XCircle, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function DraftCoursesReview() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewingLesson, setViewingLesson] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.user_role !== 'admin') {
          toast.error('Access denied. Admin only.');
          window.location.href = '/Home';
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '/Home';
      }
    };
    fetchUser();
  }, []);

  const { data: draftCourses = [], isLoading } = useQuery({
    queryKey: ['draft-courses'],
    queryFn: () => base44.entities.TrainingCourse.filter({ status: 'draft' }, '-created_date'),
    enabled: !!user,
  });

  const { data: reviewCourses = [] } = useQuery({
    queryKey: ['review-courses'],
    queryFn: () => base44.entities.TrainingCourse.filter({ status: 'review' }, '-created_date'),
    enabled: !!user,
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.TrainingLesson.list(),
    enabled: !!user,
  });

  const { data: allQuizzes = [] } = useQuery({
    queryKey: ['all-quizzes'],
    queryFn: () => base44.entities.TrainingQuiz.list(),
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ courseId, newStatus }) => {
      await base44.entities.TrainingCourse.update(courseId, { status: newStatus });
      
      const courseLessons = allLessons.filter(l => l.course_id === courseId);
      for (const lesson of courseLessons) {
        await base44.entities.TrainingLesson.update(lesson.id, { status: newStatus });
      }
      
      const courseQuizzes = allQuizzes.filter(q => q.course_id === courseId);
      for (const quiz of courseQuizzes) {
        await base44.entities.TrainingQuiz.update(quiz.id, { status: newStatus });
      }
    },
    onSuccess: (_, variables) => {
      const action = variables.newStatus === 'published' ? 'published' : 
                     variables.newStatus === 'review' ? 'moved to review' : 'updated';
      toast.success(`Course ${action} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['draft-courses'] });
      queryClient.invalidateQueries({ queryKey: ['review-courses'] });
      queryClient.invalidateQueries({ queryKey: ['training-courses'] });
      setSelectedCourse(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId) => {
      const courseLessons = allLessons.filter(l => l.course_id === courseId);
      for (const lesson of courseLessons) {
        await base44.entities.TrainingLesson.delete(lesson.id);
      }
      
      const courseQuizzes = allQuizzes.filter(q => q.course_id === courseId);
      for (const quiz of courseQuizzes) {
        await base44.entities.TrainingQuiz.delete(quiz.id);
      }
      
      await base44.entities.TrainingCourse.delete(courseId);
    },
    onSuccess: () => {
      toast.success('Course deleted');
      queryClient.invalidateQueries({ queryKey: ['draft-courses'] });
      queryClient.invalidateQueries({ queryKey: ['review-courses'] });
      setSelectedCourse(null);
    },
  });

  const CourseCard = ({ course, showActions = true }) => {
    const courseLessons = allLessons.filter(l => l.course_id === course.id);
    const courseQuizzes = allQuizzes.filter(q => q.course_id === course.id);

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{course.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{course.description}</p>
            </div>
            <Badge className={course.status === 'draft' ? 'bg-gray-500' : 'bg-blue-500'}>
              {course.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">📚 {courseLessons.length} lessons</span>
            <span className="text-gray-600">📝 {courseQuizzes.length} quizzes</span>
            <span className="text-gray-600">⏱️ {course.estimated_hours}h</span>
          </div>

          {showActions && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedCourse(course)}>
                <Eye className="w-4 h-4 mr-2" />
                Review
              </Button>
              
              {course.status === 'draft' && (
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => updateStatusMutation.mutate({ courseId: course.id, newStatus: 'review' })}
                >
                  Move to Review
                </Button>
              )}
              
              {course.status === 'review' && (
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => updateStatusMutation.mutate({ courseId: course.id, newStatus: 'published' })}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  if (confirm('Delete this course and all its lessons?')) {
                    deleteMutation.mutate(course.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            Draft Courses Review
          </h1>
          <p className="text-gray-600 mt-2">
            Review AI-generated courses before publishing them to students
          </p>
        </div>

        <Tabs defaultValue="draft" className="space-y-6">
          <TabsList>
            <TabsTrigger value="draft">
              Draft ({draftCourses.length})
            </TabsTrigger>
            <TabsTrigger value="review">
              In Review ({reviewCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draft" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : draftCourses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No draft courses</p>
                </CardContent>
              </Card>
            ) : (
              draftCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {reviewCourses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No courses in review</p>
                </CardContent>
              </Card>
            ) : (
              reviewCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedCourse && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedCourse.title}</DialogTitle>
                  <DialogDescription>{selectedCourse.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Lessons</h3>
                  {allLessons
                    .filter(l => l.course_id === selectedCourse.id)
                    .sort((a, b) => a.order - b.order)
                    .map((lesson, idx) => (
                      <Card key={lesson.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                {idx + 1}. {lesson.title}
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                {lesson.estimated_minutes} min • {lesson.scripture_references?.length || 0} verses
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setViewingLesson(lesson)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Lesson Content Dialog */}
        <Dialog open={!!viewingLesson} onOpenChange={() => setViewingLesson(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {viewingLesson && (
              <>
                <DialogHeader>
                  <DialogTitle>{viewingLesson.title}</DialogTitle>
                </DialogHeader>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{viewingLesson.content}</ReactMarkdown>
                </div>
                {viewingLesson.scripture_references?.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Scripture References:</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingLesson.scripture_references.map((ref, idx) => (
                        <Badge key={idx} variant="outline">{ref}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}